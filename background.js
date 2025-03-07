chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.openerTabId) {
    try {
      const openerTab = await chrome.tabs.get(tab.openerTabId);
      if (openerTab) {
        chrome.tabs.move(tab.id, { index: openerTab.index + 1 });
      }
    } catch (error) {
      console.error("Error moving tab:", error);
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) {
    return; // Don't do anything if the whole window is closing.
  }

  try {
    const currentTab = await chrome.tabs.getCurrent();
    if (currentTab && currentTab.id === tabId) { //if the tab removed is the active tab.
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        if(allTabs.length > 0){
          let index = -1;
          for(let i = 0; i < allTabs.length; i++){
              if(allTabs[i].active){
                  index = allTabs[i].index;
                  break;
              }
          }
          if(index > 0){
              chrome.tabs.query({currentWindow: true, index: index-1}, (tabs) => {
                  if(tabs.length > 0){
                      chrome.tabs.update(tabs[0].id, {active: true});
                  }
              });
          } else if(allTabs.length > 1){ //If it was the left most tab, move to the right.
              chrome.tabs.query({currentWindow: true, index: 1}, (tabs) => {
                  if(tabs.length > 0){
                      chrome.tabs.update(tabs[0].id, {active: true});
                  }
              });
          }
        }
    }
  } catch (error) {
    console.error("Error handling tab removal:", error);
  }
});