let tokenCount = 0;

// Function to count tokens in a message
function countTokens(message) {
    let wordPattern = /\b\w+\b/g;
    let punctuationPattern = /[.,;:?!()\[\]{}\-"]/g;
    let uncommonPunctuationPattern = /[^a-zA-Z0-9 .,;:?!()\[\]{}\-"]/g;

    let words = (message.match(wordPattern) || []).length;
    let punctuation = (message.match(punctuationPattern) || []).length;
    let uncommonPunctuation = (message.match(uncommonPunctuationPattern) || []).length;

    return words + punctuation + 2 * uncommonPunctuation;
}

// Function to get color based on token count
function getColor(tokenCount) {
    let red = Math.min(255, Math.round(tokenCount / 2000 * 255));
    let green = Math.max(0, 255 - red);
    return [red, green, 0, 100];
}

// Set up a MutationObserver to watch for changes in the chat
let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                if (node.classList.contains("message")) {
                    tokenCount += countTokens(node.innerText);
                    chrome.runtime.sendMessage({method: "setBadgeText", text: tokenCount.toString()});
                    chrome.runtime.sendMessage({method: "setBadgeColor", color: getColor(tokenCount)});
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
        chrome.runtime.sendMessage({method: "setBadgeColor", color: getColor(tokenCount)});
    }
});