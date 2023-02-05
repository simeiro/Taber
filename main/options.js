$(function () {
    // chrome.storage.local.clear();
    // 遷移後、保存したローカルストレージの読み込み

    chrome.storage.local.get(["tsm", "stm", "bm"], (value) => {
        $("input:radio[name='b_tsm']").val([value.tsm]);
        $("input:radio[name='b_stm']").val([value.stm]);
        $("input:radio[name='b_bm']").val([value.bm]);
    });
    $("#saveB").on("click", function () {
        var tsmv = $("input:radio[name='b_tsm']:checked").val();
        chrome.storage.local.set({ tsm: tsmv });
        var stmv = $("input:radio[name='b_stm']:checked").val();
        chrome.storage.local.set({ stm: stmv });
        var bmv = $("input:radio[name='b_bm']:checked").val();
        chrome.storage.local.set({ bm: bmv});
    });
    $("#resetB").on("click", function () {
        chrome.storage.local.get(["tsm", "stm", "bm"], (value) => {
            $("input:radio[name='b_tsm']").val([value.tsm]);
            $("input:radio[name='b_stm']").val([value.stm]);
            $("input:radio[name='b_bm']").val([value.bm]);
        });
    });
});

//音声認識 --fuma
window.SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();//音声認識のオブジェクト生成
recognition.interimResults = true;//認識途中にも結果を取得
recognition.continuous = true;//音声認識を持続
//結果取得時実行
recognition.onresult = (event) => {
    const num = event.results.length;
    const word = event.results[num - 1].length;
    let txt = "";
    txt = event.results[num - 1][word - 1].transcript;
    console.log(event.results[num - 1][word - 1].transcript);/*console*/
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        chrome.storage.local.get(["group", "check"], (items) => {
            if (txt == "グループ化" && items.group == "notGrouped") {
                recognition.abort();
                chrome.runtime.sendMessage("group");
                speechSynthesis.speak(new SpeechSynthesisUtterance("タブをグループ化しました．"));
            }
            else if (txt == "グループ解除" && items.group == "grouped") {
                recognition.abort();
                chrome.runtime.sendMessage("ungroup");
                speechSynthesis.speak(new SpeechSynthesisUtterance("グループを解除しました．"));
            }
            else if (txt == "このタブを削除") {
                chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT, active: true }, (activeTabs) => {
                    recognition.abort();
                    chrome.tabs.remove(Number(activeTabs[0].id));
                    speechSynthesis.speak(new SpeechSynthesisUtterance("タブを削除しました．"));
                });
            }
            else if (txt == "前のページ") {
                recognition.abort();
                chrome.tabs.goBack().then(() => { }, () => { });
            }
            else if (txt == "次のページ") {
                recognition.abort();
                chrome.tabs.goForward().then(() => { }, () => { });
            }
            else if (txt.substr(0, 4) == "最大値を" && txt.substr(-3, 3) == "に設定") {
                recognition.abort();
                if (!isNaN(Number(txt.slice(4, -3))) && items.check == true) {
                    maxTabNum = Number(txt.slice(4, -3));//音声コマンドの数字の部分
                    if (maxTabNum < tabs.length) {
                        maxTabNum = tabs.length;
                        speechSynthesis.speak(new SpeechSynthesisUtterance("最大値を現在のタブ数に変更しました．"));
                    }
                    else {
                        speechSynthesis.speak(new SpeechSynthesisUtterance(`最大値を変更しました．`));
                    }
                    chrome.storage.local.set({ maxTabNum: maxTabNum });
                    chrome.runtime.sendMessage("changeMaxTabNum");
                    chrome.runtime.sendMessage("changeIcon");
                }
                else if (items.check == false) {
                    speechSynthesis.speak(new SpeechSynthesisUtterance("制限機能がオンになっていません．"));
                }
            }
            else if (txt == "制限機能オン") {
                recognition.abort();
                chrome.storage.local.set({ maxTabNum: tabs.length });
                chrome.storage.local.set({ check: true });
                chrome.runtime.sendMessage("checkON");
            }
            else if ((txt == "制限機能オフ")) {
                recognition.abort();
                chrome.storage.local.set({ maxTabNum: tabs.length });
                chrome.storage.local.set({ check: false });
                chrome.runtime.sendMessage("checkOFF");
            }
        });
    });
}
//話終わった時実行
recognition.onend = () => {
    recognition.start();
}
recognition.start();
