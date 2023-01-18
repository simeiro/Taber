chrome.tabs.query({}, tabs => {
    chrome.action.setBadgeText({text:String(tabs.length)});
});//アイコン下の表示

