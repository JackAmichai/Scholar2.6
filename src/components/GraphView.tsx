import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Search, Filter, Save, Upload, Download, BarChart3 } from 'lucide-react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { useTranslation } from 'react-i18next';
import type { GraphData, PaperNode, GraphLink } from '../types';
import { fetchCitations, fetchReferences } from '../utils/semanticScholar';
import { exportToBibTeX, downloadFile } from '../utils/exportUtils';
import { useTheme, colorSchemes } from '../context/ThemeContext';
import { NetworkMetrics } from './Analytics/NetworkMetrics';
import { TrendAnalysis } from './Analytics/TrendAnalysis';
import { Recommendations } from './Analytics/Recommendations';

interface GraphViewProps {
    data: GraphData;
    onClose: () => void;
    onBack: () => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ data, onClose, onBack }) => {
    const { t } = useTranslation();
    const { theme, colorScheme } = useTheme();
    const fgRef = useRef<ForceGraphMethods>(null!);

    // State
    const [graphData, setGraphData] = useState<GraphData>(data);
    const [hoveredNode, setHoveredNode] = useState<PaperNode | null>(null);
    const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
    const [selectedPaper, setSelectedPaper] = useState<PaperNode | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState<[number, number]>([1900, 2024]);
    const [citationFilter, setCitationFilter] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    // Calculate year range from data
    useEffect(() => {
        const years = graphData.nodes.map(n => n.year).filter(Boolean);
        if (years.length > 0) {
            setYearFilter([Math.min(...years), Math.max(...years)]);
        }
    }, []);

    // Filter nodes based on search and filters
    const filteredNodes = graphData.nodes.filter(node => {
        const matchesSearch = !searchQuery ||
            node.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = node.year >= yearFilter[0] && node.year <= yearFilter[1];
        const matchesCitations = node.citationCount >= citationFilter;

        return matchesSearch && matchesYear && matchesCitations;
    });

    const filteredData = {
        nodes: filteredNodes,
        links: graphData.links.filter(link => {
            const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
            const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
            return filteredNodes.some(n => n.id === sourceId) &&
                filteredNodes.some(n => n.id === targetId);
        })
    };

    // Node click handler with unfold mechanism
    const handleNodeClick = async (node: any, event: MouseEvent) => {
        const isCtrlClick = event.ctrlKey || event.metaKey;

        if (isCtrlClick) {
            // Multi-select mode
            setSelectedNodes(prev => {
                const next = new Set(prev);
                if (next.has(node.id)) {
                    next.delete(node.id);
                } else {
                    next.add(node.id);
                }
                return next;
            });
        } else {
            // Single select and focus
            setSelectedPaper(node);
            setSelectedNodes(new Set([node.id]));
            fgRef.current?.centerAt(node.x, node.y, 1000);
            fgRef.current?.zoom(2, 1000);

            // Unfold mechanism - fetch citations if not already expanded
            if (!expandedNodes.has(node.id)) {
                try {
                    const [citations, references] = await Promise.all([
                        fetchCitations(node.paperId),
                        fetchReferences(node.paperId)
                    ]);

                    const newNodes: PaperNode[] = [];
                    const newLinks: GraphLink[] = [];
                    const colors = colorSchemes[colorScheme];

                    // Add citations
                    citations.forEach((paper, idx) => {
                        if (!graphData.nodes.some(n => n.paperId === paper.paperId)) {
                            newNodes.push({
                                ...paper,
                                id: paper.paperId,
                                color: colors[idx % colors.length],
                                val: Math.log(paper.citationCount + 1) * 2
                            });
                            newLinks.push({ source: paper.paperId, target: node.id });
                        }
                    });

                    // Add references
                    references.forEach((paper, idx) => {
                        if (!graphData.nodes.some(n => n.paperId === paper.paperId)) {
                            newNodes.push({
                                ...paper,
                                id: paper.paperId,
                                color: colors[(idx + citations.length) % colors.length],
                                val: Math.log(paper.citationCount + 1) * 2
                            });
                            newLinks.push({ source: node.id, target: paper.paperId });
                        }
                    });

                    setGraphData(prev => ({
                        nodes: [...prev.nodes, ...newNodes],
                        links: [...prev.links, ...newLinks]
                    }));

                    setExpandedNodes(prev => new Set([...prev, node.id]));
                } catch (error) {
                    console.error('Failed to fetch citations:', error);
                }
            }
        }
    };

    const handleNodeHover = (node: any) => {
        setHoveredNode(node);
    };

    const handleZoomIn = () => fgRef.current?.zoom(2, 500);
    const handleZoomOut = () => fgRef.current?.zoom(0.5, 500);
    const handleReset = () => fgRef.current?.zoomToFit(400);

    // Export selected papers as BibTeX
    const handleExportBibTeX = () => {
        const papers = Array.from(selectedNodes)
            .map(id => graphData.nodes.find(n => n.id === id))
            .filter(Boolean) as PaperNode[];

        if (papers.length === 0) {
            alert('No papers selected. Ctrl+Click to select papers.');
            return;
        }

        const bibtex = exportToBibTeX(papers);
        downloadFile(bibtex, 'scholar-papers.bib', 'text/plain');
    };

    // Save graph state
    const handleSaveState = () => {
        const state = {
            graphData,
            expandedNodes: Array.from(expandedNodes),
            timestamp: new Date().toISOString()
        };

        const json = JSON.stringify(state, null, 2);
        downloadFile(json, 'graph-state.json', 'application/json');
    };

    // Load graph state
    const handleLoadState = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const state = JSON.parse(event.target?.result as string);
                    setGraphData(state.graphData);
                    setExpandedNodes(new Set(state.expandedNodes));
                } catch (error) {
                    alert('Failed to load graph state');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // Get node color with theme support
    const getNodeColor = (node: PaperNode) => {
        if (selectedNodes.has(node.id)) {
            return '#10B981'; // Green for selected
        }
        return node.color || colorSchemes[colorScheme][0];
    };

    const bgColor = theme === 'dark' ? '#0f172a' : '#f8fafc';
    const textColor = theme === 'dark' ? '#ffffff' : '#1e293b';

    return (
        <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} flex flex-col z-50`}>
            {/* Header */}
            <div className={`h-16 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-6`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition flex items-center gap-2`}
                    >
                        <ArrowLeft size={20} />
                        <span>{t('graph.back')}</span>
                    </button>
                    <h2 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-xl font-bold`}>
                        {t('graph.title')}
                    </h2>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({filteredData.nodes.length} nodes)
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className={`absolute left-2 top-2.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('graph.search')}
                            className={`pl-8 pr-3 py-1.5 text-sm rounded ${theme === 'dark'
                                ? 'bg-slate-700 text-white placeholder-gray-400'
                                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                                } w-40 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>

                    {/* Controls */}
                    <button onClick={() => setShowFilters(!showFilters)} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title="Filter">
                        <Filter size={20} />
                    </button>
                    <button onClick={() => setShowAnalytics(!showAnalytics)} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title="Analytics">
                        <BarChart3 size={20} />
                    </button>
                    <button onClick={handleZoomIn} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title={t('graph.zoomIn')}>
                        <ZoomIn size={20} />
                    </button>
                    <button onClick={handleZoomOut} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title={t('graph.zoomOut')}>
                        <ZoomOut size={20} />
                    </button>
                    <button onClick={handleReset} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title={t('graph.reset')}>
                        <RotateCcw size={20} />
                    </button>
                    <button onClick={handleExportBibTeX} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title={t('graph.export')}>
                        <Download size={20} />
                    </button>
                    <button onClick={handleSaveState} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title={t('graph.save')}>
                        <Save size={20} />
                    </button>
                    <button onClick={handleLoadState} className={`${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'} p-2 rounded transition`} title={t('graph.load')}>
                        <Upload size={20} />
                    </button>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-white hover:text-red-400' : 'text-gray-700 hover:text-red-600'} p-2 rounded transition ml-2`}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex relative">
                {/* Graph */}
                <div className="flex-1 relative">
                    {filteredData.nodes.length > 0 ? (
                        <ForceGraph2D
                            ref={fgRef}
                            graphData={filteredData}
                            nodeLabel={(node: any) => `${node.title} (${node.year})`}
                            nodeColor={(node: any) => getNodeColor(node as PaperNode)}
                            nodeVal={(node: any) => node.val || 5}
                            onNodeClick={handleNodeClick}
                            onNodeHover={handleNodeHover}
                            linkDirectionalArrowLength={3.5}
                            linkDirectionalArrowRelPos={1}
                            linkColor={() => theme === 'dark' ? '#64748b' : '#94a3b8'}
                            d3VelocityDecay={0.3}
                            d3AlphaDecay={0.01}
                            cooldownTicks={100}
                            backgroundColor={bgColor}
                            nodeCanvasObject={(node: any, ctx, globalScale) => {
                                const label = node.title;
                                const fontSize = 12 / globalScale;
                                ctx.font = `${fontSize}px Sans-Serif`;
                                ctx.fillStyle = getNodeColor(node);
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, node.val || 5, 0, 2 * Math.PI);
                                ctx.fill();

                                // Draw text
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = textColor;
                                ctx.fillText(label.substring(0, 20), node.x, node.y + 15);
                            }}
                        />
                    ) : (
                        <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <p>No papers match your filters</p>
                        </div>
                    )}

                    {/* Tooltip */}
                    {hoveredNode && (
                        <div
                            className={`absolute ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-2xl p-4 max-w-sm pointer-events-none z-10`}
                            style={{ left: '50%', top: '20px', transform: 'translateX(-50%)' }}
                        >
                            <h4 className="font-bold text-sm mb-2">{hoveredNode.title}</h4>
                            <div className="text-xs space-y-1">
                                <p><strong>{t('tooltip.year')}:</strong> {hoveredNode.year}</p>
                                <p><strong>{t('tooltip.citations')}:</strong> {hoveredNode.citationCount?.toLocaleString()}</p>
                                {hoveredNode.abstract && (
                                    <p className="mt-2 text-xs opacity-80">{hoveredNode.abstract.substring(0, 150)}...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Minimap */}
                    <div className={`absolute bottom-4 right-4 w-32 h-32 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden border-2 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'}`}>
                        <ForceGraph2D
                            graphData={filteredData}
                            nodeColor={getNodeColor}
                            nodeVal={2}
                            linkColor={() => theme === 'dark' ? '#64748b' : '#94a3b8'}
                            backgroundColor={bgColor}
                            enableNodeDrag={false}
                            enableZoomInteraction={false}
                            enablePanInteraction={false}
                        />
                    </div>
                </div>

                {/* Filters Sidebar */}
                {showFilters && (
                    <div className={`w-64 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-l p-4 overflow-y-auto`}>
                        <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filters</h3>

                        <div className="space-y-4">
                            <div>
                                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Year Range
                                </label>
                                <div className="flex gap-2 mt-1">
                                    <input
                                        type="number"
                                        value={yearFilter[0]}
                                        onChange={e => setYearFilter([+e.target.value, yearFilter[1]])}
                                        className={`w-20 px-2 py-1 text-sm rounded ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                                    />
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>-</span>
                                    <input
                                        type="number"
                                        value={yearFilter[1]}
                                        onChange={e => setYearFilter([yearFilter[0], +e.target.value])}
                                        className={`w-20 px-2 py-1 text-sm rounded ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Min Citations: {citationFilter}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={citationFilter}
                                    onChange={e => setCitationFilter(+e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>

                            <div>
                                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Selected Papers: {selectedNodes.size}
                                </label>
                                <button
                                    onClick={() => setSelectedNodes(new Set())}
                                    className="mt-1 w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Sidebar */}
                {showAnalytics && (
                    <div className={`w-80 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-l p-4 overflow-y-auto space-y-4`}>
                        <NetworkMetrics nodes={filteredData.nodes} links={filteredData.links} />
                        <TrendAnalysis papers={filteredData.nodes} />
                        <Recommendations selectedPaper={selectedPaper} allPapers={graphData.nodes} />
                    </div>
                )}
            </div>
        </div>
    );
};
