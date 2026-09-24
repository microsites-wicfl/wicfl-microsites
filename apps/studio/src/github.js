// Thin GitHub REST client. Every call goes through `fetcher`, which is the global fetch in
// production and an in-memory fake in tests.

export class GitHubError extends Error {
  constructor(status, detail) {
    super(`GitHub ${status}: ${String(detail).slice(0, 300)}`);
    this.status = status;
  }
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export class GitHub {
  constructor(env, fetcher = fetch) {
    this.env = env;
    // Never call the platform fetch as a method of this object: in Workers, fetch invoked with a
    // foreign `this` throws "Illegal invocation" before any request leaves. Wrap it instead.
    this.fetcher = (input, init) => fetcher(input, init);
    this.repo = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`;
  }

  async request(path, { method = "GET", body } = {}) {
    // A secret pasted with a trailing space or newline makes fetch reject the header outright.
    const token = String(this.env.GITHUB_TOKEN || "").trim();
    if (!token) throw new Error("GITHUB_TOKEN is not set on the Worker");
    const response = await this.fetcher(`https://api.github.com${path}`, {
      method,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "user-agent": "wicfl-studio/1.0",
        "x-github-api-version": "2022-11-28",
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new GitHubError(response.status, await response.text());
    return response.status === 204 ? null : response.json();
  }

  // Returns null instead of throwing when GitHub answers 404.
  async optional(path) {
    try {
      return await this.request(path);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async branchSha(branch) {
    const ref = await this.optional(`${this.repo}/git/ref/heads/${branch}`);
    return ref ? ref.object.sha : null;
  }

  createBranch(branch, sha) {
    return this.request(`${this.repo}/git/refs`, {
      method: "POST",
      body: { ref: `refs/heads/${branch}`, sha },
    });
  }

  deleteBranch(branch) {
    return this.request(`${this.repo}/git/refs/heads/${branch}`, { method: "DELETE" });
  }

  async draftBranchNames() {
    const refs = (await this.optional(`${this.repo}/git/matching-refs/heads/draft/`)) || [];
    return refs.map((ref) => ref.ref.replace("refs/heads/", ""));
  }

  async readFile(path, ref) {
    const item = await this.optional(`${this.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
    if (!item || Array.isArray(item)) return null;
    return { text: fromBase64(item.content), sha: item.sha };
  }

  async listDirectory(path, ref) {
    const items = await this.optional(`${this.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
    return Array.isArray(items) ? items : [];
  }

  writeFile(path, { text, sha, branch, message }) {
    return this.request(`${this.repo}/contents/${path}`, {
      method: "PUT",
      body: { message, content: toBase64(text), sha, branch },
    });
  }

  deleteFile(path, { sha, branch, message }) {
    return this.request(`${this.repo}/contents/${path}`, {
      method: "DELETE",
      body: { message, sha, branch },
    });
  }

  async treePaths(commitSha) {
    const tree = await this.request(`${this.repo}/git/trees/${commitSha}?recursive=1`);
    return tree.tree.filter((item) => item.type === "blob").map((item) => item.path);
  }

  async changedFiles(base, head) {
    const comparison = await this.request(`${this.repo}/compare/${base}...${head}`);
    return (comparison.files || []).map((file) => file.filename);
  }

  openPulls(branch) {
    const head = encodeURIComponent(`${this.env.GITHUB_OWNER}:${branch}`);
    return this.request(`${this.repo}/pulls?state=open&head=${head}`);
  }

  createPull({ branch, title, body }) {
    return this.request(`${this.repo}/pulls`, {
      method: "POST",
      body: { head: branch, base: this.env.GITHUB_BASE_BRANCH, title, body },
    });
  }

  closePull(number) {
    return this.request(`${this.repo}/pulls/${number}`, { method: "PATCH", body: { state: "closed" } });
  }

  pullComments(number) {
    return this.request(`${this.repo}/issues/${number}/comments?per_page=100`);
  }

  // Jobs of every Actions run on this commit ({ name, status, conclusion }). Read through the
  // Actions API rather than /check-runs: fine-grained tokens can be granted "Actions: read" but
  // GitHub does not offer them the "Checks" permission.
  async checkRuns(sha) {
    const result = await this.request(`${this.repo}/actions/runs?head_sha=${sha}&per_page=100`);
    const jobs = await Promise.all(
      (result.workflow_runs || []).map((run) => this.request(`${this.repo}/actions/runs/${run.id}/jobs?per_page=100`)),
    );
    return jobs.flatMap((page) => page.jobs || []);
  }
}
