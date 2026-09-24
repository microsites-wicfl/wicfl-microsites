// In-memory stand-in for the parts of the GitHub REST API that Studio uses. It keeps real
// branches with their own file sets, so tests exercise actual flows (branch from main, commit,
// compare, pull requests) instead of canned responses.
import { createHash } from "node:crypto";
import { posix } from "node:path";

const sha = (value) => createHash("sha1").update(value).digest("hex");

export class FakeGitHub {
  constructor(files = {}) {
    this.branches = new Map([["main", { files: { ...files }, head: "c-main-0", commits: [] }]]);
    this.pulls = [];
    this.comments = new Map();
    this.checkRunsBySha = new Map();
    this.commitCounter = 0;
    this.calls = [];
    this.fetch = this.fetch.bind(this);
  }

  headOf(branch) {
    return this.branches.get(branch)?.head;
  }

  commitsOn(branch) {
    return this.branches.get(branch)?.commits || [];
  }

  addComment(number, body) {
    this.comments.set(number, [...(this.comments.get(number) || []), { id: this.comments.size + 1, body }]);
  }

  setCheckRuns(commitSha, runs) {
    this.checkRunsBySha.set(commitSha, runs);
  }

  branchByHead(ref) {
    for (const [name, branch] of this.branches) if (branch.head === ref || name === ref) return branch;
    return null;
  }

  async fetch(input, init = {}) {
    const url = new URL(input);
    const method = init.method || "GET";
    const body = init.body ? JSON.parse(init.body) : undefined;
    this.calls.unshift({ method, path: url.pathname + url.search, body });
    const path = url.pathname.replace("/repos/owner/repo", "");
    const result = this.handle(method, path, url.searchParams, body);
    const status = result.status || 200;
    return new Response(status === 204 ? null : JSON.stringify(result.body ?? {}), { status });
  }

