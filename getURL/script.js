chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
    //アイコンの下に現在のタブ数を表示
    chrome.action.setBadgeText({text:String(tabs.length)});
    //開けるタブの最大値の初期値を拡張機能をインストールした時のタブ数にする
    chrome.storage.local.get("maxTabNum", (items) => {
        if(typeof items.maxNum == "undefined") {
            chrome.storage.local.set({maxTabNum:tabs.length});
        }
    });
});
//タブ更新時に実行
chrome.tabs.onUpdated.addListener((tabId) => {
    chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        chrome.storage.local.get("maxTabNum", (items) => {
            var maxTabNum = items.maxTabNum;
            //ストレージに格納されているmaxTabNumよりタブ数が多ければ新しいタブを閉じる
            if(tabs.length > maxTabNum){
                chrome.tabs.remove(tabId);
            }
        });
    });
});