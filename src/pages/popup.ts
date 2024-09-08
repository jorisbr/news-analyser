import { saveApiKey, getApiKey, hideElement, showElement, getDomainNameFromUrl, analyseWithLLM } from '../utils/utils';

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('news-analyser-popup')!;

    // Initialize event listeners
    initializeEventListeners();

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
    }

    function saveApiKeyHandler() {
        const apiKeyInput = popup.querySelector('#apiKeyInput') as HTMLInputElement;
        const apiKey = apiKeyInput.value.trim();
        const messageDiv = popup.querySelector('#message')!;

        if (apiKey) {
            saveApiKey(apiKey);
            messageDiv.textContent = 'API key saved successfully!';
            updateUIForAnalysis();
        } else {
            messageDiv.textContent = 'Please enter a valid API key.';
        }
    }

    function resetApiKeyHandler() {
        chrome.storage.local.remove('chatgptApiKey', () => {
            updateUIForApiKeyInput();
            popup.querySelector('#message')!.textContent = 'API key has been reset. Please enter a new API key.';
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
                articlesContentDiv.innerHTML = `<div>This website or subdomain is not supported.</div>`;
            } else {
                showElement('#loading');
                chrome.tabs.sendMessage(tabs[0].id!, { action: 'extractArticleContent', selector }, (response) => {
                    if (response && response.content) {
                        analyseWithLLM(response.content).then((result) => {
                            hideElement('#loading');
                            showElement('#articlesContent');
                            if (result && result.content) {
                                fillResultsTable(result);
                            } else {
                                articlesContentDiv.innerHTML = `<div>The response retrieved was empty</div>`;
                            }
                        }).catch((error) => {
                            console.error('Error in analyseWithLLM:', error);
                            hideElement('#loading');
                            showElement('#articlesContent');
                            articlesContentDiv.innerHTML = `<div>Something went wrong: ${error.message}</div>`;
                        });
                    } else {
                        hideElement('#loading');
                        showElement('#articlesContent');
                        articlesContentDiv.innerHTML = `<div>Failed to extract article content</div>`;
                    }
                });
            }
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

    function updateUIForAnalysis() {
        hideElement('#apiKeySection');
        showElement('#analysisSection');
    }

    function updateUIForApiKeyInput() {
        showElement('#apiKeySection');
        hideElement('#analysisSection');
    }

    function fillResultsTable(data: {content: string, inputTokens: number, outputTokens: number}) {
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

        popup.querySelector('#articlesContent')!.appendChild(resultsTable);

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
            const parsedData = JSON.parse(data.content)
            const assessment = parsedData[feature] as string;
            const assessmentKey = assessment.toLowerCase() as keyof typeof svgIcons
            assessmentCell.innerHTML = `${svgIcons[assessmentKey]} ${assessment}`;

            row.appendChild(featureCell);
            row.appendChild(assessmentCell);
            resultsTableTBody.appendChild(row);
        });

        const cost = data.outputTokens * 0.0000006 + data.inputTokens * 0.00000015
        const usageLine = `<p class='usage'>Estimated cost: $${cost.toFixed(4)}</p>`
        popup.querySelector('#articlesContent')!.insertAdjacentHTML('beforeend', usageLine);
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