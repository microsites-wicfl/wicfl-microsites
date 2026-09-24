// Every piece of text Pavel sees lives here. Studio is always in English (rule, 24 Sep 2026).
// Vocabulary: site, page, draft, unpublished changes, preview, publish, live, discard.
// Never version-control terms.
export const text = {
  loading: "Loading…",
  retry: "Try again",
  genericError: "That didn't work.",

  dashboardTitle: "Your sites",
  dashboardEmpty: "No sites yet.",
  testSites: "Practice sites",
  testSitesHint: "For practice. Nothing here is ever published.",
  hasChanges: "Unpublished changes",
  upToDate: "Up to date",
  publishedAt: (domain) => `Published at ${domain}`,
  notPublished: "Not published yet",

  allSites: "← All sites",
  pagesTitle: "Pages",
  edited: "Edited",
  noPages: "This site has no pages yet.",
  discardDraft: "Discard draft",
  discardQuestion: "Discard all unpublished changes on this site? This can't be undone.",
  discardYes: "Discard",
  cancel: "Cancel",
  discarded: "Draft discarded. The site is back to its published version.",
  publishSoon: "To publish these changes, let Vic know. A Publish button is coming to Studio soon.",

  previewTitle: "Preview",
  previewNone: "No draft. When you save a change, its preview will show up here.",
  previewPreparing: "Preparing the preview… it takes a few minutes after each change.",
  previewReady: "Preview ready.",
  previewFailed: "The preview failed.",
  previewOpen: "Open preview",
  previewPrevious: "See the previous preview",
  previewFailedHelp: "Check your last change, or send Vic this message:",

  backToSite: (brand) => `← ${brand}`,
  editingDraft: "You are editing this site's draft.",
  editingPublished: "This is the published version. Saving creates a draft; nothing is published yet.",
  save: "Save to draft",
  saving: "Saving…",
  saved: "Saved to the draft. The preview updates in a few minutes.",
  noChanges: "There were no changes to save.",
  unsavedQuestion: "You have unsaved changes on this page. Leave without saving?",
  leave: "Leave without saving",
  stay: "Keep editing",
};
