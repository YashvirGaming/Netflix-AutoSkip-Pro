let skipIntroCheckbox = document.getElementById("skip-intro");
let skipRecapCheckbox = document.getElementById("skip-recap");
let skipNextCheckbox = document.getElementById("skip-next");
let toggleExemptButton = document.getElementById("toggle-exempt");
let currentTitleSpan = document.getElementById("current-title");
let currentTitleContainer = document.getElementById("current-title-container");
let notOnNetflixDiv = document.getElementById("not-on-netflix");
let exemptListDiv = document.getElementById("exempt-list");

let currentTitle = null;
let exemptTitles = [];

skipIntroCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipIntro: skipIntroCheckbox.checked });
});

skipRecapCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipRecap: skipRecapCheckbox.checked });
});

skipNextCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipNext: skipNextCheckbox.checked });
});

toggleExemptButton.addEventListener("click", async () => {
  if (!currentTitle) return;
  
  try {
    const isCurrentlyExempt = exemptTitles.includes(currentTitle);
    
    if (isCurrentlyExempt) {
      exemptTitles = exemptTitles.filter(title => title !== currentTitle);
    } else {
      exemptTitles = [...exemptTitles, currentTitle];
    }
    
    await chrome.storage.local.set({ exemptTitles });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleExempt' });

    updateExemptList();
    updateToggleButton();
  } catch (error) {
    console.error('Error toggling exemption status:', error);

    await loadExemptTitles();
    updateToggleButton();
  }
});

async function loadExemptTitles() {
  try {
    const result = await chrome.storage.local.get(['exemptTitles']);
    exemptTitles = result.exemptTitles || [];
    updateExemptList();
  } catch (error) {
    console.error('Error loading exemption titles:', error);
  }
}

function updateExemptList() {
  if (exemptTitles.length === 0) {
    exemptListDiv.innerHTML = '<div style="text-align: center; color: #666; font-size: 11px;">No exemption titles</div>';
    return;
  }
  
  exemptListDiv.innerHTML = '';
  
  exemptTitles.forEach((title, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'exempt-item';
    
    const titleSpan = document.createElement('span');
    titleSpan.style.flex = '1';
    titleSpan.style.marginRight = '8px';
    titleSpan.textContent = title;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-item';
    removeButton.textContent = 'X';
    removeButton.title = `Remove "${title}" from exemption list`;
    removeButton.addEventListener('click', () => removeExemptTitle(title));
    
    itemDiv.appendChild(titleSpan);
    itemDiv.appendChild(removeButton);
    exemptListDiv.appendChild(itemDiv);
  });
}

window.removeExemptTitle = async function(title) {
  try {
    exemptTitles = exemptTitles.filter(t => t !== title);
    
    await chrome.storage.local.set({ exemptTitles });
    
    updateExemptList();
    updateToggleButton();
    
    if (title === currentTitle) {
      toggleExemptButton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        toggleExemptButton.style.transform = 'scale(1)';
      }, 150);
    }
  } catch (error) {
    console.error('Error removing exemption title:', error);
    await loadExemptTitles();
    updateToggleButton();
  }
};

function updateToggleButton() {
  if (!currentTitle) {
    toggleExemptButton.textContent = 'No title detected';
    toggleExemptButton.className = 'toggle-button disabled-button';
    toggleExemptButton.disabled = true;
    return;
  }
  
  const isExempt = exemptTitles.includes(currentTitle);
  if (isExempt) {
    toggleExemptButton.textContent = 'Remove from Exemption List';
    toggleExemptButton.className = 'toggle-button remove-button';
    toggleExemptButton.disabled = false;
  } else {
    toggleExemptButton.textContent = 'Add to Exemption List';
    toggleExemptButton.className = 'toggle-button add-button';
    toggleExemptButton.disabled = false;
  }
}

async function getCurrentTitle() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('netflix.com')) {
      currentTitleContainer.style.display = 'none';
      notOnNetflixDiv.style.display = 'block';
      return;
    }
    
    currentTitleContainer.style.display = 'block';
    notOnNetflixDiv.style.display = 'none';
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCurrentTitle' });
    currentTitle = response?.title || null;
    
    if (currentTitle) {
      currentTitleSpan.textContent = currentTitle;
    } else {
      currentTitleSpan.textContent = 'Title not detected';
    }
    
    updateToggleButton();
  } catch (error) {
    console.error('Error getting current title:', error);
    currentTitleContainer.style.display = 'none';
    notOnNetflixDiv.style.display = 'block';
  }
}

async function initializePopup() {
  chrome.storage.local.get(
    ["skipIntro", "skipRecap", "skipNext"],
    ({ skipIntro, skipRecap, skipNext }) => {
      if (skipIntro) {
        skipIntroCheckbox.checked = true;
      }
      if (skipRecap) {
        skipRecapCheckbox.checked = true;
      }
      if (skipNext) {
        skipNextCheckbox.checked = true;
      }
    }
  );
  
  await loadExemptTitles();
  await getCurrentTitle();
}

initializePopup();
