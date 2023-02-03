$(function(){
    //タブ検索窓-simeiro

    //開くボタンを押した時には
    $(".open-btn").on("click",function () {
        $("#search-wrap").removeClass('result');
        $("#search-wrap").addClass('panelactive');//#search-wrapへpanelactiveクラスを付与
        $('#inputSearch').focus();//テキスト入力のinputにフォーカス
    });
    //enterキーを押したとき
    $("input[type='text']").on("keydown", function(e){    
        if(e.which == 13){//enterキー
            $("#search-wrap").addClass('result');//検索窓だけを非表示
            $(".result_select").addClass('active');
        }
    });
    //検索ボタンを押したとき
    $("#searchsubmit").on("click", function(){
        $("#search-wrap").addClass('result');//検索窓だけを非表示
        $(".result_select").addClass('active');
    });
    //閉じるボタンを押した時には
    $(".close-btn").on("click", function () {
        $("#search-wrap").removeClass('panelactive');//#search-wrapからpanelactiveクラスを除去
        $(".result_select").removeClass('active');
    });
    // タブ検索窓終了

});
