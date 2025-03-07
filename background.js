let currentTabIndex = null;
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const activeTab = await chrome.tabs.get(activeInfo.tabId);
    if (activeTab) {
      currentTabIndex = activeTab.index;
      console.log('[onActivated] currentTabIndex:', currentTabIndex);
    }
  } catch (error) {
    console.error("Error tracking active tab:", error);
  }
});

chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.openerTabId) {
    try {
      const openerTab = await chrome.tabs.get(tab.openerTabId);
      if (openerTab) {
        chrome.tabs.move(tab.id, { index: openerTab.index + 1 });
        // Hack: Wait for onActivated before updating this because activeTab.index is stale/wrong!
        setTimeout(() => {
          currentTabIndex = openerTab.index + 1;
          console.log('[onCreated] currentTabIndex:', currentTabIndex);
        }, 500);
    }
    } catch (error) {
      console.error("Error moving tab:", error);
    }
  }
});

chrome.tabs.onRemoved.addListener(async () => {
  try {
    if (currentTabIndex === null) return;

    const allTabs = await chrome.tabs.query({ currentWindow: true });
    if (allTabs.length <= 1) return;

    const desiredTabIndex = Math.max(0, currentTabIndex - 1);
    console.log('desiredTabIndex:', desiredTabIndex);
    console.log('allTabs.length:', allTabs.length);
    if (desiredTabIndex >= allTabs.length) return;

    const desiredTab = allTabs[desiredTabIndex];
    await chrome.tabs.update(desiredTab.id, { active: true });
  } catch (error) {
    console.error("Error switching tabs:", error);
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}