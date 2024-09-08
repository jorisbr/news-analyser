/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/utils.ts":
/*!****************************!*\
  !*** ./src/utils/utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   analyseWithLLM: () => (/* binding */ analyseWithLLM),
/* harmony export */   getApiKey: () => (/* binding */ getApiKey),
/* harmony export */   getDomainNameFromUrl: () => (/* binding */ getDomainNameFromUrl),
/* harmony export */   hideElement: () => (/* binding */ hideElement),
/* harmony export */   saveApiKey: () => (/* binding */ saveApiKey),
/* harmony export */   showElement: () => (/* binding */ showElement)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Utility function to save the API key to Chrome storage
function saveApiKey(apiKey) {
    chrome.storage.local.set({ chatgptApiKey: apiKey }, () => { });
}
// Utility function to get the API key from Chrome storage
function getApiKey(callback) {
    chrome.storage.local.get(['chatgptApiKey'], (result) => {
        callback(result.chatgptApiKey || null);
    });
}
// Utility function to hide an element by selector
function hideElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add('hidden');
    }
}
// Utility function to show an element by selector
function showElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.remove('hidden');
    }
}
// Utility function to get the domain name from a URL
function getDomainNameFromUrl(url) {
    const parts = url.hostname.split('.');
    if (parts.length > 2) {
        if (parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'com') {
            return parts[parts.length - 3];
        }
        else {
            return parts[parts.length - 2];
        }
    }
    else if (parts.length === 2) {
        return parts[0];
    }
    else {
        return url.hostname;
    }
}
function analyseWithLLM(html) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            getApiKey((apiKey) => __awaiter(this, void 0, void 0, function* () {
                if (!apiKey) {
                    reject(new Error('API key is not set. Please enter your API key.'));
                    return;
                }
                const prompt = `You are a news article classifier assessing whether a news article is fake news or not.

                            You should evaluate each news article on three content features:
                            Use and presence of emotions: Greater use of emotive and affective language. Especially negative emotions typically more present. In news, content contains heavy emotional appeal to readers, provoking fear, anger, outrage.
                            Ideological bias: (Hyper-)partisan bias, often with a right-leaning ideological orientation. Negative references to left-leaning, progressive political actors or issues, positive references to (populist) right leaning political actors or issues
                            Informal words and language: More use of informal words and informal language (slang, swear). Higher likelihood of hate speech and incivility.
                            Facts go against scientific consensus: evidence and claims made go against conventional facts or scientific consensus.
                            Misuse of experts: Irrelevant or non-legitimate experts are cited who have no knowledge of the topic.

                            Give an assessment for each feature expressing to which extent a feature applies, use the following labels:
                            - not present
                            - Somewhat present
                            - Strongly present
                            return the results as a pure JSON object without any additional text or explanation. The JSON object should have the following structure:
                            {
                              "Use and presence of emotions": "label",
                              "Ideological bias": "label",
                              "Informal words and language": "label",
                              "Facts go against scientific consensus": "label",
                              "Misuse of experts": "label"
                            }`;
                const fullPrompt = `${prompt}\n\nHTML Content:\n${html}`;
                const openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
                const requestBody = {
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: fullPrompt }],
                    top_p: 0.2,
                    seed: 1,
                    response_format: {
                        type: 'json_schema',
                        json_schema: {
                            name: 'news_article_analysis',
                            schema: {
                                type: 'object',
                                properties: {
                                    "Use and presence of emotions": { type: 'string' },
                                    "Ideological bias": { type: 'string' },
                                    "Informal words and language": { type: 'string' },
                                    "Facts go against scientific consensus": { type: 'string' },
                                    "Misuse of experts": { type: 'string' }
                                },
                                required: [
                                    "Use and presence of emotions",
                                    "Ideological bias",
                                    "Informal words and language",
                                    "Facts go against scientific consensus",
                                    "Misuse of experts"
                                ],
                                additionalProperties: false
                            },
                            strict: true
                        }
                    }
                };
                try {
                    const response = yield fetch(openaiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify(requestBody),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = yield response.json();
                    resolve({
                        content: data.choices[0].message.content,
                        inputTokens: data.usage.prompt_tokens,
                        outputTokens: data.usage.completion_tokens
                    });
                }
                catch (error) {
                    console.error('Error calling LLM:', error);
                    reject(new Error('An error occurred while analysing the content.'));
                }
            }));
        });
    });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!****************************!*\
  !*** ./src/pages/popup.ts ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "./src/utils/utils.ts");

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('news-analyser-popup');
    // Initialize event listeners
    initializeEventListeners();
    // Prefill the API key if available and show relevant section
    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getApiKey)((apiKey) => {
        const apiKeyInput = popup.querySelector('#apiKeyInput');
        if (apiKey) {
            apiKeyInput.value = apiKey;
        }
        showRelevantSection();
    });
    function initializeEventListeners() {
        popup.querySelector('#saveApiKeyButton').addEventListener('click', saveApiKeyHandler);
        popup.querySelector('#resetApiKeyButton').addEventListener('click', resetApiKeyHandler);
        popup.querySelector('#analyseButton').addEventListener('click', analyseButtonHandler);
    }
    function saveApiKeyHandler() {
        const apiKeyInput = popup.querySelector('#apiKeyInput');
        const apiKey = apiKeyInput.value.trim();
        const messageDiv = popup.querySelector('#message');
        if (apiKey) {
            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.saveApiKey)(apiKey);
            messageDiv.textContent = 'API key saved successfully!';
            updateUIForAnalysis();
        }
        else {
            messageDiv.textContent = 'Please enter a valid API key.';
        }
    }
    function resetApiKeyHandler() {
        chrome.storage.local.remove('chatgptApiKey', () => {
            updateUIForApiKeyInput();
            popup.querySelector('#message').textContent = 'API key has been reset. Please enter a new API key.';
        });
    }
    function analyseButtonHandler() {
        const articlesContentDiv = popup.querySelector('#articlesContent');
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#articlesContent');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var _a;
            const url = (_a = tabs[0].url) !== null && _a !== void 0 ? _a : "";
            const selector = getSelectorByDomain(url);
            if (!selector) {
                (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#articlesContent');
                articlesContentDiv.innerHTML = `<div>This website or subdomain is not supported.</div>`;
            }
            else {
                (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#loading');
                chrome.tabs.sendMessage(tabs[0].id, { action: 'extractArticleContent', selector }, (response) => {
                    if (response && response.content) {
                        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.analyseWithLLM)(response.content).then((result) => {
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#loading');
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#articlesContent');
                            if (result && result.content) {
                                fillResultsTable(result);
                            }
                            else {
                                articlesContentDiv.innerHTML = `<div>The response retrieved was empty</div>`;
                            }
                        }).catch((error) => {
                            console.error('Error in analyseWithLLM:', error);
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#loading');
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#articlesContent');
                            articlesContentDiv.innerHTML = `<div>Something went wrong: ${error.message}</div>`;
                        });
                    }
                    else {
                        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#loading');
                        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#articlesContent');
                        articlesContentDiv.innerHTML = `<div>Failed to extract article content</div>`;
                    }
                });
            }
        });
    }
    function showRelevantSection() {
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getApiKey)((apiKey) => {
            if (apiKey) {
                updateUIForAnalysis();
            }
            else {
                updateUIForApiKeyInput();
            }
        });
    }
    function updateUIForAnalysis() {
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#apiKeySection');
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#analysisSection');
    }
    function updateUIForApiKeyInput() {
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#apiKeySection');
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#analysisSection');
    }
    function fillResultsTable(data) {
        const resultsTable = document.createElement('table');
        resultsTable.id = 'daResultsTable';
        resultsTable.innerHTML = `
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Assessment</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        popup.querySelector('#articlesContent').appendChild(resultsTable);
        const resultsTableTBody = resultsTable.getElementsByTagName('tbody')[0];
        resultsTableTBody.innerHTML = ''; // Clear existing rows
        const features = [
            'Use and presence of emotions',
            'Ideological bias',
            'Informal words and language',
            'Facts go against scientific consensus',
            'Misuse of experts'
        ];
        const svgIcons = {
            'not present': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#238823" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>',
            'somewhat present': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#FFBF00" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>',
            'strongly present': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#D2222D" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>'
        };
        features.forEach(feature => {
            const row = document.createElement('tr');
            const featureCell = document.createElement('td');
            const assessmentCell = document.createElement('td');
            featureCell.textContent = feature;
            const parsedData = JSON.parse(data.content);
            const assessment = parsedData[feature];
            const assessmentKey = assessment.toLowerCase();
            assessmentCell.innerHTML = `${svgIcons[assessmentKey]} ${assessment}`;
            row.appendChild(featureCell);
            row.appendChild(assessmentCell);
            resultsTableTBody.appendChild(row);
        });
        const cost = data.outputTokens * 0.0000006 + data.inputTokens * 0.00000015;
        const usageLine = `<p class='usage'>Estimated cost: $${cost.toFixed(4)}</p>`;
        popup.querySelector('#articlesContent').insertAdjacentHTML('beforeend', usageLine);
    }
    function getSelectorByDomain(url) {
        const parsedUrl = new URL(url);
        const domain = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getDomainNameFromUrl)(parsedUrl);
        return getSelector(domain);
    }
    function getSelector(key) {
        const selectors = {
            ad: 'article.article',
            apnews: 'bsp-story-page',
            axed: '#article-blocks',
            bbc: 'article',
            cnn: 'article',
            fd: 'div.grid',
            foxnews: 'article',
            frontnieuws: 'article',
            geenstijl: 'main',
            gedachtenvoer: 'article',
            gelderlander: 'article.article',
            jensen: 'article',
            nbu: 'article.content',
            niburu: 'div.com-content-article',
            nieuwnieuws: 'div.app-container.article',
            ninefornews: '#the-post',
            nos: '#content',
            nrc: 'article.vorm_article',
            nu: '.blocks-container-article',
            oann: 'article',
            parool: 'article#article-content',
            telegraaf: '#mainContent',
            transitieweb: 'article',
            trouw: 'article',
            volkskrant: 'article'
        };
        return selectors[key];
    }
});

/******/ })()
;
//# sourceMappingURL=popup.js.map