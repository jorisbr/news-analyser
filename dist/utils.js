/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
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
  !*** ./src/utils/utils.ts ***!
  \****************************/
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

/******/ })()
;
//# sourceMappingURL=utils.js.map