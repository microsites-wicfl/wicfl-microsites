function isAboutSite(name, slug) {
  return (
    name === `Preview ${slug}` ||
    name === `Build ${slug}` ||
    name === "Validate all site configurations" ||
    name.startsWith("Discover sites")
  );
}

// What a failed check means, in words Pavel can act on. The raw reason still travels along so
// Vic can find the run.
function explain(name, slug) {
  if (name === `Build ${slug}`) {
    return "The site couldn't be built with your latest change. Check the page you edited last; " +
      "if it looks right, send Vic the message below.";
  }
  if (name === "Validate all site configurations") {
    return "The site's settings didn't pass the automatic checks. Send Vic the message below.";
  }
  return "The preview couldn't be published. That's on our side: send Vic the message below.";
}

const FAILED = new Set(["failure", "timed_out", "cancelled", "action_required", "startup_failure"]);

// Where the preview of a site's draft stands, derived only from what GitHub already has:
//  - the comment preview.yml leaves on the draft's pull request, marked <!-- wicfl-preview:<slug> -->
//  - the Actions jobs on the draft's latest commit (CI and the "Preview <slug>" job)
// States: none | preparing | ready | failed. `url` is included whenever one is known, so an older
// preview stays reachable while a new one is being prepared.
export async function previewStatus(github, slug, { headSha, pull }) {
  if (!headSha) return { state: "none" };
  if (!pull) return { state: "preparing" };

  const [comments, allRuns] = await Promise.all([github.pullComments(pull.number), github.checkRuns(headSha)]);
  const marker = `<!-- wicfl-preview:${slug} -->`;
  const comment = comments.find((item) => item.body && item.body.includes(marker));
  const url = comment ? (comment.body.match(/https:\/\/[^\s)*]+\.workers\.dev/) || [])[0] : undefined;

  // Only checks about this site count. Other jobs run on the same commit (Studio's own tests,
  // builds of other sites when shared files change) and must not make Pavel's preview look broken.
  const runs = allRuns.filter((run) => isAboutSite(run.name, slug));
  const failed = runs.find((run) => run.status === "completed" && FAILED.has(run.conclusion));
  if (failed) {
    return {
      state: "failed",
      help: explain(failed.name, slug),
      reason: `${failed.name}: ${failed.conclusion}`,
      url,
    };
  }

  const previewRun = runs.find((run) => run.name === `Preview ${slug}`);
  if (previewRun && previewRun.status === "completed" && previewRun.conclusion === "success" && url) {
    return { state: "ready", url };
  }
  return { state: "preparing", url };
}
