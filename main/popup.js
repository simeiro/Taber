chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
  //タブ数をpopupに表示する
  document.querySelector("#numOfTabs").innerHTML = tabs.length;
  //全タブのタイトル，URLをpopupに表示する
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

//検索窓
  document.getElementById("inputSearch").addEventListener("change", (event) =>{
    console.log(event.target.value);
    chrome.tabs.query({windowId : chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
      var input = event.target.value;
      tabs.forEach((tab) => {
        if(tab.indexOf(input) > -1){
          // 部分一致のときの処理
        }
      });
    })
  })
});

