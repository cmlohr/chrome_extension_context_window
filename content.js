let tokenCount = 0;

// Function to count tokens in a message
function countTokens(message) {
    // TODO: Implement token counting logic
    // For now, let's just count words
    let tokens = message.split(/\s+/).length;
    return tokens;
}

// Set up a MutationObserver to watch for changes in the chat
let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                if (node.classList.contains("message")) {
                    tokenCount += countTokens(node.innerText);
                    chrome.runtime.sendMessage({method: "setBadgeText", text: tokenCount.toString()});
                    if (tokenCount >= 2000) {
                        chrome.runtime.sendMessage({method: "setBadgeColor", color: [255, 0, 0, 100]});
                    }
                }
            });
        }
    });
});

let chatContainer = document.querySelector(".chat-container");
observer.observe(chatContainer, {childList: true, subtree: true});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === "resetCounter") {
        tokenCount = 0;
        chrome.runtime.sendMessage({method: "setBadgeText", text: tokenCount.toString()});
        chrome.runtime.sendMessage({method: "setBadgeColor", color: [0, 200, 0, 100]});
    }
});
