const TAB_NUM = 10;
let domain = [];


/*
現状コンソールに2回表示されるようになっている
原因を探してます
*/
chrome.tabs.onUpdated.addListener((tabId, info, tab) =>{
    chrome.tabs.query({}, tabs => {

        for(let i=0; i<tabs.length; i++){
            domain[i] = new URL(tabs[i].url).hostname; // ドメイン名の取得
            console.log(domain[i]); 

            for(let j=0; j<i; j++){
                if(domain[i]==domain[j]){
                    console.log("-------------"); //2つ以上同じドメインがあるかの判定
                    break;
                }
            }
        }

        if(tabs.length >= TAB_NUM){
            chrome.tabs.remove(tabId); // 更新されたタブのidを削除
        }
    });
});



