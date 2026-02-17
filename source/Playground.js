// Set default settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    skipIntro: true,
    skipRecap: true,
    skipNext: true,
    skipCredits: true,
    skipDelay: 0,
    stats: {},
    sessionPaused: false
  });
});

// Keep uninstall feedback form
chrome.runtime.setUninstallURL(
  "https://forms.gle/ukJ2Uu2ep7TPaHFi6"
);
