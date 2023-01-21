chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
    chrome.storage.local.get("maxNum", (items)=>{
        if(typeof items.maxNum=="undefined") {
            chrome.storage.local.set({maxNum:tabs.length});//開けるタブの最大値の初期値を現在のタブ数にする
        }
    });
});
//更新時に実行
chrome.tabs.onUpdated.addListener((tabId) => {
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        let maxTabNum;
        chrome.storage.local.get("maxNum", (items)=>{
            maxTabNum = items.maxNum;
            if(tabs.length > maxTabNum){
                chrome.tabs.remove(tabId);
            }
        });
    });
});