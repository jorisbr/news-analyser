/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**************************************!*\
  !*** ./src/content/contentScript.ts ***!
  \**************************************/

// Utility function to get the HTML content by selector
function getHtmlBySelector(selector) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(element => cleanHtmlContent(element.outerHTML));
}
// Function to clean the HTML content
function cleanHtmlContent(html) {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}
// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extractArticleContent') {
        const selector = message.selector;
        const articleContent = getHtmlBySelector(selector);
        const cleanedContent = articleContent.join('');
        sendResponse({ content: cleanedContent });
    }
    return true; // Indicates that the response will be sent asynchronously
});

/******/ })()
;
//# sourceMappingURL=contentScript.js.map