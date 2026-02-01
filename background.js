// Site configuration
const SITE_CONFIG = {
  amex: {
    name: 'Amex',
    offersUrl: 'https://global.americanexpress.com/offers/eligible',
    bannerColor: '#006fcf',
    checkOffersPage: (url) => url.includes('offers/eligible'),
    checkDomain: (url) => url.includes('global.americanexpress.com')
  },
  citi: {
    name: 'Citi',
    offersUrl: 'https://online.citi.com/US/ag/products-offers/merchantoffers',
    bannerColor: '#056DAE',
    checkOffersPage: (url) => url.includes('/merchantoffers'),
    checkDomain: (url) => url.includes('online.citi.com')
  }
};

// Detect which site the user is on
function detectSite(url) {
  for (const [key, config] of Object.entries(SITE_CONFIG)) {
    if (config.checkDomain(url)) {
      return key;
    }
  }
  return null;
}

// Shared banner creation function
function createBanner(siteName, bannerColor) {
  const bannerHTML = `
  <div id="offer-collector-banner">
    <button id="offer-collector-close">x</button>
    <span>${siteName} Offer Collector is currently running on this page.</span> <br>
    <span id="offer-banner-content"></span> <br>
  </div>
  <style>
    #offer-collector-close {
      float: right;
      display: inline-block;
      padding: 0 10px 0 0;
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }

    #offer-collector-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      background-color: var(--banner-color, ${bannerColor});
      padding: 20px;
      color: white;
      width: 100%;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      z-index: 99999;
      box-sizing: border-box;
    }

    #offer-collector-banner a, #offer-collector-banner #cta-content {
      border-radius: 100px;
      cursor: pointer;
      display: inline-block;
      font-family: -apple-system, system-ui, Roboto, sans-serif;
      padding: 7px 20px;
      text-align: center;
      text-decoration: none;
      transition: all 250ms;
      border: 0;
      font-size: 16px;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }

    #offer-collector-banner .center {
      margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
    }

    #offer-collector-banner a#offer-collector-bug {
      background-color: #d1320a;
      box-shadow: rgba(241, 7, 7, 0.2) 0 -25px 18px -14px inset,rgba(241, 7, 7, .15) 0 1px 2px,rgba(241, 7, 7, .15) 0 2px 4px,rgba(241, 7, 7, .15) 0 4px 8px,rgba(241, 7, 7, .15) 0 8px 16px,rgba(241, 7, 7, .15) 0 16px 32px;
      color: white;
      margin-top: 10px;
    }

    #offer-collector-banner a#offer-collector-bug:hover {
      box-shadow: rgba(241, 7, 7, .35) 0 -25px 18px -14px inset,rgba(241, 7, 7, .25) 0 1px 2px,rgba(241, 7, 7,.25) 0 2px 4px,rgba(241, 7, 7,.25) 0 4px 8px,rgba(241, 7, 7,.25) 0 8px 16px,rgba(241, 7, 7,.25) 0 16px 32px;
      transform: scale(1.05) rotate(-1deg);
    }
  </style>
  `;

  document.body.insertAdjacentHTML('beforeend', bannerHTML);
  document.getElementById('offer-collector-banner').style.setProperty('--banner-color', bannerColor);
  document.getElementById('offer-collector-banner').innerHTML += `<a id='offer-collector-bug' class="btn btn-primary" href="https://github.com/anthropics/claude-code/issues" target="_blank" rel="noopener noreferrer" role="button">Report Bug</a> <br><br>`;
  document.getElementById('offer-banner-content').innerText = `Getting things ready ...`;

  // Attach event handler for close button
  document.getElementById('offer-collector-close').onclick = function() {
    document.getElementById('offer-collector-banner').remove();
    return false;
  };
}

// Helper function to update banner status
function updateStatus(text) {
  const el = document.getElementById('offer-banner-content');
  if (el) {
    el.innerText = text;
  }
}

// Amex offer collector
async function collectAmexOffers() {
  console.log('[Offer Collector] Starting Amex collection...');

  createBanner('Amex', '#006fcf');

  await new Promise(r => setTimeout(r, 4000));

  const offerButtons = Array.from(document.getElementsByClassName("offer-cta")).filter(btn => btn.title == "Add to Card");
  console.log(`[Offer Collector] Found ${offerButtons.length} Amex offers`);

  for (let index = 0; index < offerButtons.length; ++index) {
    updateStatus(`${index} offers collected`);
    offerButtons[index].click();
    await new Promise(r => setTimeout(r, 1000));
  }

  updateStatus(`All available offers collected! =)\nPlease refresh the page to remove this banner.`);
  console.log('[Offer Collector] Amex collection complete!');
}

