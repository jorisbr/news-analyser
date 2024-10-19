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
/* harmony export */   getContextSentence: () => (/* binding */ getContextSentence),
/* harmony export */   getDomainNameFromUrl: () => (/* binding */ getDomainNameFromUrl),
/* harmony export */   hideElement: () => (/* binding */ hideElement),
/* harmony export */   saveApiKey: () => (/* binding */ saveApiKey),
/* harmony export */   showElement: () => (/* binding */ showElement),
/* harmony export */   validateApiKey: () => (/* binding */ validateApiKey)
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
function validateApiKey(apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const openaiEndpoint = 'https://api.openai.com/v1/models';
        try {
            const response = yield fetch(openaiEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    });
}
// Define the establishedSources variable
const establishedSources = [
    'ad',
    'apnews',
    'bbc',
    'cnn',
    'fd',
    'gelderlander',
    'nos',
    'nrc',
    'nu',
    'parool',
    'telegraaf',
    'trouw',
    'volkskrant'
];
// Utility function to provide an additional sentence explaining the context of the analysis
function getContextSentence(domain) {
    if (establishedSources.includes(domain)) {
        return "contextSentence";
    }
    ;
    return "";
}
function analyseWithLLM(html) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            getApiKey((apiKey) => __awaiter(this, void 0, void 0, function* () {
                if (!apiKey) {
                    reject(new Error(chrome.i18n.getMessage('apiKeyNotSet')));
                    return;
                }
                const prompt = `You are a news article classifier assessing whether a news article is fake news or not.

                You should evaluate each news article on five content features:
                emotionsFeature: Greater use of emotive and affective language. Especially negative emotions typically more present. In news, content contains heavy emotional appeal to readers, provoking fear, anger, outrage.
                biasFeature: (Hyper-)partisan bias, often with a right-leaning ideological orientation. Negative references to left-leaning, progressive political actors or issues, positive references to (populist) right leaning political actors or issues.
                informalLanguageFeature: More use of informal words and informal language (slang, swear). Higher likelihood of hate speech and incivility.
                scientificConsensusFeature: Evidence and claims made go against conventional facts or scientific consensus.
                expertMisuseFeature: Irrelevant or non-legitimate experts are cited who have no knowledge of the topic.

                Give an assessment for each feature expressing to which extent a feature applies, use the following labels:
                - notPresent
                - somewhatPresent
                - stronglyPresent
                return the results as a pure JSON object listing each content feature the associated assesment and a brief explanation of the assesment in both dutch and english. The JSON object should have the following structure:
                {
                  "emotionsFeature": { "assessment": "label", "dutchExplanation": "brief explanation", "englishExplanation": "brief explanation" },
                  "biasFeature": { "assessment": "label", "dutchExplanation": "brief explanation", "englishExplanation": "brief explanation" },
                  "informalLanguageFeature": { "assessment": "label", "dutchExplanation": "brief explanation", "englishExplanation": "brief explanation" },
                  "scientificConsensusFeature": { "assessment": "label", "dutchExplanation": "brief explanation", "englishExplanation": "brief explanation" },
                  "expertMisuseFeature": { "assessment": "label", "dutchExplanation": "brief explanation", "englishExplanation": "brief explanation" }
                }`;
                const fullPrompt = `${prompt}\n\nHTML Content:\n${html}`;
                const openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
                const requestBody = {
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: fullPrompt }],
                    top_p: 0.01,
                    seed: 1,
                    response_format: {
                        type: 'json_schema',
                        json_schema: {
                            name: 'news_article_analysis',
                            schema: {
                                type: 'object',
                                properties: {
                                    "emotionsFeature": {
                                        type: 'object',
                                        properties: {
                                            assessment: { type: 'string', enum: ['notPresent', 'somewhatPresent', 'stronglyPresent'] },
                                            dutchExplanation: { type: 'string' },
                                            englishExplanation: { type: 'string' }
                                        },
                                        required: ['assessment', 'dutchExplanation', 'englishExplanation'],
                                        additionalProperties: false
                                    },
                                    "biasFeature": {
                                        type: 'object',
                                        properties: {
                                            assessment: { type: 'string', enum: ['notPresent', 'somewhatPresent', 'stronglyPresent'] },
                                            dutchExplanation: { type: 'string' },
                                            englishExplanation: { type: 'string' }
                                        },
                                        required: ['assessment', 'dutchExplanation', 'englishExplanation'],
                                        additionalProperties: false
                                    },
                                    "informalLanguageFeature": {
                                        type: 'object',
                                        properties: {
                                            assessment: { type: 'string', enum: ['notPresent', 'somewhatPresent', 'stronglyPresent'] },
                                            dutchExplanation: { type: 'string' },
                                            englishExplanation: { type: 'string' }
                                        },
                                        required: ['assessment', 'dutchExplanation', 'englishExplanation'],
                                        additionalProperties: false
                                    },
                                    "scientificConsensusFeature": {
                                        type: 'object',
                                        properties: {
                                            assessment: { type: 'string', enum: ['notPresent', 'somewhatPresent', 'stronglyPresent'] },
                                            dutchExplanation: { type: 'string' },
                                            englishExplanation: { type: 'string' }
                                        },
                                        required: ['assessment', 'dutchExplanation', 'englishExplanation'],
                                        additionalProperties: false
                                    },
                                    "expertMisuseFeature": {
                                        type: 'object',
                                        properties: {
                                            assessment: { type: 'string', enum: ['notPresent', 'somewhatPresent', 'stronglyPresent'] },
                                            dutchExplanation: { type: 'string' },
                                            englishExplanation: { type: 'string' }
                                        },
                                        required: ['assessment', 'dutchExplanation', 'englishExplanation'],
                                        additionalProperties: false
                                    }
                                },
                                required: [
                                    "emotionsFeature",
                                    "biasFeature",
                                    "informalLanguageFeature",
                                    "scientificConsensusFeature",
                                    "expertMisuseFeature"
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
                    reject(new Error(chrome.i18n.getMessage('analysisError')));
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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('news-analyser-popup');
    // Initialize event listeners
    initializeEventListeners();
    // Localize HTML content
    updateLocalizedContent();
    // Update UI based on current state
    updateUIForCurrentState();
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
        popup.querySelector('#languageSelector').addEventListener('change', languageSelectorHandler);
        // Add listener for info icon clicks
        document.addEventListener('click', handleInfoIconClick);
    }
    function loadMessages(lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
            return yield response.json();
        });
    }
    function getCustomMessage(messages, key) {
        var _a;
        return ((_a = messages[key]) === null || _a === void 0 ? void 0 : _a.message) || key;
    }
    function handleInfoIconClick(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = event.target;
            if (target.classList.contains('info-icon')) {
                event.stopPropagation();
                const explanationBox = document.getElementById('explanationBox');
                const lang = yield getCurrentLanguage();
                const explanation = target.getAttribute(`data-explanation-${lang === 'nl' ? 'nl' : 'en'}`);
                if (explanationBox && explanation) {
                    explanationBox.textContent = explanation;
                }
                (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#explanationBox');
            }
        });
    }
    function getCurrentLanguage() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield chrome.storage.sync.get('language');
            return data.language || chrome.i18n.getUILanguage();
        });
    }
    function updateLocalizedContent() {
        chrome.storage.sync.get('language', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const lang = yield getCurrentLanguage();
                loadMessages(lang).then((messages) => {
                    popup.querySelectorAll('[data-i18n]').forEach(elem => {
                        const key = elem.getAttribute('data-i18n');
                        if (key)
                            elem.textContent = getCustomMessage(messages, key);
                    });
                    popup.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
                        const key = elem.getAttribute('data-i18n-placeholder');
                        if (key)
                            elem.placeholder = getCustomMessage(messages, key);
                    });
                    popup.querySelectorAll('[data-i18n-title]').forEach(elem => {
                        const key = elem.getAttribute('data-i18n-title');
                        if (key)
                            elem.setAttribute('title', getCustomMessage(messages, key));
                    });
                    popup.querySelectorAll('[data-i18n-href]').forEach(elem => {
                        const key = elem.getAttribute('data-i18n-href');
                        if (key)
                            elem.href = getCustomMessage(messages, key);
                    });
                    // Set the language selector to the current language
                    const languageSelector = popup.querySelector('#languageSelector');
                    if (languageSelector) {
                        Array.from(languageSelector.options).forEach(option => {
                            if (option.value === lang) {
                                option.selected = true;
                            }
                        });
                    }
                    updateDynamicContent(messages);
                });
            });
        });
    }
    function saveApiKeyHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKeyInput = popup.querySelector('#apiKeyInput');
            const apiKey = apiKeyInput.value.trim();
            const messageDiv = popup.querySelector('#message');
            const saveButton = popup.querySelector('#saveApiKeyButton');
            if (apiKey) {
                saveButton.disabled = true;
                const isValid = yield (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.validateApiKey)(apiKey);
                if (isValid) {
                    (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.saveApiKey)(apiKey);
                    updateUIForAnalysis();
                }
                else {
                    messageDiv.textContent = chrome.i18n.getMessage('invalidApiKey');
                    updateLocalizedContent();
                }
                saveButton.disabled = false;
            }
        });
    }
    function resetApiKeyHandler() {
        chrome.storage.local.remove('chatgptApiKey', () => {
            updateUIForApiKeyInput();
            popup.querySelector('#message').textContent = chrome.i18n.getMessage('apiKeyReset');
        });
    }
    function languageSelectorHandler(event) {
        const newLang = event.target.value;
        chrome.storage.sync.set({ language: newLang }, function () {
            updateLocalizedContent();
            updateUIForCurrentState();
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
                articlesContentDiv.innerHTML = `<div>${chrome.i18n.getMessage('unsupportedWebsite')}</div>`;
            }
            else {
                (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#loading');
                chrome.tabs.sendMessage(tabs[0].id, { action: 'extractArticleContent', selector }, (response) => {
                    if (response && response.content) {
                        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.analyseWithLLM)(response.content).then((result) => {
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#loading');
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#articlesContent');
                            if (result && result.content) {
                                fillResultsTable(result, (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getDomainNameFromUrl)(new URL(url)));
                                updateLocalizedContent();
                            }
                            else {
                                articlesContentDiv.innerHTML = `<div>${chrome.i18n.getMessage('emptyResponse')}</div>`;
                            }
                        }).catch((error) => {
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#loading');
                            (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#articlesContent');
                            articlesContentDiv.innerHTML = `<div>${chrome.i18n.getMessage('analysisError', error.message)}</div>`;
                        });
                    }
                    else {
                        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#loading');
                        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#articlesContent');
                        articlesContentDiv.innerHTML = `<div>${chrome.i18n.getMessage('extractionFailed')}</div>`;
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
    function updateDynamicContent(messages) {
        // Update table headers
        const headers = popup.querySelectorAll('#daResultsTable th');
        if (headers[0])
            headers[0].textContent = getCustomMessage(messages, 'featureColumnHeader');
        if (headers[1])
            headers[1].textContent = getCustomMessage(messages, 'assessmentColumnHeader');
        // Update feature names and assessments
        const features = [
            'emotionsFeature',
            'biasFeature',
            'informalLanguageFeature',
            'scientificConsensusFeature',
            'expertMisuseFeature'
        ];
        features.forEach(feature => {
            const featureCell = popup.querySelector(`#daResultsTable td[data-feature="${feature}"]`);
            const assessmentCell = popup.querySelector(`#daResultsTable td[data-assessment="${feature}"]`);
            if (featureCell)
                featureCell.textContent = getCustomMessage(messages, feature);
            if (assessmentCell) {
                const assessmentKey = assessmentCell.getAttribute('data-assessment-key');
                if (assessmentKey) {
                    const assessmentMessage = getCustomMessage(messages, assessmentKey);
                    const infoIcon = assessmentCell.querySelector('.info-icon');
                    // Preserve the info icon if it exists
                    if (infoIcon) {
                        assessmentCell.innerHTML = `${getSvgIcon(assessmentKey)} ${assessmentMessage} `;
                        assessmentCell.appendChild(infoIcon);
                    }
                    else {
                        assessmentCell.innerHTML = `${getSvgIcon(assessmentKey)} ${assessmentMessage}`;
                    }
                }
            }
        });
        // Update explanation box
        const explanationBox = popup.querySelector('#explanationBox');
        if (explanationBox) {
            const explanationKey = explanationBox.getAttribute('data-explanation-key');
            if (explanationKey)
                explanationBox.textContent = getCustomMessage(messages, explanationKey);
        }
        // Update context sentence
        const contextParagraph = popup.querySelector('.context-sentence');
        if (contextParagraph) {
            const contextKey = contextParagraph.getAttribute('data-context-key');
            if (contextKey)
                contextParagraph.textContent = getCustomMessage(messages, contextKey);
        }
    }
    function updateUIForCurrentState() {
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
        updateLocalizedContent();
    }
    function updateUIForApiKeyInput() {
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.showElement)('#apiKeySection');
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#analysisSection');
    }
    function getSvgIcon(assessmentKey) {
        const svgIcons = {
            'notPresent': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#238823" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>',
            'somewhatPresent': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#FFBF00" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>',
            'stronglyPresent': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#D2222D" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>'
        };
        const k = assessmentKey;
        return svgIcons[k] || '';
    }
    function fillResultsTable(data, domain) {
        (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.hideElement)('#explanationBox');
        const resultsTable = document.createElement('table');
        resultsTable.id = 'daResultsTable';
        resultsTable.innerHTML = `
        <thead>
            <tr>
                <th data-i18n="featureColumnHeader"></th>
                <th data-i18n="assessmentColumnHeader"></th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
        popup.querySelector('#articlesContent').appendChild(resultsTable);
        const resultsTableTBody = resultsTable.getElementsByTagName('tbody')[0];
        resultsTableTBody.innerHTML = ''; // Clear existing rows
        const features = [
            'emotionsFeature',
            'biasFeature',
            'informalLanguageFeature',
            'scientificConsensusFeature',
            'expertMisuseFeature'
        ];
        const parsedData = JSON.parse(data.content);
        features.forEach(feature => {
            const row = document.createElement('tr');
            const featureCell = document.createElement('td');
            const assessmentCell = document.createElement('td');
            featureCell.setAttribute('data-feature', feature);
            assessmentCell.setAttribute('data-assessment', feature);
            const assessmentKey = parsedData[feature]['assessment'];
            assessmentCell.setAttribute('data-assessment-key', assessmentKey);
            const dutchExplanation = parsedData[feature]['dutchExplanation'];
            const englishExplanation = parsedData[feature]['englishExplanation'];
            // Create info icon
            const infoIcon = document.createElement('span');
            infoIcon.className = 'info-icon';
            infoIcon.textContent = 'ℹ️';
            infoIcon.setAttribute('data-explanation-nl', dutchExplanation);
            infoIcon.setAttribute('data-explanation-en', englishExplanation);
            assessmentCell.appendChild(document.createTextNode(' ')); // Add a space
            assessmentCell.appendChild(infoIcon);
            row.appendChild(featureCell);
            row.appendChild(assessmentCell);
            resultsTableTBody.appendChild(row);
        });
        const contextSentence = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getContextSentence)(domain);
        if (contextSentence) {
            const contextParagraph = document.createElement('p');
            contextParagraph.setAttribute('data-context-key', contextSentence);
            contextParagraph.className = 'context-sentence';
            popup.querySelector('#articlesContent').appendChild(contextParagraph);
        }
        const cost = data.outputTokens * 0.0000006 + data.inputTokens * 0.00000015;
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