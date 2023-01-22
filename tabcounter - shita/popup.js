function countTabs(){
    chrome.tabs.query({},tabs =>{
    document.getElementById("numTabs").innerHTML = tabs.length;
    });
}