// Citi offer collector
async function collectCitiOffers() {
  console.log('[Offer Collector] Starting Citi collection...');

  createBanner('Citi', '#056DAE');

  await new Promise(r => setTimeout(r, 4000));

  // Helper function to scroll and load all offers (handles infinite scroll)
  async function scrollToLoadAllOffers() {
    let previousHeight = 0;
    let scrollCount = 0;
    let unchangedCount = 0;
    const scrollStep = 800;
    const maxScrolls = 100;

    while (scrollCount < maxScrolls) {
      previousHeight = document.body.scrollHeight;

      window.scrollBy(0, scrollStep);
      scrollCount++;
      updateStatus(`Loading all offers... (scroll ${scrollCount})`);

      await new Promise(r => setTimeout(r, 2000));

      const currentHeight = document.body.scrollHeight;

      if (currentHeight === previousHeight) {
        unchangedCount++;
        if (unchangedCount >= 3) {
          break;
        }
      } else {
        unchangedCount = 0;
      }
    }

    window.scrollTo(0, 0);
    return scrollCount;
  }

  // Scroll to load all offers (infinite scroll handling)
  console.log('[Offer Collector] Scrolling to load all offers...');
  updateStatus('Loading all offers...');
  const scrollCount = await scrollToLoadAllOffers();
  console.log(`[Offer Collector] Finished scrolling (${scrollCount} scrolls)`);

  // Find all enroll buttons
  console.log('[Offer Collector] Searching for enroll buttons...');
  const enrollButtons = Array.from(document.querySelectorAll('button[title^="Enroll in Offer"]'));
  console.log(`[Offer Collector] Found ${enrollButtons.length} enroll buttons`);

  // Debug: Log all buttons on page for troubleshooting
  const allButtons = document.querySelectorAll('button');
  console.log(`[Offer Collector] DEBUG - Total buttons on page: ${allButtons.length}`);
  allButtons.forEach((btn, i) => {
    if (btn.title || btn.innerText.includes('Enroll')) {
      console.log(`[Offer Collector] DEBUG - Button ${i}: title="${btn.title}", text="${btn.innerText.substring(0, 50)}", class="${btn.className}"`);
    }
  });

  if (enrollButtons.length === 0) {
    console.log('[Offer Collector] No enroll buttons found with selector: button[title^="Enroll in Offer"]');
    updateStatus(`No offers found to enroll. You may have already enrolled in all available offers. Check browser console (F12) for debug info.`);
    return;
  }

  updateStatus(`Found ${enrollButtons.length} offers. Starting enrollment...`);
  await new Promise(r => setTimeout(r, 1000));

  let enrolledCount = 0;

  for (let i = 0; i < enrollButtons.length; i++) {
    updateStatus(`Enrolling in offer ${i + 1} of ${enrollButtons.length}...`);

    console.log(`[Offer Collector] Clicking enroll button ${i + 1}: title="${enrollButtons[i].title}"`);
    enrollButtons[i].click();

    await new Promise(r => setTimeout(r, 500));

    // Try to find and click the close button
    console.log('[Offer Collector] Looking for close button...');
    const closeButton = document.querySelector('button.modal-close-btn') ||
                        document.querySelector('button[aria-label="Close"]') ||
                        document.querySelector('.modal-close-btn') ||
                        document.querySelector('[aria-label="Close"]');

    if (closeButton) {
      console.log(`[Offer Collector] Found close button: class="${closeButton.className}", aria-label="${closeButton.getAttribute('aria-label')}"`);
      closeButton.click();
    } else {
      console.log('[Offer Collector] No close button found - checking for modal elements...');
      const modals = document.querySelectorAll('[class*="modal"], [role="dialog"]');
      modals.forEach((m, idx) => {
        console.log(`[Offer Collector] DEBUG - Modal ${idx}: class="${m.className}", role="${m.getAttribute('role')}"`);
      });
    }

    enrolledCount++;

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`[Offer Collector] Complete! Enrolled in ${enrolledCount} offers.`);
  updateStatus(`All ${enrolledCount} offers enrolled! =)\nYou can close this banner now.`);
}

// Main click handler
chrome.action.onClicked.addListener((tab) => {
  const url = tab.url;
  const site = detectSite(url);

  console.log(`[Offer Collector] Extension clicked. URL: ${url}, Detected site: ${site}`);

  if (!site) {
    console.log('[Offer Collector] Not on a supported site. Please navigate to Amex or Citi first.');
    return;
  }

  const config = SITE_CONFIG[site];
  const collector = site === 'amex' ? collectAmexOffers : collectCitiOffers;

  if (config.checkOffersPage(url)) {
    // Already on offers page, run collector
    console.log(`[Offer Collector] On ${config.name} offers page, starting collector...`);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: collector
    });
  } else {
    // On site but not offers page, navigate there first
    console.log(`[Offer Collector] On ${config.name} site, navigating to offers page...`);
    chrome.tabs.update({
      url: config.offersUrl
    }, function(currentTab) {
      const listener = function(tabId, changeInfo, updatedTab) {
        if (tabId === currentTab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          console.log(`[Offer Collector] ${config.name} page loaded, starting collector...`);
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            function: collector
          });
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  }
});
