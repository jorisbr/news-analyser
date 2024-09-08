// Utility function to save the API key to Chrome storage
export function saveApiKey(apiKey: string): void {
    chrome.storage.local.set({ chatgptApiKey: apiKey }, () => {});
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

export async function analyseWithLLM(html: string): Promise<{ content: string, inputTokens: number, outputTokens: number }> {
    return new Promise((resolve, reject) => {
        getApiKey(async (apiKey) => {
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
                top_p: 0,
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
                reject(new Error('An error occurred while analysing the content.'));
            }
        });
    });
}