import type { Paper, SearchParams } from '../types';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

interface ApiResponse {
    data: Paper[];
}

interface CitationResponse {
    data: { citingPaper: Paper }[];
}

interface ReferenceResponse {
    data: { citedPaper: Paper }[];
}

/**
 * Fetch papers from Semantic Scholar API
 */
export const fetchPapers = async (params: SearchParams): Promise<Paper[]> => {
    try {
        const queryParams = new URLSearchParams({
            query: params.query,
            limit: '15',
            fields: 'paperId,title,year,citationCount,abstract,embedding.specter_v2'
        });

        if (params.year_start) {
            queryParams.append('year', `${params.year_start}-${params.year_end || ''}`);
        }

        const response = await fetch(`${BASE_URL}/paper/search?${queryParams}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as ApiResponse;
        return data.data || [];
    } catch (error) {
        console.error('Semantic Scholar fetch error:', error);

        // Return mock data for testing
        return generateMockPapers(params.query);
    }
};

/**
 * Fetch citations for a specific paper (for unfold mechanism)
 */
export const fetchCitations = async (paperId: string): Promise<Paper[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/paper/${paperId}/citations?limit=10&fields=paperId,title,year,citationCount,embedding.specter_v2`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as CitationResponse;
        return data.data.map((item) => item.citingPaper);
    } catch (error) {
        console.error('Citations fetch error:', error);
        return [];
    }
};

/**
 * Fetch references for a specific paper
 */
export const fetchReferences = async (paperId: string): Promise<Paper[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/paper/${paperId}/references?limit=10&fields=paperId,title,year,citationCount`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as ReferenceResponse;
        return data.data.map((item) => item.citedPaper);
    } catch (error) {
        console.error('References fetch error:', error);
        return [];
    }
};

/**
 * Mock paper generator for testing
 */
function generateMockPapers(query: string): Paper[] {
    const baseYear = 2024;
    return Array.from({ length: 10 }, (_, i) => ({
        paperId: `mock-${i}`,
        title: `${query} - Paper ${i + 1}: Novel Approach`,
        year: baseYear - Math.floor(i / 3),
        citationCount: Math.floor(Math.random() * 5000) + 100,
        abstract: `This paper presents a comprehensive analysis of ${query}. Our findings demonstrate significant advances through novel methodologies.`
    }));
}
