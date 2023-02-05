//拡張機能インストール時実行
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        //アイコンの表示
        displayNum(tabs.length, tabs.length, false);
        makeIcon(tabs.length, tabs.length, false);
        //ストレージの初期値を設定
        chrome.storage.local.set({ maxTabNum: tabs.length });
        chrome.storage.local.set({ check: false });
        chrome.storage.local.set({ group: "notGrouped" });
        chrome.storage.local.set({ tsm: "0" });
        chrome.storage.local.set({ stm: "1" });
    });
});

//タブ更新時実行
chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        chrome.storage.local.get(["maxTabNum", "check", "group"], (items) => {
            //ストレージにタブの情報を格納
            makeGroup(tabs);
            //アイコンの表示
            displayNum(tabs.length, items.maxTabNum, items.check);
            makeIcon(tabs.length, items.maxTabNum, items.check);
            //ストレージに格納されているmaxTabNumよりタブ数が多くchecboxがtrueならば新しいタブを閉じる
            if (items.check == true && tabs.length > items.maxTabNum) {
                chrome.tabs.remove(Number(tab.id));
                let noti = {
                    type: "basic",
                    title: "タブ制限超過",
                    message: items.maxTabNum + "個以上は開けません。",
                    iconUrl: "./taber128.png"
                };
                chrome.notifications.create(noti);
            }
            else if (items.group == "grouped") {
                tabGroup();//新しいタブもグループ化
            }
        });
    });
});

//タブ削除時実行
chrome.tabs.onRemoved.addListener(() => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        chrome.storage.local.get(["maxTabNum", "check"], (items) => {
            //タブの情報をストレージに格納
            makeGroup(tabs);
            //アイコンの表示
            displayNum(tabs.length, items.maxTabNum, items.check);
            makeIcon(tabs.length, items.maxTabNum, items.check);
            //checkboxがfalseなら現在のタブ数をストレージのmaxTabNumに格納
            if (items.check == false) {
                chrome.storage.local.set({ maxTabNum: tabs.length });
            }
        });
    });
});

//メッセージ取得時実行
chrome.runtime.onMessage.addListener((data) => {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        chrome.storage.local.get(["maxTabNum", "check"], (items) => {
            switch (data) {
                case "changeIcon":
                    displayNum(tabs.length, items.maxTabNum, items.check);
                    makeIcon(tabs.length, items.maxTabNum, items.check);
                    break;
                case "group":
                    tabGroup();
                    break;
                case "ungroup":
                    tabUngroup();
                    break;
                case "checkON":
                    displayNum(tabs.length, items.maxTabNum, items.check);
                    makeIcon(tabs.length, items.maxTabNum, items.check);
                    break;
                case "checkOFF":
                    displayNum(tabs.length, items.maxTabNum, items.check);
                    makeIcon(tabs.length, items.maxTabNum, items.check);
                    break;
                default:
                    break;
            }
        });
    });
});

//アイコンを作成する関数
function makeIcon(tabsLength, maxTabNum, check) {
    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    if (check == true) {
        context.fillStyle = `rgb(255, ${255 - 255 * (tabsLength / maxTabNum)}, ${255 - 255 * (tabsLength / maxTabNum)})`; //白→赤のグラデーション
    } else {
        context.fillStyle = "rgb(0, 255, 0)"; //∞なら緑
    }
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({ imageData: imageData }, () => {
    });
}
//アイコン下に現在のタブ数を表示する関数
function displayNum(tabsLength, maxTabNum, check) {
    if (tabsLength == maxTabNum && check == true) {
        chrome.action.setBadgeText({ text: String("MAX") });
    } else if (check == true && maxTabNum < 100) {
        chrome.action.setBadgeText({ text: String(tabsLength + "/" + maxTabNum) });
    } else { //check == false
        chrome.action.setBadgeText({ text: String(tabsLength + "/∞") });
    }
}
//タブをグループ化する関数
function tabGroup() {
    chrome.storage.local.get(["tabGroups", "group"], (items) => {
        for (let i = 0; i < items.tabGroups.length; i++) {
            //配列にタブのidを格納
            let tabIdList = [];
            for (let j = 3; j < items.tabGroups[i].length; j += 3) {
                tabIdList.push(items.tabGroups[i][j]);
            }
            //グループ化
            chrome.tabs.ungroup(tabIdList);
            chrome.tabs.group({ tabIds: tabIdList });
            chrome.storage.local.set({ group: "grouped" });
        }
    });
}
//グループを解除する関数
function tabUngroup() {
    chrome.storage.local.get(["tabGroups", "group"], (items) => {
        for (let i = 0; i < items.tabGroups.length; i++) {
            //配列にタブのidを格納
            let tabIdList = [];
            for (let j = 3; j < items.tabGroups[i].length; j += 3) {
                tabIdList.push(items.tabGroups[i][j]);
            }
            //グループ化解除
            chrome.tabs.ungroup(tabIdList);
            chrome.storage.local.set({ group: "notGrouped" });
        }
    });
}
//ストレージにタブの情報を格納する関数
function makeGroup(tabs) {
    //ドメインごとにグループ分けした分けた2次元配列を作る
    let tabGroups = [];
    tabs.forEach((tab) => {
        //ロード中のタブのURLを取得
        if (tab.url == "") {
            tab.url = tab.pendingUrl;
        }
        const info = tab.url.split("/");
        let a = 0;
        //index0にドメイン，1からはURL，タイトル，IDの順で格納
        for (let i = 0; i < tabGroups.length; i++) {
            const infoOfgroupI = tabGroups[i][1].split("/");
            if (info[0] + info[2] == infoOfgroupI[0] + infoOfgroupI[2]) {
                tabGroups[i].push(tab.url, tab.title, tab.id);
                a++;
            };
        };
        if (a == 0 && info[2] == "") {
            const domain = info[3];
            tabGroups.push([domain, tab.url, tab.title, tab.id]);
        }
        else if (a == 0) {
            const domain = info[2];
            tabGroups.push([domain, tab.url, tab.title, tab.id]);
        };
        //ストレージのtabGroupsに格納
        chrome.storage.local.set({ tabGroups: tabGroups });
    });
}