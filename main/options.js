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
//話終わったタイミングで実行
recognition.onresult = (event) => {
    const num = event.results.length;
    const word = event.results[num - 1].length;
    const txt = event.results[num - 1][word - 1].transcript;
    console.log(event.results[num - 1][word - 1]);
    chrome.storage.local.get(["group"], (items) => {
        if (txt == "グループ化" && items.group == "notGrouped") {
            chrome.runtime.sendMessage("group");
            speechSynthesis.speak(
                new SpeechSynthesisUtterance("タブをグループ化しました．")
            );
        }
        else if (txt == "グループ解除" && items.group == "grouped") {
            chrome.runtime.sendMessage("ungroup");
            speechSynthesis.speak(
                new SpeechSynthesisUtterance("グループを解除しました．")
            );
        }
    });
}
recognition.onend = () => {
    recognition.start();
}
recognition.start();