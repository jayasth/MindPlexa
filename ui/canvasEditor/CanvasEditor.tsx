import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType,
  ReactFlowInstance
} from 'reactflow';
import Toolbar from './toolbar';
import {
  handleDownload,
  handleShare,
  applyEdgeChanges
} from '@/ui/canvasEditor/utils/canvasUtils';
import NodeRenderer from '@/ui/canvasEditor/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import NodeSelectionMenu from '@/ui/canvasEditor/NodeSelectionMenu';
import { useStore } from '@/app/store/useCanvasStore';
import { useNodeResizing } from '@/ui/canvasEditor/hooks/useNodeResizing';
import { useEdgeConnection } from '@/ui/canvasEditor/hooks/useEdgeConnection';
import { nanoid } from 'nanoid';

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const defaultEdgeOptions = {
  type: 'customEdge'
};

export default function CanvasEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    showNodeSelectionMenu,
    menuPosition,
    setShowNodeSelectionMenu,
    addNode,
    setDomNode,
    domNode
  } = useStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    onNodesChange: state.onNodesChange,
    showNodeSelectionMenu: state.showNodeSelectionMenu,
    menuPosition: state.menuPosition,
    setShowNodeSelectionMenu: state.setShowNodeSelectionMenu,
    addNode: state.addNode,
    setDomNode: state.setDomNode,
    domNode: state.domNode
  }));

  const { handleNodeResizeStop } = useNodeResizing();
  const { onConnectStart, onConnectEnd } = useEdgeConnection();

  const handleDeleteEdge = useCallback(
    (edgeId) => {
      console.log('Deleting edge with id:', edgeId);
      setEdges((currentEdges) => {
        console.log('Current edges before deletion:', currentEdges);
        const updatedEdges = currentEdges.filter((edge) => edge.id !== edgeId);
        console.log('Updated edges after deletion:', updatedEdges);
        return updatedEdges;
      });
    },
    [setEdges]
  );

  const edgeTypes = useMemo(
    () => ({
      customEdge: (props) => (
        <CustomEdge {...props} onDelete={handleDeleteEdge} />
      )
    }),
    [handleDeleteEdge]
  );

  const nodeTypes = useMemo(
    () => ({
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
    }),
    [handleNodeResizeStop]
  );

  const handleConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) {
        console.error('Incomplete connection data:', connection);
        return;
      }
      const newEdge = {
        ...connection,
        id: `e-${nanoid()}`,
        type: 'customEdge'
      };
      setEdges((eds) => [...eds, newEdge]);
      reactFlowInstance.current?.fitView({ padding: 0.2 });
    },
    [setEdges]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        if (changes[0].type === 'remove') {
          return eds.filter((e) => e.id !== changes[0].id);
        }
        return applyEdgeChanges(changes, eds);
      });
    },
    [setEdges]
  );

  function setPosition(x: number, y: number): { x: number; y: number } {
    return { x, y };
  }

  useEffect(() => {
    console.log('ReactFlowWrapper ref:', reactFlowWrapper.current);
    if (reactFlowWrapper.current && !domNode) {
      console.log('Setting domNode');
      setDomNode(reactFlowWrapper.current);
    }
  }, [reactFlowWrapper.current, domNode]);

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/12 bg-gray-100 p-2">
          <Toolbar
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
            onShare={() => handleShare({ nodes, edges })}
            onDownload={() => handleDownload({ nodes, edges })}
            addNode={(node: Node) => {
              addNode(node as any);
              reactFlowInstance.current?.fitView({ padding: 0.2 });
            }}
            reactFlowInstance={undefined}
          />
        </div>
        <div ref={reactFlowWrapper} className="w-11/12">
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
            onConnect={handleConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodeOrigin={nodeOrigin}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.Straight}
            fitView={false}
            fitViewOptions={{ padding: 0.2 }}
            onInit={(instance) => {
              reactFlowInstance.current = instance;
              useStore.getState().setDomNode(reactFlowWrapper.current);
            }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
