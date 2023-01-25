//main
chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
    //タブ数の情報 --fuma
    document.querySelector("#numOfTabs").innerHTML = tabs.length;
    let txt = "";
    tabs.forEach((tab) => {
        txt += `[${tab.title}] (${tab.url})\n\n`;
    });
    document.querySelector("#txt").value = txt;
    //開けるタブの最大値とcheckboxの状態を表示 --fuma
    chrome.storage.local.get(["maxTabNum", "check"], (items) => {
        document.querySelector("#maxTabNum").value = items.maxTabNum;
        document.querySelector("#check").checked = items.check;
    });
    //設定できる値の最小値を現在のタブ数に設定 --fuma
    document.querySelector("#maxTabNum").min = tabs.length;
    //ドメインごとにグループ分けした分けた2次元配列を作る --fuma
    let tabGroups = [];
    tabs.forEach((tab) => {
        const info = tab.url.split("/");
        let a = 0;
        //index0にドメイン，1からはURL，タイトル，IDの順で格納
        for (let i = 0; i < tabGroups.length; i++) {
            const infoOfgroupI = tabGroups[i][1].split("/");
            if (info[0] + info[2] == infoOfgroupI[0] + infoOfgroupI[2]) {
                tabGroups[i].push(tab.url, tab.title, tab.id);
                a++;
            }
        }
        if (a == 0) {
            let domain = "";
            if (info[2] == "") {
                domain = info[3];
            }
            else {
                domain = info[2];
            }
            tabGroups.push([domain, tab.url, tab.title, tab.id]);
        }
        //ストレージのtabGroupsに格納
        chrome.storage.local.set({ tabGroups: tabGroups });
    });
    //groupStatusの初期値をnullにする --fuma
    chrome.storage.local.set({ groupStatus: "null" });
});

