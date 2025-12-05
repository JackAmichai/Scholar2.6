import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PaperNode } from '../../types';

interface TrendAnalysisProps {
    papers: PaperNode[];
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ papers }) => {
    // Group papers by year
    const yearCounts = papers.reduce((acc, paper) => {
        const year = paper.year;
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    // Convert to chart data
    const data = Object.entries(yearCounts)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, count]) => ({
            year: Number(year),
            publications: count
        }));

    if (data.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No trend data available
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Publication Trends
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="publications"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
