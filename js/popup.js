chrome.tabs.create({
    url: chrome.extension.getURL('options.html')
});
window.close();