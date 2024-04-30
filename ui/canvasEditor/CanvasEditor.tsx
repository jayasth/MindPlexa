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
import NodeRenderer from '@/ui/nodes/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import NodeSelectionMenu from '@/ui/nodes/NodeSelectionMenu';
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
