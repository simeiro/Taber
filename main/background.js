//拡張機能インストール時実行
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //開けるタブの最大値の初期値を現在のタブ数にする --fuma
        chrome.storage.local.set({ maxTabNum: tabs.length });
        //checboxの初期値をfalseにする--ここメインで消えてた
        chrome.storage.local.set({ check: false });
        displayNum(tabs.length, tabs.length ,false);
        makeIcon(tabs.length, tabs.length ,false);
        console.log("oninstalled:::"+tabs.length)
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
            displayNum(tabs.length, items.maxTabNum ,items.check);
            makeIcon(tabs.length, items.maxTabNum ,items.check);
            console.log("onupdated:::"+items.maxTabNum);
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
            displayNum(tabs.length, items.maxTabNum ,items.check);
            makeIcon(tabs.length, items.maxTabNum ,items.check);
            console.log("onremove:::"+items.maxTabNum);
        });
    });
});

//アイコンを作成する関数
function makeIcon(tabsLength, maxTabNum ,check){
    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    if(check == true){
        context.fillStyle = `rgb(255, ${255 - 255 * (tabsLength/maxTabNum)}, ${255- 255 * (tabsLength/maxTabNum)})`; //白→赤のグラデーション
    }else{
        context.fillStyle = "rgb(0, 255, 0)"; //∞なら緑
    }

    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({ imageData: imageData }, () => {
    });
}

//アイコン下に現在のタブ数を表示する
function displayNum(tabsLength, maxTabNum ,check){
    if(tabsLength == maxTabNum && check == true){ 
        chrome.action.setBadgeText({text: String("MAX")});
    }else if(check == true){
        chrome.action.setBadgeText({text :  String(tabsLength + "/" + maxTabNum)});
    }else{ //check == false
        chrome.action.setBadgeText({text :  String(tabsLength + "/∞")});
    }
}