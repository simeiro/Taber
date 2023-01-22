//main
chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
    //タブ数を表示
    document.querySelector("#numOfTabs").innerHTML = tabs.length;
    //全タブのタイトル，URLを表示
    let txt = "";
    tabs.forEach((tab) => {
        txt += `[${tab.title}] (${tab.url})\n\n`;
    });
    document.querySelector("#txt").value = txt;
    //開けるタブの最大値とcheckboxの状態を表示
    chrome.storage.local.get(["maxTabNum", "check"], (items) => {
        document.querySelector("#maxTabNum").value = items.maxTabNum;
        document.querySelector("#check").checked = items.check;
    });
    //設定できる値の最小値を現在のタブ数に設定
    document.querySelector("#maxTabNum").min = tabs.length;
});

//event
window.addEventListener("load", () => {
    //copyボタンが押された時textareaの内容をクリップボードにコピー
    document.querySelector("#copyButton").addEventListener("click", () => {
        document.querySelector("#txt").select();
        document.execCommand("copy");
    });
    //変更ボタンが押された時実行
    document.querySelector("#maxTabNumButton").addEventListener("click", () => {
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            let maxTabNum = document.querySelector("#maxTabNum").value;
            //キーボードから想定外の値を入力した場合，現在のタブ数を変数maxTabNumに代入し表示
            if (maxTabNum < tabs.length) {
                maxTabNum = tabs.length;
                document.querySelector("#maxTabNum").value = tabs.length;
            }
            //ストレージのmaxTabNumに変数maxTabNumの値を格納
            chrome.storage.local.set({ maxTabNum: maxTabNum });
        });
    });
    //checkboxが押された時ストレージのcheckにcheckboxの状態を格納
    document.querySelector("#check").addEventListener("change", () => {
        chrome.storage.local.set({ check: document.querySelector("#check").checked });
    });
});