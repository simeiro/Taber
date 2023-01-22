//main --fuma
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
    const searchResult = document.getElementById("resultSelect");
    const searchinput = document.getElementById("inputSearch");

    //copyボタンが押されたらtextareaの内容をクリップボードにコピー --fuma
    document.querySelector("#copyButton").addEventListener("click", () => {
        document.querySelector("#txt").select();
        document.execCommand("copy");
    });
    //変更ボタンが押された時実行 --fuma
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
    //checkboxが押された時ストレージのcheckにcheckboxの状態を格納 --fuma
    document.querySelector("#check").addEventListener("change", () => {
        chrome.storage.local.set({ check: document.querySelector("#check").checked });
    });

    //検索窓 --shita
    searchinput.addEventListener("change", (event) => {
        console.log(event.target.value);
        searchResult.replaceChildren();
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            var input = event.target.value;
            tabs.forEach((tab) => {
                if (tab.title.toLowerCase().indexOf(input) > -1) {
                    let option = document.createElement("option");
                    option.value = tab.id;
                    option.text = tab.title;
                    console.log(option)
                    searchResult.appendChild(option);
                };
            });
            let countTabs = document.createElement("option");
            countTabs.setAttribute("selected", true);
            countTabs.text = "ヒット件数: " + searchResult.childElementCount;
            searchResult.prepend(countTabs);
        });
    });
    //検索結果欄  --shita
    //--検索結果欄初期表示  あとで検索結果のこしておく処理作りたい
    const defaultOption = document.createElement("option");
    defaultOption.text = "検索結果がここに表示されます。";
    searchResult.replaceChildren(defaultOption);
    //--
    searchResult.addEventListener("change", (event) => {
        chrome.tabs.update(Number(event.target.value), { active: true });
    });
});