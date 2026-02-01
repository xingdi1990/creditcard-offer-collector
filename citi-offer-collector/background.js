async function collectOffers() {
  console.log('[Citi Offer Collector] Starting...');

  // Show banner
  const bannerHTML = `
  <div id="citi-offer-collector-banner">
    <button id="citi-offer-collector-close">x</button>
    <span>Citi Offer Collector is currently running on this page.</span> <br>
    <span id="citi-offer-banner-content"></span> <br>
  </div>
  <style>
    #citi-offer-collector-close {
      float: right;
      display: inline-block;
      padding: 0 10px 0 0;
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }

    #citi-offer-collector-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      background-color: #056DAE;
      padding: 20px;
      color: white;
      width: 100%;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      z-index: 99999;
      box-sizing: border-box;
    }

    #citi-offer-collector-banner a, #citi-offer-collector-banner #cta-content {
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

    #citi-offer-collector-banner .center {
      margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
    }

    #citi-offer-collector-banner a#citi-offer-collector-bug {
      background-color: #d1320a;
      box-shadow: rgba(241, 7, 7, 0.2) 0 -25px 18px -14px inset,rgba(241, 7, 7, .15) 0 1px 2px,rgba(241, 7, 7, .15) 0 2px 4px,rgba(241, 7, 7, .15) 0 4px 8px,rgba(241, 7, 7, .15) 0 8px 16px,rgba(241, 7, 7, .15) 0 16px 32px;
      color: white;
      margin-top: 10px;
    }

    #citi-offer-collector-banner a#citi-offer-collector-bug:hover {
      box-shadow: rgba(241, 7, 7, .35) 0 -25px 18px -14px inset,rgba(241, 7, 7, .25) 0 1px 2px,rgba(241, 7, 7,.25) 0 2px 4px,rgba(241, 7, 7,.25) 0 4px 8px,rgba(241, 7, 7,.25) 0 8px 16px,rgba(241, 7, 7,.25) 0 16px 32px;
      transform: scale(1.05) rotate(-1deg);
    }
  </style>
  `;

  // Insert banner into page
  console.log('[Citi Offer Collector] Inserting banner...');
  document.body.insertAdjacentHTML('beforeend', bannerHTML);

  document.getElementById('citi-offer-collector-banner').innerHTML += `<a id='citi-offer-collector-bug' class="btn btn-primary" href="https://github.com/anthropics/claude-code/issues" target="_blank" rel="noopener noreferrer" role="button">Report Bug</a> <br><br>`;
  document.getElementById('citi-offer-banner-content').innerText = `Getting things ready ...`;

  // Attach event handler for close button
  document.getElementById('citi-offer-collector-close').onclick = function() {
    document.getElementById('citi-offer-collector-banner').remove();
    return false;
  };

  // Wait for page to fully load
  console.log('[Citi Offer Collector] Waiting 4 seconds for page to load...');
  await new Promise(r => setTimeout(r, 4000));

  // Helper function to update banner status
  const updateStatus = (text) => {
    document.getElementById('citi-offer-banner-content').innerText = text;
  };

  // Helper function to scroll and load all offers (handles infinite scroll)
  async function scrollToLoadAllOffers() {
    let previousHeight = 0;
    let scrollCount = 0;
    let unchangedCount = 0; // Track consecutive scrolls with no height change
    const scrollStep = 800; // Scroll down by 800px at a time
    const maxScrolls = 100; // Safety limit

    while (scrollCount < maxScrolls) {
      previousHeight = document.body.scrollHeight;

      // Scroll down incrementally
      window.scrollBy(0, scrollStep);
      scrollCount++;
      updateStatus(`Loading all offers... (scroll ${scrollCount})`);

      // Wait for new offers to load
      await new Promise(r => setTimeout(r, 2000));

      const currentHeight = document.body.scrollHeight;

      // Check if page height changed
      if (currentHeight === previousHeight) {
        unchangedCount++;
        // Stop if height unchanged for 3 consecutive scrolls
        if (unchangedCount >= 3) {
          break;
        }
      } else {
        unchangedCount = 0; // Reset if new content loaded
      }
    }

    // Scroll back to top
    window.scrollTo(0, 0);
    return scrollCount;
  }

  // Scroll to load all offers (infinite scroll handling)
  console.log('[Citi Offer Collector] Scrolling to load all offers...');
  updateStatus('Loading all offers...');
  const scrollCount = await scrollToLoadAllOffers();
  console.log(`[Citi Offer Collector] Finished scrolling (${scrollCount} scrolls)`);

  // Find all enroll buttons
  console.log('[Citi Offer Collector] Searching for enroll buttons...');
  const enrollButtons = Array.from(document.querySelectorAll('button[title^="Enroll in Offer"]'));
  console.log(`[Citi Offer Collector] Found ${enrollButtons.length} enroll buttons`);

  // Debug: Log all buttons on page for troubleshooting
  const allButtons = document.querySelectorAll('button');
  console.log(`[Citi Offer Collector] DEBUG - Total buttons on page: ${allButtons.length}`);
  allButtons.forEach((btn, i) => {
    if (btn.title || btn.innerText.includes('Enroll')) {
      console.log(`[Citi Offer Collector] DEBUG - Button ${i}: title="${btn.title}", text="${btn.innerText.substring(0, 50)}", class="${btn.className}"`);
    }
  });

  if (enrollButtons.length === 0) {
    console.log('[Citi Offer Collector] No enroll buttons found with selector: button[title^="Enroll in Offer"]');
    document.getElementById('citi-offer-banner-content').innerText = `No offers found to enroll. You may have already enrolled in all available offers. Check browser console (F12) for debug info.`;
    return;
  }

  document.getElementById('citi-offer-banner-content').innerText = `Found ${enrollButtons.length} offers. Starting enrollment...`;
  await new Promise(r => setTimeout(r, 1000));

  let enrolledCount = 0;

  for (let i = 0; i < enrollButtons.length; i++) {
    document.getElementById('citi-offer-banner-content').innerText = `Enrolling in offer ${i + 1} of ${enrollButtons.length}...`;

    // Click the enroll button
    console.log(`[Citi Offer Collector] Clicking enroll button ${i + 1}: title="${enrollButtons[i].title}"`);
    enrollButtons[i].click();

    // Wait for popup to appear
    await new Promise(r => setTimeout(r, 500));

    // Try to find and click the close button
    console.log('[Citi Offer Collector] Looking for close button...');
    const closeButton = document.querySelector('button.modal-close-btn') ||
                        document.querySelector('button[aria-label="Close"]') ||
                        document.querySelector('.modal-close-btn') ||
                        document.querySelector('[aria-label="Close"]');

    if (closeButton) {
      console.log(`[Citi Offer Collector] Found close button: class="${closeButton.className}", aria-label="${closeButton.getAttribute('aria-label')}"`);
      closeButton.click();
    } else {
      console.log('[Citi Offer Collector] No close button found - checking for modal elements...');
      // Debug: Log any modal-related elements
      const modals = document.querySelectorAll('[class*="modal"], [role="dialog"]');
      modals.forEach((m, idx) => {
        console.log(`[Citi Offer Collector] DEBUG - Modal ${idx}: class="${m.className}", role="${m.getAttribute('role')}"`);
      });
    }

    enrolledCount++;

    // Wait before next offer
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`[Citi Offer Collector] Complete! Enrolled in ${enrolledCount} offers.`);
  document.getElementById('citi-offer-banner-content').innerText = `All ${enrolledCount} offers enrolled! =)\nYou can close this banner now.`;
}

const CITI_OFFERS_URL = 'https://online.citi.com/US/ag/products-offers/merchantoffers';

chrome.action.onClicked.addListener((tab) => {
  console.log(`[Citi Offer Collector] Extension clicked. Current URL: ${tab.url}`);

  if (tab.url.includes('online.citi.com/US/ag/products-offers/merchantoffers')) {
    // Already on offers page, run collector
    console.log('[Citi Offer Collector] On offers page, starting collector...');
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: collectOffers
    });
  } else if (tab.url.includes('online.citi.com')) {
    // On Citi site but not offers page, navigate there first
    console.log('[Citi Offer Collector] On Citi site, navigating to offers page...');
    chrome.tabs.update({
      url: CITI_OFFERS_URL
    }, function(currentTab) {
      const listener = function(tabId, changeInfo, tab) {
        if (tabId === currentTab.id && changeInfo.status === 'complete') {
          // Remove listener, so only run once
          chrome.tabs.onUpdated.removeListener(listener);
          // Execute collector
          console.log('[Citi Offer Collector] Page loaded, starting collector...');
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            function: collectOffers
          });
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  } else {
    console.log('[Citi Offer Collector] Not on Citi site. Please navigate to online.citi.com first.');
  }
});
