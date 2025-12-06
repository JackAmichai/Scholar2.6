import { useState } from 'react';
import type { Message, GraphData, SearchParams } from '../types';
import { fetchPapers } from '../utils/semanticScholar';
import { callMultipleModels, synthesizeResponses, getConfiguredProviders } from '../utils/multiModelLLM';

const SYSTEM_PROMPT = `You are a Research Architect helping users discover academic papers. Your goal is to refine vague research intents into precise queries.

**Rules**:
1. If the user's input is broad (like "computer vision"), you MUST ask clarifying questions.
2. Check three dimensions:
   - **Scope**: Which specific subdomain? (e.g., "3D Vision" vs "Object Detection")
   - **Time Period**: Current research (2020-2024) or foundational work?
   - **Depth**: Theoretical foundations or practical applications?
3. After 2-3 clarifying questions, say you'll search for papers.
4. Ask ONE question at a time.
5. Be concise and friendly.

When ready to search, say "Let me find relevant papers for you" or similar.`;

export const useResearchAgent = (onComplete: (data: GraphData) => void) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hey there! 👋 I'm your research navigator. What topic are you exploring today?"
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    const sendMessage = async (userText: string) => {
        const newHistory: Message[] = [...messages, { role: 'user', content: userText }];
        setMessages(newHistory);
        setIsThinking(true);

        try {
            // Fetch keys from storage
            let userKeys = {};
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get(['apiKeys']);
                userKeys = result.apiKeys || {};
            }

            // Get configured providers (Groq, HF, OpenRouter, Google)
            const providers = getConfiguredProviders(userKeys);

            // If no providers configured, use mock response
            if (providers.length === 0) {
                console.log('No API keys configured - using mock responses');
                setTimeout(() => {
                    const mockResponse = generateMockResponse(userText, newHistory);
                    setMessages([...newHistory, mockResponse]);
                    setIsThinking(false);
                }, 1000);
                return;
            }

            console.log(`Using ${providers.length} model(s):`, providers.map(p => p.name).join(', '));

            // Call multiple models in parallel!
            const responses = await callMultipleModels(
                [{ role: 'system', content: SYSTEM_PROMPT }, ...newHistory],
                providers
            );

            console.log('Model responses:', responses);

            // Synthesize the best answer
            const synthesized = synthesizeResponses(responses);

            // Check if we got a valid response
            if (!synthesized || synthesized.includes('trouble connecting')) {
                // Fall back to mock
                const mockResponse = generateMockResponse(userText, newHistory);
                setMessages([...newHistory, mockResponse]);

                // Check if mock triggered search
                if (newHistory.length >= 6) {
                    setTimeout(async () => {
                        await triggerPaperSearch(userText, newHistory);
                    }, 500);
                }
            } else {
                setMessages([...newHistory, {
                    role: 'assistant',
                    content: synthesized
                }]);

                // Detect if AI is ready to search
                // Trigger search after 3 rounds of questions (6 messages in history)
                if (newHistory.length >= 6 ||
                    synthesized.toLowerCase().includes('find') ||
                    synthesized.toLowerCase().includes('search') ||
                    synthesized.toLowerCase().includes('let me') && synthesized.includes('papers')) {

                    console.log('Triggering paper search...');
                    setTimeout(async () => {
                        await triggerPaperSearch(userText, newHistory);
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Agent error:', error);
            setMessages([...newHistory, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Helper function to trigger paper search and graph generation
    const triggerPaperSearch = async (query: string, history: Message[]) => {
        try {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Perfect! Let me build your knowledge graph... 🌳'
            }]);

            // Extract search params from conversation
            const searchParams: SearchParams = {
                query: query,
                year_start: history.some(m => m.content.toLowerCase().includes('current')) ? 2020 : undefined,
                year_end: 2024
            };

            // Fetch papers
            const papers = await fetchPapers(searchParams);
            const graphData: GraphData = {
                nodes: papers.map((p: any) => ({
                    ...p,
                    id: p.paperId,
                    color: '#F87171',
                    val: Math.log(p.citationCount + 1) * 2
                })),
                links: []
            };

            onComplete(graphData);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    return { messages, sendMessage, isThinking };
};

// Mock AI response for testing without API key
function generateMockResponse(userInput: string, history: Message[]): Message {
    if (history.length === 2) {
        // First question
        return {
            role: 'assistant',
            content: `Great! ${userInput} is a fascinating field! 🔬\n\nAre you looking for current research (last 3 years) or foundational articles?`
        };
    } else if (history.length === 4) {
        // Second question
        return {
            role: 'assistant',
            content: `Perfect! Within ${history[1].content}, which specific area interests you most?\n\nFor example: 3D Vision, Object Detection, Neural Rendering, or something else?`
        };
    } else {
        // Trigger search
        return {
            role: 'assistant',
            content: 'Excellent! Let me find relevant papers for you... 🌳'
        };
    }
}
