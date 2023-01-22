chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
    //開けるタブの最大値の初期値を拡張機能更新時のタブ数にする
    chrome.storage.local.get("maxTabNum", (items) => {
        if(typeof items.maxNum == "undefined") {
            chrome.storage.local.set({maxTabNum : tabs.length});
        }
        displayNum(tabs.length, items.maxTabNum);
        makeIcon(tabs.length, items.maxTabNum);
    });
});

//タブ更新時に実行
chrome.tabs.onUpdated.addListener((tabId) => {
    chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        //ストレージに格納されているmaxTabNumよりタブ数が多ければ新しいタブを閉じる
        chrome.storage.local.get("maxTabNum", (items) => {
            if(tabs.length > items.maxTabNum){
                chrome.tabs.remove(tabId);
            }
            displayNum(tabs.length, items.maxTabNum);
            makeIcon(tabs.length, items.maxTabNum);
        });
    });
});

//タブ削除時に実行
chrome.tabs.onRemoved.addListener(() => {
    chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        chrome.storage.local.get("maxTabNum", (items) => {
            displayNum(tabs.length, items.maxTabNum);
            makeIcon(tabs.length, items.maxTabNum);
        });
    });
});


//アイコンを作成する関数
function makeIcon(tabsLength, maxTabNum){
    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    context.fillStyle = `rgb(255, ${255 - 255 * (tabsLength/maxTabNum)}, ${255- 255 * (tabsLength/maxTabNum)})`; //白→赤のグラデーション
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({imageData: imageData}, () => {
        });
}

//アイコン下に現在のタブ数を表示する
function displayNum(tabsLength, maxTabNum){
    if(tabsLength == maxTabNum){
        chrome.action.setBadgeText({text: String("MAX")});
    }else{
        chrome.action.setBadgeText({text :  String(tabsLength + '/' + maxTabNum)});
    }
}
