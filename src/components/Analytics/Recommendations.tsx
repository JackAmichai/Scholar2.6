import React from 'react';
import type { PaperNode } from '../../types';
import { findSimilarPapers } from '../../utils/exportUtils';

interface RecommendationsProps {
    selectedPaper: PaperNode | null;
    allPapers: PaperNode[];
}

export const Recommendations: React.FC<RecommendationsProps> = ({ selectedPaper, allPapers }) => {
    if (!selectedPaper) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                    Recommended Papers
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click a paper node to see recommendations
                </p>
            </div>
        );
    }

    const similar = findSimilarPapers(selectedPaper, allPapers);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                Similar to "{selectedPaper.title.substring(0, 30)}..."
            </h3>

            {similar.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No embedding data available for recommendations
                </p>
            ) : (
                <div className="space-y-3">
                    {similar.map(paper => (
                        <div key={paper.id} className="border-l-2 border-blue-500 pl-3">
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                                {paper.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {paper.year} · {paper.citationCount} citations
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
