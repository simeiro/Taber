chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
    //popupの大きさ
    if (screen.width > 600) {//スクリーンが600px以下の場合
        $("body").css("width", "300px");
        $(".URLList").css("font-size", "10px");
        $("#textarea").css("width", "290px");
    }
    else {//スクリーンが600pxより大きい場合
        $("body").css("width", "400px");
        $(".URLList").css("font-size", "16px");
        $("#textarea").css("width", "390px");
    }
    $("#textarea>*").css({ "width": String($("body").css("width")) });
    chrome.storage.local.get(["maxTabNum", "check", "tabGroups", "group"], (items) => {
        //開けるタブの最大値とcheckboxの状態を表示 --fuma
        if (items.check == false) {
            chrome.storage.local.set({ maxTabNum: tabs.length });
            document.querySelector("#maxTabNum").value = tabs.length;
        } else {
            document.querySelector("#maxTabNum").value = items.maxTabNum;
        };
        document.querySelector("#check").checked = items.check;
        //設定できる値の最小値を現在のタブ数に設定 --fuma
        document.querySelector("#maxTabNum").min = tabs.length;
        //タブリストの初期設定 --fuma
        chrome.storage.local.set({ groupStatus: "domains" });
        for (let i = 0; i < items.tabGroups.length; i++) {
            //ドメイン要素を追加
            let ul = document.createElement("ul");
            ul.innerHTML = items.tabGroups[i][0];
            ul.value = i;
            //ドメイン名の前にアイコンを追加
            let img = document.createElement("img");
            img.src = "http://www.google.com/s2/favicons?domain=" + items.tabGroups[i][0];
            ul.prepend(img);
            document.querySelector("#domains").appendChild(ul);
        };
        //URLリストボタンの初期値設 --fuma
        document.querySelector("#URLListButton").value = "close";
        //タブグループ化ボタンの初期値設定 --fuma
        if (items.group == "notGrouped") {
            document.querySelector("#tabGroup").innerHTML = "&ensp;グループ化&ensp;";
        }
        else {
            document.querySelector("#tabGroup").innerHTML = "グループ解除";
        };
    });
});

