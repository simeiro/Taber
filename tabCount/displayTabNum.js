chrome.tabs.query({}, tabs => {
    chrome.action.setBadgeText({text:String(tabs.length)});
});

