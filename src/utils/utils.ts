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
        console.error('Error validating API key:', error);
        return false;
    }
}

export function getContextSentence(analysisResult: any): string {
    console.log(analysisResult);
    const redCircle = "strongly present";
    const yellowCircle = "somewhat present";

    if (analysisResult["Facts go against scientific consensus"] === redCircle ||
        analysisResult["Misuse of experts"] === redCircle) {
        return "contextSentence1";
    } else if (analysisResult["Ideological bias"] === redCircle) {
        return "contextSentence2";
    } else if (analysisResult["Ideological bias"] === redCircle &&
        analysisResult["Misuse of experts"] === yellowCircle) {
        return "contextSentence3";
    }
    return ""; // Return empty string if no conditions are met
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
                return the results as a pure JSON object without any additional text or explanation. The JSON object should have the following structure:
                {
                  "emotionsFeature": "label",
                  "biasFeature": "label",
                  "informalLanguageFeature": "label",
                  "scientificConsensusFeature": "label",
                  "expertMisuseFeature": "label"
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
                                "emotionsFeature": { type: 'string' },
                                "biasFeature": { type: 'string' },
                                "informalLanguageFeature": { type: 'string' },
                                "scientificConsensusFeature": { type: 'string' },
                                "expertMisuseFeature": { type: 'string' }
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
                console.error('Error calling LLM:', error);
                reject(new Error(chrome.i18n.getMessage('analysisError')));
            }
        });
    });
}