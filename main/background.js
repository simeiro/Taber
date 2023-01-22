//拡張機能インストール時実行
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //開けるタブの最大値の初期値を現在のタブ数にする
        chrome.storage.local.set({ maxTabNum: tabs.length });
        //アイコンの下に現在のタブ数を表示
        chrome.action.setBadgeText({ text: String(tabs.length) });
    });
});

//タブ更新時実行
chrome.tabs.onUpdated.addListener((tabId) => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //アイコンの下に現在のタブ数を表示
        chrome.action.setBadgeText({ text: String(tabs.length) });
        //ストレージに格納されているmaxTabNumよりタブ数が多ければ新しいタブを閉じる
        chrome.storage.local.get("maxTabNum", (items) => {
            if (tabs.length > items.maxTabNum) {
                chrome.tabs.remove(tabId);
            }
        });
    });
});

//タブ削除時実行
chrome.tabs.onRemoved.addListener(() => {
    //アイコンの下に現在のタブ数を表示
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        chrome.action.setBadgeText({ text: String(tabs.length) });
    });
});