chrome.browserAction.setBadgeBackgroundColor({color: [0, 200, 0, 100]});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "setBadgeText") {
        chrome.browserAction.setBadgeText({text: request.text});
    }
    else if (request.method === "setBadgeColor") {
        chrome.browserAction.setBadgeBackgroundColor({color: request.color});
    }
});
