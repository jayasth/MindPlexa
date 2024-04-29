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
import {
  handleDownload,
  handleShare
} from '@/ui/canvasEditor/utils/canvasUtils';
import NodeRenderer from '@/ui/nodes/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import NodeSelectionMenu from '@/ui/nodes/NodeSelectionMenu';
import { useCanvasState } from './hooks/useCanvasState';
import { useStore } from '@/app/store/useCanvasStore';
import { useEdgeConnection } from './hooks/useEdgeConnection';

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
    reactFlowWrapper,
    showNodeSelectionMenu,
    menuPosition,
    setShowNodeSelectionMenu
  } = useCanvasState();

  const { onConnectStart, onConnectEnd } = useEdgeConnection();

  const updateNodes = useStore((state) => state.setNodes);
  const updateEdges = useStore((state) => state.setEdges);

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
              setNodes={updateNodes}
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
                  height: 100,
                  data: {}
                }}
              />
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
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
