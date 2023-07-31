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
function getIcon(tokenCount) {
    if (tokenCount < 400) {
        return "icon_green.png";
    } else if (tokenCount < 800) {
        return "icon_lightgreen.png";
    } else if (tokenCount < 1200) {
        return "icon_yellow.png";
    } else if (tokenCount < 1600) {
        return "icon_orange.png";
    } else {
        return "icon_red.png";
    }
}

// Create and style the token counter overlay
let counterOverlay = document.createElement("div");
counterOverlay.id = "tokenCounterOverlay";
counterOverlay.style.position = "fixed";
counterOverlay.style.top = "10px";
counterOverlay.style.right = "20px";
counterOverlay.style.padding = "5px 10px";
counterOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
counterOverlay.style.color = "white";
counterOverlay.style.zIndex = "9999";
counterOverlay.style.fontSize = "20px";
counterOverlay.style.borderRadius = "5px";
document.body.appendChild(counterOverlay);

// Function to update the token counter overlay
function updateCounterOverlay() {
    counterOverlay.textContent = `Tokens: ${tokenCount}`;
}

// Function to get an element by XPath
function getElementByXPath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Function to set up the observer
function setupObserver(chatContainer) {
    // Check if the chat container exists
    if (chatContainer) {
        console.log("Chat container found", chatContainer);

        // Set up a MutationObserver to watch for changes in the chat
        let observer = new MutationObserver((mutations) => {
            console.log("Mutation detected", mutations);

           mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
            console.log("New node added", node);

            if (node.nodeName === "DIV" && node.querySelector("p")) {
                tokenCount += countTokens(node.innerText);
                chrome.runtime.sendMessage({method: "setBadgeText", text: tokenCount.toString()});
                chrome.runtime.sendMessage({method: "setIcon", iconPath: getIcon(tokenCount)});
                updateCounterOverlay();
            }
        });
    }
});  
        });

        observer.observe(chatContainer, {childList: true, subtree: true});
    } else {
        console.error("Chat container not found");
    }
}

// Function to start polling for the chat container
function startPollingForChatContainer() {
    let chatContainerXPath = "//*[@id='__next']/div[1]/div[2]/div/main/div[1]/div/div/div";
    let chatContainer = getElementByXPath(chatContainerXPath);

    if (chatContainer) {
        console.log("Chat container found", chatContainer);
        setupObserver(chatContainer);
    } else {
        console.log("Chat container not found, retrying in 500ms");
        setTimeout(startPollingForChatContainer, 500);
    }
}

window.addEventListener("load", startPollingForChatContainer);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === "resetCounter") {
        tokenCount = 0;
        chrome.runtime.sendMessage({method: "setBadgeText", text: tokenCount.toString()});
        chrome.runtime.sendMessage({method: "setIcon", iconPath: getIcon(tokenCount)});
    }
});