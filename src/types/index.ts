// Types for Scholar 2.6
export interface Paper {
    paperId: string;
    title: string;
    year: number;
    citationCount: number;
    abstract?: string;
    embedding?: {
        model: string;
        vector: number[];
    };
}

export interface PaperNode extends Paper {
    id: string;
    x?: number;
    y?: number;
    color?: string;
    val?: number;
    collapsed?: boolean;
}

export interface GraphLink {
    source: string;
    target: string;
}

export interface GraphData {
    nodes: PaperNode[];
    links: GraphLink[];
}

export interface SearchParams {
    query: string;
    year_start?: number;
    year_end?: number;
    sort?: 'relevance' | 'citation_velocity' | 'citation_count';
}

export type ViewState = 'HIDDEN' | 'CHAT_LOOP' | 'GRAPH_VISUALIZATION';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    tool_calls?: any[];
}
