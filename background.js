// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'chatgpt') {
    fetch(request.url, request.options)
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({error}));
    return true;
  }
});