//main
chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
    //タブ数を表示する
    document.querySelector("#numOfTabs").innerHTML = tabs.length;
    //全タブのタイトル，URLを表示する
    let txt = "";
    tabs.forEach((tab) => {
        txt += `[${tab.title}] (${tab.url})\n\n`;
    });
    document.querySelector("#txt").value = txt;
    //開けるタブの最大値を表示
    chrome.storage.local.get("maxTabNum", (items) => {
        document.querySelector("#maxTabNum").value = items.maxTabNum;
    });
    //設定できる値の最小値を現在のタブ数にする
    document.querySelector("#maxTabNum").min = tabs.length;
});

//Event
window.addEventListener("load",() => {

    const searchResult = document.getElementById("resultSelect");
    const searchinput = document.getElementById("inputSearch");


    //copyボタンが押されたらtextareaの内容をクリップボードにコピーする
    document.querySelector("#copyButton").addEventListener("click", () => {
    document.querySelector("#txt").select();
    document.execCommand("copy");
    });
    //変更ボタンが押された時に実行
    document.querySelector("#maxTabNumButton").addEventListener("click", () => {
        chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
            let maxTabNum = document.querySelector("#maxTabNum").value;
            //現在のタブ数より小さい値を設定した場合の処理（キーボードから入力すると設定した最小値より小さい値や文字列が入力できる）
            if(maxTabNum < tabs.length) {
                maxTabNum = tabs.length;//現在のタブ数を変数maxTabNumに代入
                document.querySelector("#maxTabNum").value = tabs.length;//現在のタブ数をpopupに表示する．
            }
            //ストレージのmaxTabNumに開けるタブ数の最大値を格納
            chrome.storage.local.set({maxTabNum : maxTabNum});
        });
    });

    //検索窓 --shita
    searchinput.addEventListener("change", (event) =>{
    searchResult.disabled = false;
    searchResult.replaceChildren();
    chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        var input = event.target.value;
        tabs.forEach((tab) => {
            if(tab.title.toLowerCase().indexOf(input) > -1){
                let option = document.createElement("option");
                option.value = tab.id;
                option.text = tab.title;
                searchResult.appendChild(option);
            };
        });
        let countTabs = document.createElement("option");
        countTabs.setAttribute("selected", true);
        countTabs.text = "ヒット件数: "+searchResult.childElementCount;
        searchResult.prepend(countTabs);
        });
    });
    //検索結果欄  --shita
    //--検索結果欄初期表示  あとで検索結果のこしておく処理作りたい
    const defaultOption = document.createElement("option");
    defaultOption.text = "検索結果がここに表示されます。";
    searchResult.replaceChildren(defaultOption);
    searchResult.disabled = true;
    //--
    searchResult.addEventListener("change", (event) =>{
        chrome.tabs.update(Number(event.target.value),{active : true});
    });

    //同一タブ削除ボタン --shita
    chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        const onlyTabs = tabs.filter((tab,index,array) =>{
            return (array.findIndex(nextTab => tab.url === nextTab.url) !== index)
        });
        if(onlyTabs.length != 0){
            const h_sametab = document.getElementById("sameTabDelete");
            console.log(h_sametab);
            h_sametab.innerHTML="重複タブ:"+ Number(onlyTabs.length) +"個"+'<button class = "deletetabs_button" id="deleteTabsButton" disabled>削除</button>';
            const deleteTab = document.getElementById("deleteTabsButton");
            deleteTab.disabled = false;
            deleteTab.addEventListener("click", (event) =>{
                chrome.tabs.remove(onlyTabs.map((tab) => Number(tab.id)));
                h_sametab.textContent = "重複タブを削除しました。";
            });
        };
    });
});
