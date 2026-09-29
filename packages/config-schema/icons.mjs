export const ICON_NAMES = [
  "map-pin", "shield-check", "users", "house", "file-text", "triangle-alert", "waves",
  "tree-palm", "sailboat", "trees", "phone", "mail", "clipboard-check", "key-round",
  "umbrella", "sun", "cloud-rain", "wind", "hammer", "badge-dollar-sign"
];

const svg = (path) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

export const ICONS = {
  "map-pin": svg('<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
  "shield-check": svg('<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>'),
  users: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
  house: svg('<path d="m3 11 9-8 9 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-6h6v6"/>'),
  "file-text": svg('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>'),
  "triangle-alert": svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>'),
  waves: svg('<path d="M2 6c.6.5 1.5 1 3 1 3 0 3-2 6-2s3 2 6 2c1.5 0 2.4-.5 3-1M2 12c.6.5 1.5 1 3 1 3 0 3-2 6-2s3 2 6 2c1.5 0 2.4-.5 3-1M2 18c.6.5 1.5 1 3 1 3 0 3-2 6-2s3 2 6 2c1.5 0 2.4-.5 3-1"/>'),
  "tree-palm": svg('<path d="M12 22v-9M8 13c0-5 2-8 4-10 2 2 4 5 4 10M4 9c2 0 4 1 5 3M20 9c-2 0-4 1-5 3"/>'),
  sailboat: svg('<path d="M10 2v14M10 2 4 13h12zM10 6l7 7h3l-7-7zM3 17h18M5 21h14"/>'),
  trees: svg('<path d="m10 10 3-3 3 3M5 21V10l5-7 5 7v11M14 21V9l4-5 4 5v12"/>'),
  phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.79.62 2.65a2 2 0 0 1-.45 2.11L9 10.71a16 16 0 0 0 4.29 4.29l1.23-1.23a2 2 0 0 1 2.11-.45c.86.29 1.75.5 2.65.62A2 2 0 0 1 22 16.92z"/>'),
  mail: svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/>'),
  "clipboard-check": svg('<rect width="14" height="18" x="5" y="3" rx="2"/><path d="M9 3V2h6v1M9 13l2 2 4-4"/>'),
  "key-round": svg('<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l1 1M18.5 4.5l1 1"/>'),
  umbrella: svg('<path d="M12 2v20M4 12a8 8 0 0 1 16 0Z"/><path d="M12 22a3 3 0 0 0 3-3"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
  "cloud-rain": svg('<path d="M17.5 19H9a7 7 0 1 1 6.71-9.01A5.5 5.5 0 1 1 17.5 19zM8 19v2M8 15v2M12 19v2M12 15v2"/>'),
  wind: svg('<path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8A2.5 2.5 0 1 1 20 10.5H2M9.4 4.4A2 2 0 1 1 11 8H2"/>'),
  hammer: svg('<path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9M17.64 15 22 10.64M20.91 11.7 18.3 9.09M14.7 5.7l-2.4-2.4a2.1 2.1 0 0 0-3 3l2.4 2.4"/>'),
  "badge-dollar-sign": svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2"/>')
};
