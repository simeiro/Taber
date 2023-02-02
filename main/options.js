$(function () {
    // chrome.storage.local.clear();
    // 遷移後、保存したローカルストレージの読み込み

    chrome.storage.local.get(["tsm", "stm"], (value) => {
        $("input:radio[name='b_tsm']").val([value.tsm]);
        $("input:radio[name='b_stm']").val([value.stm]);
    });
    $("#saveB").on("click", function () {
        var tsmv = $("input:radio[name='b_tsm']:checked").val();
        chrome.storage.local.set({ tsm: tsmv });
        var stmv = $("input:radio[name='b_stm']:checked").val();
        chrome.storage.local.set({ stm: stmv });
    });
    $("#resetB").on("click", function () {
        chrome.storage.local.get(["tsm", "stm"], (value) => {
            $("input:radio[name='b_tsm']").val([value.tsm]);
            $("input:radio[name='b_stm']").val([value.stm]);
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
    if (word > 0 && event.results[num - 1][word - 1] != event.results[num - 1][word - 2]) {
        txt = event.results[num - 1][word - 1].transcript;
    }
    console.log(event.results[num - 1][word - 1].transcript);/*console*/
    chrome.storage.local.get(["group"], (items) => {
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
            recognition.abort();
            chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT, active: true }, (tabs) => {
                chrome.tabs.remove(Number(tabs[0].id));
            });
            speechSynthesis.speak(new SpeechSynthesisUtterance("タブを削除しました．"));
        }
        else if (txt == "前のページ") {
            recognition.abort();
            chrome.tabs.goBack().then(() => { }, () => { });
        }
        else if (txt == "次のページ") {
            recognition.abort();
            chrome.tabs.goForward().then(() => { }, () => { });
        }
    });
}
//話終わった時実行
recognition.onend = () => {
    recognition.start();
}
recognition.start();