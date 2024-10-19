// Utility function to save the API key to Chrome storage
export function saveApiKey(apiKey: string): void {
    chrome.storage.local.set({ chatgptApiKey: apiKey }, () => { });
}

// Utility function to get the API key from Chrome storage
export function getApiKey(callback: (apiKey: string | null) => void): void {
    chrome.storage.local.get(['chatgptApiKey'], (result) => {
        callback(result.chatgptApiKey || null);
    });
}

// Utility function to hide an element by selector
export function hideElement(selector: string): void {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add('hidden');
    }
}

// Utility function to show an element by selector
export function showElement(selector: string): void {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.remove('hidden');
    }
}

// Utility function to get the domain name from a URL
export function getDomainNameFromUrl(url: URL): string {
    const parts = url.hostname.split('.');
    if (parts.length > 2) {
        if (parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'com') {
            return parts[parts.length - 3];
        } else {
            return parts[parts.length - 2];
        }
    } else if (parts.length === 2) {
        return parts[0];
    } else {
        return url.hostname;
    }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
    const openaiEndpoint = 'https://api.openai.com/v1/models';
    try {
        const response = await fetch(openaiEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

// Define the establishedSources variable
const establishedSources: string[] = [
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
export function getContextSentence(domain: string): string {
    if (establishedSources.includes(domain)) {
        return "contextSentence";
    };
    return "";
}

export async function analyseWithLLM(html: string): Promise<{ content: string, inputTokens: number, outputTokens: number }> {
    return new Promise((resolve, reject) => {
        getApiKey(async (apiKey) => {
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
                const response = await fetch(openaiEndpoint, {
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
                const data = await response.json();
                resolve({
                    content: data.choices[0].message.content,
                    inputTokens: data.usage.prompt_tokens,
                    outputTokens: data.usage.completion_tokens
                });
            } catch (error) {
                reject(new Error(chrome.i18n.getMessage('analysisError')));
            }
        });
    });
}