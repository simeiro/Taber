chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
  document.querySelector("#numOfTabs").innerHTML = tabs.length;//タブの数を表示する

  let txt = "";
  tabs.forEach((tab) => {
    txt += `[${tab.title}] (${tab.url})\n\n`;
  });
  document.querySelector("#txt").value = txt;//タブのタイトル，URLを表示する

  document.querySelector("#maxTabNum").min = tabs.length;//設定できる値の最小値を現在のタブ数にする

  chrome.storage.local.get("maxNum", (items)=>{
    document.querySelector("#maxTabNum").value = items.maxNum;//開けるタブの最大値を表示
  });
});

window.addEventListener("load",()=>{
  //ボタンが押されたらtxtareaの内容をクリップボードにコピーする
  document.querySelector("#copy").addEventListener("click", ()=>{
    const txtarea = document.querySelector("#txt");
    txtarea.select();
    document.execCommand("copy");
  });
  //ボタンが押されたら
  document.querySelector("#maxNum").addEventListener("click", () => {
      let maxTabNum = document.querySelector("#maxTabNum").value;
      chrome.storage.local.set({maxNum:maxTabNum});
  });
});