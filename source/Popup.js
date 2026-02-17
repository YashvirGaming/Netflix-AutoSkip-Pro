// ===============================
// BASIC SKIP TOGGLES
// ===============================

let skipIntroCheckbox = document.getElementById("skip-intro");
let skipRecapCheckbox = document.getElementById("skip-recap");
let skipNextCheckbox = document.getElementById("skip-next");
let skipCreditsCheckbox = document.getElementById("skip-credits");

skipIntroCheckbox?.addEventListener("click", async () => {
  await chrome.storage.local.set({ skipIntro: skipIntroCheckbox.checked });
});

skipRecapCheckbox?.addEventListener("click", async () => {
  await chrome.storage.local.set({ skipRecap: skipRecapCheckbox.checked });
});

skipNextCheckbox?.addEventListener("click", async () => {
  await chrome.storage.local.set({ skipNext: skipNextCheckbox.checked });
});

skipCreditsCheckbox?.addEventListener("click", async () => {
  await chrome.storage.local.set({ skipCredits: skipCreditsCheckbox.checked });
});

// ===============================
// SKIP DELAY SLIDER
// ===============================

let skipDelaySlider = document.getElementById("skip-delay");
let delayValueSpan = document.getElementById("delay-value");

skipDelaySlider?.addEventListener("input", async () => {
  delayValueSpan.textContent = skipDelaySlider.value;
  await chrome.storage.local.set({
    skipDelay: parseInt(skipDelaySlider.value)
  });
});

// ===============================
// SESSION PAUSE
// ===============================

let pauseButton = document.getElementById("pause-session");

pauseButton?.addEventListener("click", async () => {
  const { sessionPaused } = await chrome.storage.local.get(["sessionPaused"]);
  const newState = !sessionPaused;

  await chrome.storage.local.set({ sessionPaused: newState });

  pauseButton.textContent = newState
    ? "Resume AutoSkip (Session)"
    : "Pause AutoSkip (Session)";
});

// ===============================
// COMPACT MODE
// ===============================

let compactCheckbox = document.getElementById("compact-mode");

compactCheckbox?.addEventListener("click", () => {
  document.body.style.width = compactCheckbox.checked ? "240px" : "300px";
});

// ===============================
// DONATION BUTTON
// ===============================

let donateBtn = document.getElementById("donate-btn");

donateBtn?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://www.paypal.com/paypalme/keshavecaussy"
  });
});

// ===============================
// LOAD SAVED SETTINGS
// ===============================

async function initializePopup() {
  try {
    const {
      skipIntro,
      skipRecap,
      skipNext,
      skipCredits,
      skipDelay,
      sessionPaused
    } = await chrome.storage.local.get([
      "skipIntro",
      "skipRecap",
      "skipNext",
      "skipCredits",
      "skipDelay",
      "sessionPaused"
    ]);

    if (skipIntroCheckbox) skipIntroCheckbox.checked = !!skipIntro;
    if (skipRecapCheckbox) skipRecapCheckbox.checked = !!skipRecap;
    if (skipNextCheckbox) skipNextCheckbox.checked = !!skipNext;
    if (skipCreditsCheckbox) skipCreditsCheckbox.checked = !!skipCredits;

    if (skipDelaySlider && delayValueSpan) {
      skipDelaySlider.value = skipDelay || 0;
      delayValueSpan.textContent = skipDelay || 0;
    }

    if (pauseButton) {
      pauseButton.textContent = sessionPaused
        ? "Resume AutoSkip (Session)"
        : "Pause AutoSkip (Session)";
    }

    loadStats();

  } catch (err) {
    console.error("Popup init error:", err);
  }
}

initializePopup();

// ===============================
// LOAD STATS
// ===============================

let statIntro = document.getElementById("stat-intro");
let statRecap = document.getElementById("stat-recap");
let statNext = document.getElementById("stat-next");
let statCredits = document.getElementById("stat-credits");

async function loadStats() {
  const { stats = {} } = await chrome.storage.local.get(["stats"]);

  if (statIntro) statIntro.textContent = stats["player-skip-intro"] || 0;
  if (statRecap) statRecap.textContent = stats["player-skip-recap"] || 0;
  if (statNext) statNext.textContent = stats["next-episode-seamless-button"] || 0;
  if (statCredits) statCredits.textContent = stats["watch-credits-seamless-button"] || 0;
}
