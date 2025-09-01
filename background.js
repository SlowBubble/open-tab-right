let activeTab = { windowId: null, index: null };

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab) {
      activeTab = { windowId: tab.windowId, index: tab.index };
      console.log('[onActivated]', activeTab);
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
          activeTab.index = openerTab.index + 1;
          console.log('[onCreated] currentTabIndex:', activeTab.index);
        }, 500);
    }
    } catch (error) {
      console.error("Error moving tab:", error);
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    if (removeInfo.isWindowClosing) return;
    if (activeTab.index === null || activeTab.windowId === null) return;

    // Only switch tabs in the window where the tab was closed
    const allTabs = await chrome.tabs.query({ windowId: activeTab.windowId });
    if (allTabs.length <= 1) return;

    const desiredTabIndex = Math.max(0, activeTab.index - 1);
    if (desiredTabIndex >= allTabs.length) return;

    const desiredTab = allTabs[desiredTabIndex];
    await chrome.tabs.update(desiredTab.id, { active: true });
  } catch (error) {
    console.error("Error switching tabs:", error);
  }
});

chrome.tabs.onMoved.addListener(async (tabId, moveInfo) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.active && tab.windowId === activeTab.windowId) {
      activeTab.index = moveInfo.toIndex;
      console.log('[onMoved]', activeTab);
    }
  } catch (error) {
    console.error("Error tracking tab move:", error);
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}