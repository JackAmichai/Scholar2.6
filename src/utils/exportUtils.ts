import type { Paper, PaperNode } from '../types';

/**
 * Export papers as BibTeX format
 */
export const exportToBibTeX = (papers: (Paper | PaperNode)[]): string => {
    const entries = papers.map((paper) => {
        const key = `${paper.title.split(' ')[0].toLowerCase()}${paper.year}`;

        return `@article{${key},
  title={${paper.title}},
  year={${paper.year}},
  abstract={${paper.abstract || 'No abstract available'}},
  note={Cited by: ${paper.citationCount}}
}`;
    });

    return entries.join('\n\n');
};

/**
 * Export chat history as markdown
 */
export const exportChatToMarkdown = (messages: Array<{ role: string; content: string }>): string => {
    const header = `# Scholar 2.6 - Chat Transcript\nDate: ${new Date().toLocaleString()}\n\n---\n\n`;

    const conversation = messages.map(msg => {
        const prefix = msg.role === 'user' ? '**You:**' : '**Scholar:**';
        return `${prefix} ${msg.content}\n`;
    }).join('\n');

    return header + conversation;
};

/**
 * Export chat history as JSON
 */
export const exportChatToJSON = (messages: Array<{ role: string; content: string }>): string => {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        messages
    }, null, 2);
};

/**
 * Download file to user's computer
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Calculate PageRank for citation network
 */
export const calculatePageRank = (nodes: PaperNode[], links: Array<{ source: string; target: string }>): Map<string, number> => {
    const d = 0.85; // Damping factor
    const iterations = 100;
    const n = nodes.length;

    if (n === 0) return new Map();

    // Initialize ranks
    const ranks = new Map<string, number>();
    nodes.forEach(node => ranks.set(node.id, 1 / n));

    // Build adjacency info
    const outLinks = new Map<string, string[]>();
    const inLinks = new Map<string, string[]>();

    nodes.forEach(node => {
        outLinks.set(node.id, []);
        inLinks.set(node.id, []);
    });

    links.forEach(link => {
        const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const target = typeof link.target === 'string' ? link.target : (link.target as any).id;

        outLinks.get(source)?.push(target);
        inLinks.get(target)?.push(source);
    });

    // Iterative calculation
    for (let i = 0; i < iterations; i++) {
        const newRanks = new Map<string, number>();

        nodes.forEach(node => {
            let rank = (1 - d) / n;

            inLinks.get(node.id)?.forEach(inNode => {
                const outCount = outLinks.get(inNode)?.length || 1;
                rank += d * ((ranks.get(inNode) || 0) / outCount);
            });

            newRanks.set(node.id, rank);
        });

        newRanks.forEach((rank, id) => ranks.set(id, rank));
    }

    return ranks;
};

/**
 * Calculate degree centrality
 */
export const calculateDegreeCentrality = (nodes: PaperNode[], links: Array<{ source: string; target: string }>): Map<string, number> => {
    const degrees = new Map<string, number>();

    nodes.forEach(node => degrees.set(node.id, 0));

    links.forEach(link => {
        const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const target = typeof link.target === 'string' ? link.target : (link.target as any).id;

        degrees.set(source, (degrees.get(source) || 0) + 1);
        degrees.set(target, (degrees.get(target) || 0) + 1);
    });

    return degrees;
};

/**
 * Cosine similarity between two vectors
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Find most similar papers based on embeddings
 */
export const findSimilarPapers = (targetPaper: PaperNode, allPapers: PaperNode[], topK: number = 5): PaperNode[] => {
    if (!targetPaper.embedding?.vector) return [];

    const similarities = allPapers
        .filter(p => p.id !== targetPaper.id && p.embedding?.vector)
        .map(paper => ({
            paper,
            similarity: cosineSimilarity(targetPaper.embedding!.vector, paper.embedding!.vector)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

    return similarities.map(s => s.paper);
};
