chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ skipIntro: true, skipRecap: true, skipNext: true });
});

if (chrome.runtime) {
  chrome.runtime.setUninstallURL("https://forms.gle/ukJ2Uu2ep7TPaHFi6");
}