//events
window.addEventListener("load", () => {
    const searchResult = document.getElementById("resultSelect");
    const searchinput = document.getElementById("inputSearch");

    //URLリストボタンが押された時実行 --fuma
    document.querySelector("#URLListButton").addEventListener("click", (event) => {
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            if (event.target.value == "close") {//閉じている場合，開く
                //ボタンの状態を変更
                event.target.value = "open";
                event.target.innerHTML = "閉じる"
                //URLリストを追加
                let textarea = document.createElement("textarea");
                let txt = "";
                tabs.forEach((tab) => {
                    txt += `[${tab.title}] (${tab.url})\n\n`;
                });
                textarea.value = txt;
                document.querySelector("#textarea").appendChild(textarea);
                //コピーボタンを追加
                let button = document.createElement("button");
                button.innerHTML = "コピー";
                button.value = "copy";
                document.querySelector("#copyButton").appendChild(button);
            }
            else {//開いている場合，閉じる
                event.target.value = "close";
                event.target.innerHTML = "&ensp;開く&ensp;"
                document.querySelector("#textarea").replaceChildren();
                document.querySelector("#copyButton").replaceChildren();
            };
        });
    });

    //copyボタンが押されたらtextareaの内容をクリップボードにコピー --fuma
    document.querySelector("#copyButton").addEventListener("click", (event) => {
        if (event.target.value == "copy") {
            document.getSelection().selectAllChildren(document.querySelector("#textarea"));
            document.execCommand('copy');
        };
    });

    //最大値の数字が変わったら実行 --fuma
    document.querySelector("#maxTabNum").addEventListener("change", () => {
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            //変数maxTabNumをナンバーボックスの値として定義
            let maxTabNum = document.querySelector("#maxTabNum").value;
            //キーボードから想定外の値を入力した場合，現在のタブ数を変数maxTabNumに代入し表示
            if (maxTabNum < tabs.length) {
                maxTabNum = tabs.length;
                document.querySelector("#maxTabNum").value = tabs.length;
            }
            //ストレージのmaxTabNumに変数maxTabNumの値を格納
            chrome.storage.local.set({ maxTabNum: maxTabNum });
            //backgroundのアイコンを変える関数を呼び出す
            chrome.runtime.sendMessage("changeIcon");
        });
    });

    //checkboxが押された時実行 --fuma
    document.querySelector("#check").addEventListener("change", () => {
        //ストレージのcheckにcheckboxの状態を格納
        chrome.storage.local.set({ check: document.querySelector("#check").checked });
        //アイコンを変える関数を呼び出す
        chrome.runtime.sendMessage("changeIcon");
    });

    //タブリストの要素が押された時実行 --fuma
    document.querySelector("#domains").addEventListener("click", (event) => {
        chrome.storage.local.get(["groupStatus", "tabGroups"], (items) => {
            chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
                //クリックされた場所を判定
                let result = 0;
                //タイトルの場合タブを移動
                tabs.forEach((tab) => {
                    if (tab.id == event.target.value) {
                        chrome.tabs.update((tab.id), { active: true });
                        result++;
                    };
                });
                //ドメインの場合タイトル要素を表示
                if (result == 0) {
                    document.querySelector("#domains").replaceChildren();
                    for (let i = 0; i < items.tabGroups.length; i++) {
                        //ドメイン要素を表示
                        let ul = document.createElement("ul");
                        ul.innerHTML = items.tabGroups[i][0];
                        ul.value = i;
                        //ドメイン名の前にアイコンを追加
                        let img = document.createElement("img");
                        img.src = "http://www.google.com/s2/favicons?domain=" + items.tabGroups[i][0];
                        ul.prepend(img);
                        if (i == event.target.value && items.groupStatus != i) {//タイトル要素がなければ追加
                            for (let j = 2; j < items.tabGroups[i].length; j += 3) {
                                let li = document.createElement("li");
                                li.value = items.tabGroups[i][j + 1];//タブのid
                                li.innerHTML = items.tabGroups[i][j];//タブのタイトル
                                ul.appendChild(li);
                                //groupStatusをiに変更 
                                chrome.storage.local.set({ groupStatus: i });
                            }
                        }
                        else if (i == event.target.value) {//タイトル要素があるなら削除し，groupStatusをdomainsに変更
                            chrome.storage.local.set({ groupStatus: "domains" });
                        }
                        document.querySelector("#domains").appendChild(ul);
                    };
                };
            });
        });
    });

    //グループ化ボタンが押された時実行 --fuma
    document.querySelector("#tabGroup").addEventListener("click", (event) => {
        //popupの表示のみ(他の処理はbackground.jsに移譲)
        chrome.storage.local.get(["group"], (items) => {
            if (items.group == "notGrouped") {//グループ化されている場合
                event.target.innerHTML = "グループ解除";
                chrome.runtime.sendMessage("group");
            }
            else {//グループ化されていない場合
                event.target.innerHTML = "&ensp;グループ化&ensp;";
                chrome.runtime.sendMessage("ungroup");
            }
        });
    });

    //検索窓 --shita
    searchinput.addEventListener("change", (event) => {
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            searchResult.disabled = false;
            searchResult.replaceChildren();
            chrome.storage.local.get(["tsm"], (value) => {
                var input = event.target.value.toLowerCase();
                switch (value.tsm) {
                    case "0":
                        tabs.forEach((tab) => {
                            if (tab.title.toLowerCase().indexOf(input) > -1) {
                                let option = document.createElement("option");
                                option.value = tab.id;
                                option.text = tab.title;
                                searchResult.appendChild(option);
                            };
                        });
                        break;
                    case "1":
                        tabs.forEach((tab) => {
                            if (tab.url.toLowerCase().indexOf(input) > -1) {
                                let option = document.createElement("option");
                                option.value = tab.id;
                                option.text = tab.title;
                                searchResult.appendChild(option);
                            };
                        });
                        break;
                    case "2":
                        tabs.forEach((tab) => {
                            if (tab.title.toLowerCase().indexOf(input) > -1 || tab.url.toLowerCase().indexOf(input) > -1) {
                                let option = document.createElement("option");
                                option.value = tab.id;
                                option.text = tab.title;
                                searchResult.appendChild(option);
                            };
                        });
                        break;
                }
                let countTabs = document.createElement("option");
                countTabs.setAttribute("selected", true);
                countTabs.text = "ヒット件数: " + searchResult.childElementCount;
                searchResult.prepend(countTabs);
            });
        });
    });

    //検索結果欄  --shita
    //--検索結果欄初期表示  あとで検索結果のこしておく処理作りたい
    const defaultOption = document.createElement("option");
    defaultOption.text = "検索結果がここに表示されます。";
    searchResult.replaceChildren(defaultOption);
    searchResult.disabled = true;
    //--
    searchResult.addEventListener("change", (event) => {
        chrome.tabs.update(Number(event.target.value), { active: true });
    });

    //同一タブ削除ボタン --shita
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        chrome.storage.local.get(["stm"], (value) => {
            switch (value.stm) {
                case "0":
                    var onlyTabs = tabs.filter((tab, index, array) => {
                        return (array.findIndex(nextTab => tab.title === nextTab.title) !== index)
                    });
                    break;

                case "1":
                    var onlyTabs = tabs.filter((tab, index, array) => {
                        return (array.findIndex(nextTab => tab.url === nextTab.url) !== index)
                    });
                    break;

                case "2":
                    var onlyTabs = tabs.filter((tab, index, array) => {
                        // if(1 ===(array.findIndex(nextTab => tab.title === nextTab.title) !== index));
                        return (array.findIndex(nextTab => tab.title === nextTab.title || tab.url === nextTab.url) !== index)
                    });
                    break;
            };
            if (onlyTabs.length != 0) {
                const h_sametab = document.getElementById("sameTabDelete");
                h_sametab.innerHTML = "重複タブ:" + Number(onlyTabs.length) + "個" + '<button class = "deletetabs_button" id="deleteTabsButton" disabled>削除</button>';
                const deleteTab = document.getElementById("deleteTabsButton");
                deleteTab.disabled = false;
                deleteTab.addEventListener("click", (event) => {
                    chrome.tabs.remove(onlyTabs.map((tab) => Number(tab.id)));
                    h_sametab.textContent = "重複タブ:0個";
                });
                $(function () {
                    $(".deletetabs_button").text("削除");
                    $(".deletetabs_button").css({
                        "box-shadow": "0 5px #4433ff",
                        "visibility": "visible"
                    });
                });
            };
        });
    });
    $('#config').on('click', (e) => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });

});

//メッセージ取得時実行
chrome.runtime.onMessage.addListener((data) => {
    chrome.storage.local.get(["group", "maxTabNum"], (items) => {
        //popupの表示のみ(他の処理はbackground.jsに移譲)
        switch (data) {
            case "group":
                document.querySelector("#tabGroup").innerHTML = "グループ解除";
                break;
            case "ungroup":
                document.querySelector("#tabGroup").innerHTML = "&ensp;グループ化&ensp;";
                break;
            case "changeMaxTabNum":
                document.querySelector("#maxTabNum").value = items.maxTabNum;
                break;
            case "checkON":
                document.querySelector("#check").checked = true;
                document.querySelector("#maxTabNum").value = items.maxTabNum;
                break;
            case "checkOFF":
                document.querySelector("#check").checked = false;
                document.querySelector("#maxTabNum").value = items.maxTabNum;
                break;
            default:
                break;
        }
    });
});