import type { Message } from '../types';

// ========================================
// MULTI-MODEL LLM ORCHESTRATOR
// ========================================

export interface ModelProvider {
    name: string;
    endpoint: string;
    apiKey: string;
    model: string;
    maxTokens: number;
}

export interface ModelResponse {
    provider: string;
    content: string;
    latency: number;
    error?: string;
    success: boolean;
}

/**
 * Call a single LLM provider
 */
async function callProvider(
    provider: ModelProvider,
    messages: Message[]
): Promise<ModelResponse> {
    const startTime = performance.now();

    try {
        let response;

        if (provider.name === 'groq') {
            response = await callGroq(provider, messages);
        } else if (provider.name === 'huggingface') {
            response = await callHuggingFace(provider, messages);
        } else if (provider.name === 'openrouter') {
            response = await callOpenRouter(provider, messages);
        } else if (provider.name === 'google') {
            response = await callGoogleGemma(provider, messages);
        } else {
            throw new Error(`Unknown provider: ${provider.name}`);
        }

        const latency = performance.now() - startTime;

        return {
            provider: provider.name,
            content: response,
            latency,
            success: true
        };
    } catch (error: any) {
        const latency = performance.now() - startTime;
        console.error(`${provider.name} error:`, error);

        return {
            provider: provider.name,
            content: '',
            latency,
            error: error.message,
            success: false
        };
    }
}

/**
 * Call Groq API (fastest!)
 */
async function callGroq(
    provider: ModelProvider,
    messages: Message[]
): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
            model: provider.model,
            messages: messages,
            max_tokens: provider.maxTokens,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

/**
 * Call Hugging Face Inference API
 */
async function callHuggingFace(
    provider: ModelProvider,
    messages: Message[]
): Promise<string> {
    // Convert messages to HF format (just use last message for simplicity)
    const lastMessage = messages[messages.length - 1];

    const response = await fetch(
        `https://api-inference.huggingface.co/models/${provider.model}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`
            },
            body: JSON.stringify({
                inputs: lastMessage.content,
                parameters: {
                    max_new_tokens: provider.maxTokens,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || '';
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(
    provider: ModelProvider,
    messages: Message[]
): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
            'HTTP-Referer': 'https://scholar-2-6.extension',
            'X-Title': 'Scholar 2.6'
        },
        body: JSON.stringify({
            model: provider.model,
            messages: messages,
            max_tokens: provider.maxTokens
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

/**
 * Call Google AI Studio (Gemma)
 */
async function callGoogleGemma(
    provider: ModelProvider,
    messages: Message[]
): Promise<string> {
    const lastMessage = messages[messages.length - 1];

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: lastMessage.content }]
                }]
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
}

/**
 * Call multiple models in parallel
 */
export async function callMultipleModels(
    messages: Message[],
    providers: ModelProvider[]
): Promise<ModelResponse[]> {
    const promises = providers.map(provider => callProvider(provider, messages));
    const results = await Promise.allSettled(promises);

    return results.map((result, idx) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            return {
                provider: providers[idx].name,
                content: '',
                latency: 0,
                error: result.reason?.message || 'Unknown error',
                success: false
            };
        }
    });
}

/**
 * Synthesize multiple responses into one best answer
 * Strategy: Hybrid (combine best points from each)
 */
export function synthesizeResponses(responses: ModelResponse[]): string {
    // Filter successful responses
    const successful = responses.filter(r => r.success && r.content.trim());

    if (successful.length === 0) {
        return 'I apologize, but I\'m having trouble connecting to the AI models right now. Please try again.';
    }

    // If only one response, return it
    if (successful.length === 1) {
        return successful[0].content;
    }

    // Simple synthesis: Pick the longest response (often more detailed)
    // In production, you'd use more sophisticated logic
    const sorted = successful.sort((a, b) => b.content.length - a.content.length);

    return sorted[0].content;
}

/**
 * Get configured providers from environment
 */
export function getConfiguredProviders(): ModelProvider[] {
    const providers: ModelProvider[] = [];

    // Groq (prioritize for speed)
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (groqKey && groqKey !== 'gsk_YOUR_KEY_HERE') {
        providers.push({
            name: 'groq',
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            apiKey: groqKey,
            model: 'llama3-70b-8192',
            maxTokens: 1024
        });
    }

    // Hugging Face
    const hfKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (hfKey && hfKey !== 'hf_YOUR_TOKEN_HERE') {
        providers.push({
            name: 'huggingface',
            endpoint: 'https://api-inference.huggingface.co',
            apiKey: hfKey,
            model: 'meta-llama/Meta-Llama-3-70B-Instruct',
            maxTokens: 1024
        });
    }

    // OpenRouter (fallback)
    const orKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (orKey && orKey !== 'sk-or_YOUR_KEY_HERE') {
        providers.push({
            name: 'openrouter',
            endpoint: 'https://openrouter.ai/api/v1/chat/completions',
            apiKey: orKey,
            model: 'meta-llama/llama-3-70b-instruct',
            maxTokens: 1024
        });
    }

    // Google Gemma
    const googleKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (googleKey && googleKey !== 'AIza_YOUR_KEY_HERE') {
        providers.push({
            name: 'google',
            endpoint: 'https://generativelanguage.googleapis.com',
            apiKey: googleKey,
            model: 'gemma-2-9b-it',
            maxTokens: 1024
        });
    }

    return providers;
}
