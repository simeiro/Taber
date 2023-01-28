$(function(){
    // chrome.storage.local.clear();
// 遷移後、保存したローカルストレージの読み込み
    
    chrome.storage.local.get(["tsm","stm"],(value) =>{
        $("input:radio[name='b_tsm']").val([value.tsm]);
        $("input:radio[name='b_stm']").val([value.stm]);
    });
    $("#saveB").on("click",function(){
        var tsmv = $("input:radio[name='b_tsm']:checked").val();
        chrome.storage.local.set({ tsm: tsmv });
        var stmv = $("input:radio[name='b_stm']:checked").val();
        chrome.storage.local.set({ stm: stmv });
    });
    $("#resetB").on("click",function(){
        chrome.storage.local.get(["tsm","stm"],(value) =>{
            $("input:radio[name='b_tsm']").val([value.tsm]);
            $("input:radio[name='b_stm']").val([value.stm]);
        });
    });
});