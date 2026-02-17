const INTRO_UIA = "player-skip-intro";
const RECAP_UIA = "player-skip-recap";
const NEXT_UIA = "next-episode-seamless-button";
const NEXT_DRAIN_UIA = "next-episode-seamless-button-draining";
const CREDITS_UIA = "watch-credits-seamless-button";

const BUTTONS = [
  INTRO_UIA,
  RECAP_UIA,
  NEXT_UIA,
  NEXT_DRAIN_UIA,
  CREDITS_UIA,
];

let observer = null;
let debounceTimer = null;

function isWatchPage() {
  return location.pathname.includes("/watch/");
}

function showFlash(message) {
  const flash = document.createElement("div");
  flash.textContent = message;
  flash.style.position = "fixed";
  flash.style.bottom = "30px";
  flash.style.right = "30px";
  flash.style.padding = "10px 16px";
  flash.style.background = "rgba(229,9,20,0.9)";
  flash.style.color = "#fff";
  flash.style.borderRadius = "8px";
  flash.style.fontSize = "12px";
  flash.style.zIndex = "999999";
  flash.style.opacity = "0";
  flash.style.transition = "opacity 0.3s ease";

  document.body.appendChild(flash);

  requestAnimationFrame(() => {
    flash.style.opacity = "1";
  });

  setTimeout(() => {
    flash.style.opacity = "0";
    setTimeout(() => flash.remove(), 300);
  }, 1200);
}

async function incrementStat(type) {
  const { stats = {} } = await chrome.storage.local.get(["stats"]);
  stats[type] = (stats[type] || 0) + 1;
  await chrome.storage.local.set({ stats });
}

async function engine() {
  try {
    if (!chrome?.runtime?.id) return;
    if (!isWatchPage()) return;

    const {
      skipIntro,
      skipRecap,
      skipNext,
      skipCredits,
      skipDelay = 0,
      sessionPaused
    } = await chrome.storage.local.get([
      "skipIntro",
      "skipRecap",
      "skipNext",
      "skipCredits",
      "skipDelay",
      "sessionPaused"
    ]);

    if (sessionPaused) return;

    const mapper = {
      [INTRO_UIA]: skipIntro,
      [RECAP_UIA]: skipRecap,
      [NEXT_UIA]: skipNext,
      [NEXT_DRAIN_UIA]: skipNext,
      [CREDITS_UIA]: skipCredits,
    };

    BUTTONS.forEach((uia) => {
      if (!mapper[uia]) return;

      const button = document.querySelector(
        `button[data-uia="${uia}"]`
      );

      if (button) {
        setTimeout(async () => {
          button.click();
          await incrementStat(uia);
          showFlash("Skipped ✓");
        }, skipDelay);
      }
    });

  } catch (err) {
    console.error("Netflix AutoSkip Pro:", err);
  }
}

if (location.hostname.includes("netflix.com")) {
  observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(engine, 150);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