//events
window.addEventListener("load", () => {
    const searchResult = document.getElementById("resultSelect");
    const searchinput = document.getElementById("inputSearch");

    //copyボタンが押されたらtextareaの内容をクリップボードにコピー --fuma
    document.querySelector("#copyButton").addEventListener("click", () => {
        document.querySelector("#txt").select();
        document.execCommand("copy");
    });

    //inputタグの数字が変わったら実行 --fuma
    document.querySelector("#maxTabNum").addEventListener("change", () => {
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            let maxTabNum = document.querySelector("#maxTabNum").value;
            //キーボードから想定外の値を入力した場合，現在のタブ数を変数maxTabNumに代入し表示
            if (maxTabNum < tabs.length) {
                maxTabNum = tabs.length;
                document.querySelector("#maxTabNum").value = tabs.length;
            }
            //ストレージのmaxTabNumに変数maxTabNumの値を格納
            chrome.storage.local.set({ maxTabNum: maxTabNum });
            //backgroundのアイコンを変える関数を呼び出す
            chrome.runtime.sendMessage("");
        });
    });

    //checkboxが押された時ストレージのcheckにcheckboxの状態を格納 --fuma
    document.querySelector("#check").addEventListener("change", () => {
        chrome.storage.local.set({ check: document.querySelector("#check").checked });
        //backgroundのアイコンを変える関数を呼び出す
        chrome.runtime.sendMessage("");
    });
    //groupボタンが押された時実行 --fuma
    document.querySelector("#tabList").addEventListener("click", (event) => {
        chrome.storage.local.get(["groupStatus", "tabGroups"], (items) => {
            //リストを閉じている場合はリストを開く
            if (items.groupStatus == "null") {
                //ドメインリストを表示
                for (let i = 0; i < items.tabGroups.length; i++) {
                    let ul = document.createElement("ul");
                    ul.innerHTML = items.tabGroups[i][0];
                    ul.value = i;
                    //ドメイン名の前にアイコンを追加
                    let img = document.createElement("img");
                    img.src = "http://www.google.com/s2/favicons?domain=" + items.tabGroups[i][0];
                    ul.prepend(img);
                    document.querySelector("#domains").appendChild(ul);
                }
                //grouupStatusをdomainsに変更
                chrome.storage.local.set({ groupStatus: "domains" });
                event.target.innerHTML = "閉じる";
            }
            //リストが開いている場合は閉じる
            else {
                //リストを消す
                document.querySelector("#domains").replaceChildren();
                //grouupStatusをnullに変更
                chrome.storage.local.set({ groupStatus: "null" });
                event.target.innerHTML = "開く";
            }
        });
    });

    //groupリストのドメインが押された時実行 --fuma
    document.querySelector("#domains").addEventListener("click", (event) => {
        chrome.storage.local.get(["groupStatus", "tabGroups"], (items) => {
            chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
                //クリックされた場所を判定
                let result = 0;
                tabs.forEach((tab) => {
                    if (tab.id == event.target.value) {
                        //タイトルの場合タブを移動
                        chrome.tabs.update((tab.id), { active: true });
                        result++;
                    }
                });
                //ドメインの場合要素を表示
                if (result == 0) {
                    //ドメインの中の要素を表示
                    document.querySelector("#domains").replaceChildren();
                    for (let i = 0; i < items.tabGroups.length; i++) {
                        let ul = document.createElement("ul");
                        ul.innerHTML = items.tabGroups[i][0];
                        ul.value = i;
                        //ドメイン名の前にアイコンを追加
                        let img = document.createElement("img");
                        img.src = "http://www.google.com/s2/favicons?domain=" + items.tabGroups[i][0];
                        ul.prepend(img);
                        if (i == event.target.value && items.groupStatus != i) {
                            for (let j = 2; j < items.tabGroups[i].length; j += 3) {
                                let li = document.createElement("li");
                                li.value = items.tabGroups[i][j + 1];//タブのid
                                li.innerHTML = items.tabGroups[i][j];//タブのタイトル
                                ul.appendChild(li);
                                //groupStatusをiに変更 
                                chrome.storage.local.set({ groupStatus: i });
                            }
                        }
                        else if (i == event.target.value) {
                            //groupStatusをdomainsに変更 
                            chrome.storage.local.set({ groupStatus: "domains" });
                        }
                        document.querySelector("#domains").appendChild(ul);
                    }
                }
            });
        });
    });

    //グループ化ボタンが押された時実行 --fuma
    document.querySelector("#tabGroup").addEventListener("click", (event) => {
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            chrome.storage.local.get(["tabGroups", "group"], (items) => {
                for (let i = 0; i < items.tabGroups.length; i++) {
                    //配列にタブのidを格納
                    let tabIdList = [];
                    for (let j = 3; j < items.tabGroups[i].length; j += 3) {
                        tabIdList.push(items.tabGroups[i][j]);
                    }
                    //タブをグループ化
                    if (items.group == "notGrouped") {
                        chrome.tabs.ungroup(tabIdList);
                        chrome.tabs.group({ tabIds: tabIdList });
                        chrome.storage.local.set({ group: "Grouped" });
                        event.target.innerHTML="タブのグループ化解除";
                    }
                    //グループ化解除
                    else {
                        chrome.tabs.ungroup(tabIdList);
                        chrome.storage.local.set({ group: "notGrouped" });
                        event.target.innerHTML="タブをグループ化";
                    }
                }
            });
        });
    });

    //検索窓 --shita
    searchinput.addEventListener("change", (event) => {
        searchResult.replaceChildren();
        chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            var input = event.target.value;
            tabs.forEach((tab) => {
                if (tab.title.toLowerCase().indexOf(input) > -1) {
                    let option = document.createElement("option");
                    option.value = tab.id;
                    option.text = tab.title;
                    searchResult.appendChild(option);
                };
            });
            let countTabs = document.createElement("option");
            countTabs.setAttribute("selected", true);
            countTabs.text = "ヒット件数: " + searchResult.childElementCount;
            searchResult.prepend(countTabs);
        });
    });
    //検索結果欄 --shita
    //--検索結果欄初期表示  あとで検索結果のこしておく処理作りたい --shita
    const defaultOption = document.createElement("option");
    defaultOption.text = "検索結果がここに表示されます。";
    searchResult.replaceChildren(defaultOption);
    //--
    searchResult.addEventListener("change", (event) => {
        chrome.tabs.update(Number(event.target.value), { active: true });
    });
});