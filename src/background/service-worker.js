chrome.contextMenus.create({
  id: 'ask-chatgpt',
  title: 'Ask ChatGPT',
  contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info) => {
  if(info.menuItemId === 'ask-chatgpt') {
    chrome.tabs.query({active: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'process-selection',
        text: info.selectionText
      });
    });
  }
});