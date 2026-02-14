const INTRO_UIA = "player-skip-intro";
const RECAP_UIA = "player-skip-recap";
const NEXT_UIA = "next-episode-seamless-button";
const NEXT_DRAIN_UIA = "next-episode-seamless-button-draining";

const BUTTONS = [INTRO_UIA, RECAP_UIA, NEXT_UIA, NEXT_DRAIN_UIA];

function getCurrentTitle() {
  const titleElement = document.querySelectorAll("[data-uia='video-title']")[0];

  if (titleElement) {
    const h4Element = titleElement.querySelector('h4');
    if (h4Element && h4Element.textContent.trim()) {
      return h4Element.textContent.trim();
    }
    
    if (titleElement.textContent.trim()) {
      return titleElement.textContent.trim();
    }
  }
  
  const pageTitle = document.title;
  if (pageTitle && pageTitle !== 'Netflix' && !pageTitle.includes('Watch ')) {
    return pageTitle.replace(' - Netflix', '').trim();
  }
  
  return null;
}

async function YashvirGaming() {
  try {
    chrome.storage.local.get(
      ["skipIntro", "skipRecap", "skipNext", "exemptTitles"],
      ({ skipIntro, skipRecap, skipNext, exemptTitles = [] }) => {
        const currentTitle = getCurrentTitle();
        const isExempt = currentTitle && exemptTitles.includes(currentTitle);
        
        if (isExempt) {
          return;
        }
        
        const mapper = {
          [INTRO_UIA]: skipIntro,
          [RECAP_UIA]: skipRecap,
          [NEXT_UIA]: skipNext,
          [NEXT_DRAIN_UIA]: skipNext,
        };
        BUTTONS.forEach((uia) => {
          const button = Object.values(
            document.getElementsByTagName("button")
          ).find((elem) => elem.getAttribute("data-uia") === uia);
          if (button && mapper[uia]) {
            button.click();
          }
        });
      }
    );
  } catch (err) {
    console.error(err);
  }
}

async function toggleExemptStatus() {
  const currentTitle = getCurrentTitle();
  if (!currentTitle) {
    console.log('Netflix AutoSkip Pro: Could not detect current title');
    return;
  }
  
  try {
    const result = await chrome.storage.local.get(['exemptTitles']);
    const exemptTitles = result.exemptTitles || [];
    
    if (exemptTitles.includes(currentTitle)) {
      const updatedTitles = exemptTitles.filter(title => title !== currentTitle);
      await chrome.storage.local.set({ exemptTitles: updatedTitles });
      console.log(`Netflix AutoSkip Pro: Removed "${currentTitle}" from exemption list`);
    } else {
      const updatedTitles = [...exemptTitles, currentTitle];
      await chrome.storage.local.set({ exemptTitles: updatedTitles });
      console.log(`Netflix AutoSkip Pro: Added "${currentTitle}" to exemption list`);
    }
  } catch (err) {
    console.error('Netflix AutoSkip Pro: Error toggling exemption status:', err);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleExempt') {
    toggleExemptStatus();
    sendResponse({ success: true });
  } else if (request.action === 'getCurrentTitle') {
    const title = getCurrentTitle();
    sendResponse({ title });
  }
});

if (document.location.host.includes(".netflix.")) {
  setInterval(() => YashvirGaming(), 500);
}
