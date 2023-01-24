//拡張機能インストール時実行
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //開けるタブの最大値の初期値を現在のタブ数にする --fuma
        chrome.storage.local.set({ maxTabNum: tabs.length });

        displayNum(tabs.length, tabs.length);
        makeIcon(tabs.length, tabs.length);
    });
});

//タブ更新時実行
chrome.tabs.onUpdated.addListener((tabId) => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        chrome.storage.local.get(["maxTabNum", "check"], (items) => {
            //ストレージに格納されているmaxTabNumよりタブ数が多くchecboxがtrueならば新しいタブを閉じる --fuma
            if (tabs.length > items.maxTabNum && items.check == true) {
                chrome.tabs.remove(tabId);
            }
            //checkboxがfalseなら現在のタブ数をストレージのmaxTabNumに格納 --fuma
            if (items.check == false) {
                chrome.storage.local.set({ maxTabNum: tabs.length });
            }

            displayNum(tabs.length, items.maxTabNum);
            makeIcon(tabs.length, items.maxTabNum);
        });
    });
});

//タブ削除時実行
chrome.tabs.onRemoved.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //checkboxがfalseなら現在のタブ数をストレージのmaxTabNumに格納 --fuma
        chrome.storage.local.get(["maxTabNum", "check"], (items) => {
            if (items.check == false) {
                chrome.storage.local.set({ maxTabNum: tabs.length });
            }

            displayNum(tabs.length, items.maxTabNum);
            makeIcon(tabs.length, items.maxTabNum);
        });
    });
});

//アイコンを作成する関数
function makeIcon(tabsLength, maxTabNum) {
    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    context.fillStyle = `rgb(255, ${255 - 255 * (tabsLength / maxTabNum)}, ${255 - 255 * (tabsLength / maxTabNum)})`; //白→赤のグラデーション
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({ imageData: imageData }, () => {
    });
}

//アイコン下に現在のタブ数を表示する
function displayNum(tabsLength, maxTabNum) {
    if (tabsLength == maxTabNum) {
        chrome.action.setBadgeText({ text: String("MAX") });
    } else {
        chrome.action.setBadgeText({ text: String(tabsLength + '/' + maxTabNum) });
    }
}

