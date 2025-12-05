import React from 'react';
import { X, ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import type { GraphData } from '../types';

interface GraphViewProps {
    data: GraphData;
    onClose: () => void;
    onBack: () => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ data, onClose, onBack }) => {
    const fgRef = React.useRef<ForceGraphMethods>(null!);
    const [graphData] = React.useState(data);

    const handleNodeClick = (node: any) => {
        // Focus camera on node
        fgRef.current?.centerAt(node.x, node.y, 1000);
        fgRef.current?.zoom(2, 1000);

        // TODO: Implement unfold logic (fetch citations)
        console.log('Clicked node:', node);
    };

    const handleZoomIn = () => {
        fgRef.current?.zoom(2, 500);
    };

    const handleZoomOut = () => {
        fgRef.current?.zoom(0.5, 500);
    };

    const handleReset = () => {
        fgRef.current?.zoomToFit(400);
    };

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col z-50">
            {/* Header */}
            <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-white hover:text-blue-400 transition flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Chat</span>
                    </button>
                    <h2 className="text-white text-xl font-bold">Knowledge Graph</h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomIn}
                        className="text-white hover:bg-slate-700 p-2 rounded transition"
                        title="Zoom In"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="text-white hover:bg-slate-700 p-2 rounded transition"
                        title="Zoom Out"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="text-white hover:bg-slate-700 p-2 rounded transition"
                        title="Reset View"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-400 p-2 rounded transition ml-2"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Graph */}
            <div className="flex-1">
                {graphData.nodes.length > 0 ? (
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={graphData}
                        nodeLabel={(node: any) => node.title}
                        nodeColor={(node: any) => node.color || '#F87171'}
                        nodeVal={(node: any) => node.val || 5}
                        onNodeClick={handleNodeClick}
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkColor={() => '#64748b'}
                        d3VelocityDecay={0.3}
                        d3AlphaDecay={0.01}
                        cooldownTicks={100}
                        backgroundColor="#0f172a"
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const label = node.title;
                            const fontSize = 12 / globalScale;
                            ctx.font = `${fontSize}px Sans-Serif`;
                            ctx.fillStyle = node.color || '#F87171';
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, node.val || 5, 0, 2 * Math.PI);
                            ctx.fill();

                            // Draw text
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#ffffff';
                            ctx.fillText(label.substring(0, 20), node.x, node.y + 15);
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white">
                        <p>No data to display</p>
                    </div>
                )}
            </div>
        </div>
    );
};