  handle(method, path, query, body) {
    let match;
    const notFound = { status: 404, body: { message: "Not Found" } };

    if ((match = path.match(/^\/git\/ref\/heads\/(.+)$/)) && method === "GET") {
      const branch = this.branches.get(match[1]);
      return branch ? { body: { object: { sha: branch.head } } } : notFound;
    }
    if (path === "/git/refs" && method === "POST") {
      const name = body.ref.replace("refs/heads/", "");
      if (this.branches.has(name)) return { status: 422, body: { message: "Reference already exists" } };
      const source = this.branchByHead(body.sha);
      this.branches.set(name, { files: { ...source.files }, head: body.sha, commits: [], base: source });
      return { status: 201, body: {} };
    }
    if ((match = path.match(/^\/git\/refs\/heads\/(.+)$/)) && method === "DELETE") {
      if (!this.branches.has(match[1])) return { status: 422, body: { message: "Reference does not exist" } };
      this.branches.delete(match[1]);
      return { status: 204 };
    }
    if ((match = path.match(/^\/git\/matching-refs\/heads\/(.*)$/))) {
      const refs = [...this.branches.keys()].filter((name) => name.startsWith(match[1]));
      return { body: refs.map((name) => ({ ref: `refs/heads/${name}` })) };
    }
    if ((match = path.match(/^\/git\/trees\/(.+)$/))) {
      const branch = this.branchByHead(match[1]);
      if (!branch) return notFound;
      return { body: { tree: Object.keys(branch.files).map((file) => ({ path: file, type: "blob" })) } };
    }
    if ((match = path.match(/^\/contents\/(.+)$/))) {
      // GitHub resolves ".." segments, so the fake does too: a missing guard must be caught.
      const file = posix.normalize(decodeURIComponent(match[1]));
      const branchName = method === "PUT" ? body.branch : query.get("ref");
      const branch = this.branches.get(branchName);
      if (!branch) return notFound;
      if (method === "PUT") {
        const current = branch.files[file];
        if (current !== undefined && body.sha !== sha(current))
          return { status: 409, body: { message: "conflict" } };
        branch.files[file] = Buffer.from(body.content, "base64").toString("utf8");
        branch.head = `c-${++this.commitCounter}`;
        branch.commits = [...branch.commits, { message: body.message, file }];
        return { body: { content: { sha: sha(branch.files[file]) } } };
      }
      if (branch.files[file] !== undefined) {
        const text = branch.files[file];
        return { body: { type: "file", sha: sha(text), content: Buffer.from(text).toString("base64") } };
      }
      const prefix = `${file}/`;
      const children = new Map();
      for (const name of Object.keys(branch.files).filter((item) => item.startsWith(prefix))) {
        const [first, ...more] = name.slice(prefix.length).split("/");
        children.set(first, more.length > 0 ? "dir" : "file");
      }
      if (children.size === 0) return notFound;
      return { body: [...children].map(([name, type]) => ({ name, type })) };
    }
    if ((match = path.match(/^\/compare\/([^.]+)\.\.\.(.+)$/))) {
      const base = this.branches.get(match[1]);
      const head = this.branches.get(match[2]);
      if (!base || !head) return notFound;
      const names = new Set([...Object.keys(head.files), ...Object.keys((head.base || base).files)]);
      const reference = (head.base || base).files;
      const files = [...names]
        .filter((name) => head.files[name] !== reference[name])
        .map((filename) => ({ filename }));
      return { body: { ahead_by: head.commits.length, files } };
    }
    if (path === "/pulls" && method === "GET") {
      const head = query.get("head").split(":")[1];
      return { body: this.pulls.filter((pull) => pull.state === "open" && pull.head === head) };
    }
    if (path === "/pulls" && method === "POST") {
      const pull = {
        number: this.pulls.length + 1,
        state: "open",
        head: body.head,
        title: body.title,
        body: body.body,
      };
      this.pulls = [...this.pulls, pull];
      return { status: 201, body: pull };
    }
    if ((match = path.match(/^\/pulls\/(\d+)$/)) && method === "PATCH") {
      const pull = this.pulls.find((item) => item.number === Number(match[1]));
      pull.state = body.state;
      return { body: pull };
    }
    if ((match = path.match(/^\/issues\/(\d+)\/comments$/))) {
      return { body: this.comments.get(Number(match[1])) || [] };
    }
    if (path === "/actions/runs" && method === "GET") {
      // One workflow run per commit that has jobs recorded; its id is the commit sha.
      const head = query.get("head_sha");
      return { body: { workflow_runs: this.checkRunsBySha.has(head) ? [{ id: head }] : [] } };
    }
    if ((match = path.match(/^\/actions\/runs\/([^/]+)\/jobs$/))) {
      return { body: { jobs: this.checkRunsBySha.get(match[1]) || [] } };
    }
    return notFound;
  }
}

export const env = {
  GITHUB_OWNER: "owner",
  GITHUB_REPO: "repo",
  GITHUB_BASE_BRANCH: "main",
  GITHUB_TOKEN: "test-token",
  ALLOWED_EMAILS: "vic@example.test, pavel@example.test",
  ASSETS: { fetch: () => new Response("asset") },
};

export const pavel = { access: { getIdentity: async () => ({ email: "pavel@example.test" }) } };

export function sampleRepository() {
  return new FakeGitHub({
    "sites/stuart/site.config.json": JSON.stringify({
      domain: "stuart.test",
      brand: { name: "Stuart Homes" },
    }),
    "sites/stuart/content/index.md": "---\ntitle: Home\n---\nHello",
    "sites/stuart/content/flood.md": "---\ntitle: Flood\n---\nFlood copy",
    "sites/stuart/public/logo.svg": "<svg/>",
    "sites/_example/site.config.json": JSON.stringify({ domain: "example.test", brand: { name: "Example" } }),
    "sites/_example/content/index.md": "Example home",
    "sites/_example/content/es/index.md": "Inicio",
    "pods/pod-1.json": JSON.stringify({ name: "pod-1", sites: ["stuart"] }),
    "packages/template/index.astro": "template",
  });
}

// Stands in for the public internet in tests: no site's domain is reachable, so nothing is live.
export const offline = async () => new Response("", { status: 404 });

