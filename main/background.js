//拡張機能インストール時実行 --fuma
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //開けるタブの最大値の初期値を現在のタブ数にする
        chrome.storage.local.set({ maxTabNum: tabs.length });
        //checboxの初期値をfalseにする
        chrome.storage.local.set({ check: false });
        //アイコンの下に現在のタブ数を表示
        chrome.action.setBadgeText({ text: String(tabs.length) });
    });
});

//タブ更新時実行 --fuma
chrome.tabs.onUpdated.addListener((tabId) => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //アイコンの下に現在のタブ数を表示
        chrome.action.setBadgeText({ text: String(tabs.length) });

        chrome.storage.local.get(["maxTabNum", "check"], (items) => {
            //ストレージに格納されているmaxTabNumよりタブ数が多くchecboxがtrueならば新しいタブを閉じる
            if (tabs.length > items.maxTabNum && items.check == true) {
                chrome.tabs.remove(tabId);
            }
            //checkboxがfalseなら現在のタブ数をストレージのmaxTabNumに格納
            if (items.check == false) {
                chrome.storage.local.set({ maxTabNum: tabs.length });
            }
        });
    });
});

//タブ削除時実行 --fuma
chrome.tabs.onRemoved.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //アイコンの下に現在のタブ数を表示
        chrome.action.setBadgeText({ text: String(tabs.length) });
        //checkboxがfalseなら現在のタブ数をストレージのmaxTabNumに格納
        chrome.storage.local.get(["maxTabNum", "check"], (items) => {
            if (items.check == false) {
                chrome.storage.local.set({ maxTabNum: tabs.length });
            }
        });
    });
});