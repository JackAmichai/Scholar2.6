import React from 'react';
import type { PaperNode, GraphLink } from '../../types';
import { calculatePageRank, calculateDegreeCentrality } from '../../utils/exportUtils';

interface NetworkMetricsProps {
    nodes: PaperNode[];
    links: GraphLink[];
}

export const NetworkMetrics: React.FC<NetworkMetricsProps> = ({ nodes, links }) => {
    const pageRanks = calculatePageRank(nodes, links);
    const centralities = calculateDegreeCentrality(nodes, links);

    // Find top papers by PageRank
    const topPapers = Array.from(pageRanks.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, rank]) => ({
            paper: nodes.find(n => n.id === id)!,
            rank,
            centrality: centralities.get(id) || 0
        }));

    const avgCentrality = Array.from(centralities.values()).reduce((a, b) => a + b, 0) / centralities.size || 0;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Network Metrics
            </h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Nodes:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nodes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Links:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{links.length}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Connections:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {avgCentrality.toFixed(1)}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Most Influential Papers
                </h4>
                <div className="space-y-2">
                    {topPapers.map(({ paper, rank, centrality }) => (
                        <div key={paper.id} className="text-xs">
                            <div className="font-medium text-gray-800 dark:text-white truncate">
                                {paper.title}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                                PageRank: {rank.toFixed(4)} · Degree: {centrality}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
