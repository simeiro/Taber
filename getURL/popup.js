chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
  document.querySelector("#numOfTabs").innerHTML = tabs.length;//タブの数を表示する

  let txt = "";
  tabs.forEach((tab) => {
    txt += `[${tab.title}] (${tab.url})\n\n`;
  });
  document.querySelector("#txt").value = txt;//タブのタイトル，URLを表示する

  document.querySelector("#maxTabNum").min = tabs.length;//設定できる値の最小値を現在のタブ数にする

  chrome.storage.local.get("maxTabNum", (items)=>{
    document.querySelector("#maxTabNum").value = items.maxTabNum;//開けるタブの最大値を表示
  });
});

window.addEventListener("load",()=>{
  //ボタンが押されたらtxtareaの内容をクリップボードにコピーする
  document.querySelector("#copy").addEventListener("click", ()=>{
    const txtarea = document.querySelector("#txt");
    txtarea.select();
    document.execCommand("copy");
  });
  //ボタンが押されたらストレージのmaxTabNumに開けるタブ数の最大値を格納
  document.querySelector("#maxTabNumButton").addEventListener("click", () => {
      let maxTabNum = document.querySelector("#maxTabNum").value;
      chrome.storage.local.set({maxTabNum:maxTabNum});
  });
});