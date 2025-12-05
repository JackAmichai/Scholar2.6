import React, { useState } from 'react';
import { ChatOverlay } from '../components/ChatOverlay';
import { GraphView } from '../components/GraphView';
import { FAB } from '../components/FAB';
import type { ViewState, GraphData } from '../types';

const App: React.FC = () => {
    const [viewState, setViewState] = useState<ViewState>('HIDDEN');
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

    const handleToggle = () => {
        if (viewState === 'HIDDEN') {
            setViewState('CHAT_LOOP');
        } else {
            setViewState('HIDDEN');
        }
    };

    const handleResearchReady = (data: GraphData) => {
        setGraphData(data);
        setViewState('GRAPH_VISUALIZATION');
    };

    const handleClose = () => {
        setViewState('HIDDEN');
    };

    return (
        <div className="font-sans antialiased text-gray-900">
            {viewState === 'HIDDEN' && <FAB onClick={handleToggle} />}

            {viewState === 'CHAT_LOOP' && (
                <ChatOverlay
                    onResearchReady={handleResearchReady}
                    onClose={() => setViewState('HIDDEN')}
                />
            )}

            {viewState === 'GRAPH_VISUALIZATION' && (
                <GraphView
                    data={graphData}
                    onClose={handleClose}
                    onBack={() => setViewState('CHAT_LOOP')}
                />
            )}
        </div>
    );
};

export default App;
