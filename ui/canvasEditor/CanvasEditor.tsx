import React from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType
} from 'reactflow';
import { CanvasProvider } from './CanvasContext';
import Toolbar from './toolbar';
import { handleDownload, handleShare } from './utils/canvasEditorUtils';
import NodeRenderer from '@/ui/nodes/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import NodeSelectionMenu from '@/ui/nodes/NodeSelectionMenu';
import { useCanvasState } from './hooks/useCanvasState';

const nodeTypes = {
  note: (props) => <NodeRenderer {...props} />,
  task: (props) => <NodeRenderer {...props} />,
  custom: (props) => <NodeRenderer {...props} />,
  code: (props) => <NodeRenderer {...props} />,
  draw: (props) => <NodeRenderer {...props} />,
  selectionMenu: (props) => <NodeSelectionMenu {...props} />
};

const edgeTypes = {
  customEdge: CustomEdge
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const defaultEdgeOptions = {
  type: 'customEdge'
};

export default function CanvasEditor() {
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    reactFlowWrapper,
    showNodeSelectionMenu,
    menuPosition,
    setShowNodeSelectionMenu
  } = useCanvasState();

  return (
    <CanvasProvider>
      <div className="flex h-screen">
        <ReactFlowProvider>
          <div className="w-1/6 bg-gray-100 p-2">
            <Toolbar
              onUndo={() => console.log('Undo')}
              onRedo={() => console.log('Redo')}
              onShare={() => handleShare(nodes)}
              onDownload={() => handleDownload({ nodes, edges })}
              setNodes={setNodes}
            />
          </div>
          <div className="w-5/6" ref={reactFlowWrapper}>
            {showNodeSelectionMenu && menuPosition && (
              <NodeSelectionMenu
                data={{
                  onSelect: (nodeType, position) => {
                    console.log(
                      `Node type ${nodeType} selected at position`,
                      position
                    );
                  },
                  position: menuPosition,
                  onClose: () => setShowNodeSelectionMenu(false),
                  id: 'nodeSelectionMenu',
                  type: 'selectionMenu',
                  width: 200,
                  height: 100
                }}
              />
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodeOrigin={nodeOrigin}
              defaultEdgeOptions={defaultEdgeOptions}
              connectionLineType={ConnectionLineType.Straight}
              fitView={true}
            >
              <Background color="#aaa" gap={16} />
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </CanvasProvider>
  );
}
