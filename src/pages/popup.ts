import { saveApiKey, getApiKey, hideElement, showElement, getDomainNameFromUrl, analyseWithLLM, validateApiKey, getContextSentence } from '../utils/utils';

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('news-analyser-popup')!;

    // Initialize event listeners
    initializeEventListeners();

    // Localize HTML content
    updateLocalizedContent();

    // Update UI based on current state
    updateUIForCurrentState();

    // Prefill the API key if available and show relevant section
    getApiKey((apiKey) => {
        const apiKeyInput = popup.querySelector('#apiKeyInput') as HTMLInputElement;
        if (apiKey) {
            apiKeyInput.value = apiKey;
        }
        showRelevantSection();
    });

    function initializeEventListeners() {
        popup.querySelector('#saveApiKeyButton')!.addEventListener('click', saveApiKeyHandler);
        popup.querySelector('#resetApiKeyButton')!.addEventListener('click', resetApiKeyHandler);
        popup.querySelector('#analyseButton')!.addEventListener('click', analyseButtonHandler);
        popup.querySelector('#languageSelector')!.addEventListener('change', languageSelectorHandler);

        // Add listener for info icon clicks
        document.addEventListener('click', handleInfoIconClick);
    }

    async function loadMessages(lang: string): Promise<{ [key: string]: { message: string } }> {
        const response = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
        return await response.json();
    }

    function getCustomMessage(messages: { [key: string]: { message: string } }, key: string): string {
        return messages[key]?.message || key;
    }

    async function handleInfoIconClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('info-icon')) {
            event.stopPropagation();
            const explanationBox = document.getElementById('explanationBox');
            const lang = await getCurrentLanguage();
            const explanation = target.getAttribute(`data-explanation-${lang === 'nl' ? 'nl' : 'en'}`);

            if (explanationBox && explanation) {
                explanationBox.textContent = explanation;
            }
            showElement('#explanationBox');
        }
    }

    async function getCurrentLanguage(): Promise<string> {
        const data = await chrome.storage.sync.get('language');
        return data.language || 'nl';
    }

    async function updateLocalizedContent() {
        const lang = await getCurrentLanguage();
        loadMessages(lang).then((messages) => {
            popup.querySelectorAll('[data-i18n]').forEach(elem => {
                const key = elem.getAttribute('data-i18n');
                if (key) elem.textContent = getCustomMessage(messages, key);
            });

            popup.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-placeholder');
                if (key) (elem as HTMLInputElement).placeholder = getCustomMessage(messages, key);
            });

            popup.querySelectorAll('[data-i18n-title]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-title');
                if (key) elem.setAttribute('title', getCustomMessage(messages, key));
            });

            popup.querySelectorAll('[data-i18n-href]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-href');
                if (key) (elem as HTMLAnchorElement).href = getCustomMessage(messages, key);
            });

            // Set the language selector to the current language
            const languageSelector = popup.querySelector('#languageSelector') as HTMLSelectElement;
            if (languageSelector) {
                Array.from(languageSelector.options).forEach(option => {
                    if (option.value === lang) {
                        option.selected = true;
                    }
                });
            }
            updateDynamicContent(messages);
        });
    }

    async function saveApiKeyHandler() {
        const apiKeyInput = popup.querySelector('#apiKeyInput') as HTMLInputElement;
        const apiKey = apiKeyInput.value.trim();
        const messageDiv = popup.querySelector('#message')!;
        const saveButton = popup.querySelector('#saveApiKeyButton') as HTMLButtonElement;

        if (apiKey) {
            saveButton.disabled = true;

            const isValid = await validateApiKey(apiKey);
            if (isValid) {
                saveApiKey(apiKey);
                updateUIForAnalysis();
            } else {
                messageDiv.textContent = chrome.i18n.getMessage('invalidApiKey');
                updateLocalizedContent();
            }

            saveButton.disabled = false;
        }
    }

    function resetApiKeyHandler() {
        chrome.storage.local.remove('chatgptApiKey', () => {
            updateUIForApiKeyInput();
            popup.querySelector('#message')!.textContent = chrome.i18n.getMessage('apiKeyReset');
        });
    }

    function languageSelectorHandler(event: Event) {
        const newLang = (event.target as HTMLSelectElement).value;
        chrome.storage.sync.set({ language: newLang }, function () {
            updateLocalizedContent();
            updateUIForCurrentState();
        });
    }

    function analyseButtonHandler() {
        const articlesContentDiv = popup.querySelector('#articlesContent')! as HTMLElement;
        hideElement('#articlesContent');

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url ?? "";
            const selector = getSelectorByDomain(url);
            if (!selector) {
                showElement('#articlesContent');
                articlesContentDiv.innerHTML = `<div data-i18n="unsupportedWebsite">${chrome.i18n.getMessage('unsupportedWebsite')}</div>`;
                updateLocalizedContent();
            } else {
                showElement('#loading');
                chrome.tabs.sendMessage(tabs[0].id!, { action: 'extractArticleContent', selector }, (response) => {
                    if (response && response.content) {
                        analyseWithLLM(response.content).then((result) => {
                            hideElement('#loading');
                            showElement('#articlesContent');
                            if (result && result.content) {
                                fillResultsTable(result, getDomainNameFromUrl(new URL(url)));
                                updateLocalizedContent();
                            } else {
                                articlesContentDiv.innerHTML = `<div>${chrome.i18n.getMessage('emptyResponse')}</div>`;
                                updateLocalizedContent();
                            }
                        }).catch((error) => {
                            hideElement('#loading');
                            showElement('#articlesContent');
                            articlesContentDiv.innerHTML = `<div>${chrome.i18n.getMessage('analysisError', error.message)}</div>`;
                            updateLocalizedContent();
                        });
                    } else {
                        hideElement('#loading');
                        showElement('#articlesContent');
                        articlesContentDiv.innerHTML = `<div>${chrome.i18n.getMessage('extractionFailed')}</div>`;
                        updateLocalizedContent();
                    }
                });
            }
            updateLocalizedContent();
        });
    }

    function showRelevantSection() {
        getApiKey((apiKey) => {
            if (apiKey) {
                updateUIForAnalysis();
            } else {
                updateUIForApiKeyInput();
            }
        });
    }

    function updateDynamicContent(messages: { [key: string]: { message: string } }) {
        // Update table headers
        const headers = popup.querySelectorAll('#daResultsTable th');
        if (headers[0]) headers[0].textContent = getCustomMessage(messages, 'featureColumnHeader');
        if (headers[1]) headers[1].textContent = getCustomMessage(messages, 'assessmentColumnHeader');

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

            if (featureCell) featureCell.textContent = getCustomMessage(messages, feature);
            if (assessmentCell) {
                const assessmentKey = assessmentCell.getAttribute('data-assessment-key');
                if (assessmentKey) {
                    const assessmentMessage = getCustomMessage(messages, assessmentKey);
                    const infoIcon = assessmentCell.querySelector('.info-icon');

                    // Preserve the info icon if it exists
                    if (infoIcon) {
                        assessmentCell.innerHTML = `${getSvgIcon(assessmentKey)} ${assessmentMessage} `;
                        assessmentCell.appendChild(infoIcon);
                    } else {
                        assessmentCell.innerHTML = `${getSvgIcon(assessmentKey)} ${assessmentMessage}`;
                    }
                }
            }
        });

        // Update explanation box
        const explanationBox = popup.querySelector('#explanationBox');
        if (explanationBox) {
            const explanationKey = explanationBox.getAttribute('data-explanation-key');
            if (explanationKey) explanationBox.textContent = getCustomMessage(messages, explanationKey);
        }

        // Update context sentence
        const contextParagraph = popup.querySelector('.context-sentence');
        if (contextParagraph) {
            const contextKey = contextParagraph.getAttribute('data-context-key');
            if (contextKey) contextParagraph.textContent = getCustomMessage(messages, contextKey);
        }
    }

    function updateUIForCurrentState() {
        getApiKey((apiKey) => {
            if (apiKey) {
                updateUIForAnalysis();
            } else {
                updateUIForApiKeyInput();
            }
        });
    }

    function updateUIForAnalysis() {
        hideElement('#apiKeySection');
        showElement('#analysisSection');
        updateLocalizedContent();
    }

    function updateUIForApiKeyInput() {
        showElement('#apiKeySection');
        hideElement('#analysisSection');

    }

    function getSvgIcon(assessmentKey: string): string {
        const svgIcons = {
            'notPresent': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#238823" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>',
            'somewhatPresent': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#FFBF00" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>',
            'stronglyPresent': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#D2222D" class="bi bi-circle-fill"><circle cx="8" cy="8" r="8"/></svg>'
        };
        const k = assessmentKey as keyof typeof svgIcons;
        return svgIcons[k] || '';
    }

    function fillResultsTable(data: { content: string, inputTokens: number, outputTokens: number }, domain: string) {
        hideElement('#explanationBox');

        // Remove existing table if it exists
        const existingTable = document.getElementById('daResultsTable');
        if (existingTable) {
            existingTable.remove();
        }

        // Remove existing context sentence if it exists
        const existingContextSentence = document.querySelector('.context-sentence');
        if (existingContextSentence) {
            existingContextSentence.remove();
        }

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

        popup.querySelector('#articlesContent')!.appendChild(resultsTable);

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

        const contextSentence = getContextSentence(domain);
        if (contextSentence) {
            const contextParagraph = document.createElement('p');
            contextParagraph.setAttribute('data-context-key', contextSentence);
            contextParagraph.className = 'context-sentence';
            popup.querySelector('#articlesContent')!.appendChild(contextParagraph);
        }

        const cost = data.outputTokens * 0.0000006 + data.inputTokens * 0.00000015
    }

    function getSelectorByDomain(url: string): string | undefined {
        const parsedUrl = new URL(url);
        const domain = getDomainNameFromUrl(parsedUrl);
        return getSelector(domain);
    }

    function getSelector(key: string): string | undefined {
        const selectors: { [key: string]: string } = {
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
            nrc: '.vorm__article-theme-wrapper',
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