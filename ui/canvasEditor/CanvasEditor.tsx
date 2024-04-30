import React from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType
} from 'reactflow';
import Toolbar from './toolbar';
import {
  handleDownload,
  handleShare
} from '@/ui/canvasEditor/utils/canvasUtils';
import NodeRenderer from '@/ui/canvasEditor/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import NodeSelectionMenu from '@/ui/canvasEditor/NodeSelectionMenu';
import { useStore } from '@/app/store/useCanvasStore';
import { useEdgeConnection } from './hooks/useEdgeConnection';
import { useNodeResizing } from './hooks/useNodeResizing'; // Make sure this is correctly imported

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
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    showNodeSelectionMenu,
    menuPosition,
    setShowNodeSelectionMenu,
    addNode
  } = useStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    showNodeSelectionMenu: state.showNodeSelectionMenu,
    menuPosition: state.menuPosition,
    setShowNodeSelectionMenu: state.setShowNodeSelectionMenu,
    addNode: state.addNode
  }));

  const { onConnectStart, onConnectEnd } = useEdgeConnection();
  const { handleNodeResizeStop } = useNodeResizing(setNodes); // Use the hook here

  // Define nodeTypes using the handleNodeResizeStop from the hook
  const nodeTypes = {
    note: (props) => (
      <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
    ),
    task: (props) => (
      <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
    ),
    custom: (props) => (
      <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
    ),
    code: (props) => (
      <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
    ),
    draw: (props) => (
      <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
    ),
    selectionMenu: (props) => <NodeSelectionMenu {...props} />
  };

  function setPosition(x: number, y: number): { x: number; y: number } {
    return { x, y };
  }

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/12 bg-gray-100 p-2">
          <Toolbar
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
            onShare={() => handleShare({ nodes, edges })}
            onDownload={() => handleDownload({ nodes, edges })}
            addNode={(node: Node) => addNode(node as any)}
          />
        </div>
        <div className="w-5/6">
          {showNodeSelectionMenu && menuPosition && (
            <NodeSelectionMenu
              data={{
                onSelect: (nodeType, position) => {
                  console.log(
                    `Node type ${nodeType} selected at position`,
                    position
                  );
                },
                position: setPosition(menuPosition.x, menuPosition.y),
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
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodeOrigin={nodeOrigin}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.Straight}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            fitView={true}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
