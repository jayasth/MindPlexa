import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState
} from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType,
  ReactFlowInstance,
  XYPosition
} from 'reactflow';
import Toolbar from './toolbar';
import { parseMermaidCode } from '@/ui/canvasEditor/utils/mermaidUtils';
import AIAssistanceModal from '@/ui/canvasEditor/AIAssistanceModal';
import {
  handleDownload,
  handleShare,
  applyEdgeChanges
} from '@/ui/canvasEditor/utils/canvasUtils';
import NodeRenderer from '@/ui/canvasEditor/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import NodeSelectionMenu from '@/ui/nodes/nodeSelectionMenu/NodeSelectionMenu';
import { useStore } from '@/app/store/useCanvasStore';
import { useEdgeConnection } from '@/ui/canvasEditor/hooks/useEdgeConnection';
import { nanoid } from 'nanoid';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/TemporaryNodeHandler';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const defaultEdgeOptions = {
  type: 'customEdge'
};

export default function CanvasEditor({ initialCanvas, onCanvasUpdate }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [showAIAssistanceModal, setShowAIAssistanceModal] = useState(false);

  const { onConnectStart, onConnectEnd, parentNode, childNodePosition } =
    useEdgeConnection();

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    addNode,
    setDomNode,
    domNode,
    nodeInternals,
    removeNode,
    addEdge,
    updateNode
  } = useStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    onNodesChange: state.onNodesChange,
    addNode: state.addNode,
    setDomNode: state.setDomNode,
    domNode: state.domNode,
    nodeInternals: state.nodeInternals,
    removeNode: state.removeNode,
    addEdge: state.addEdge,
    updateNode: state.updateNode
  }));

  useEffect(() => {
    if (initialCanvas) {
      setNodes(initialCanvas.nodes);
      setEdges(initialCanvas.edges);
    }
  }, [initialCanvas, setNodes, setEdges]);

  const handleGenerateMindmap = async (mermaidCode: string) => {
    const { nodes: generatedNodes, edges: generatedEdges } =
      await parseMermaidCode(mermaidCode);
    setNodes((currentNodes) => [...currentNodes, ...generatedNodes]);
    setEdges((currentEdges) => [...currentEdges, ...generatedEdges]);
    setShowAIAssistanceModal(false);
  };
  const edgeTypes = useMemo(
    () => ({
      customEdge: (props) => <CustomEdge {...props} />
    }),
    []
  );

  const handleOpenAIAssistanceModal = () => {
    setShowAIAssistanceModal(true);
  };

  const handleCloseAIAssistanceModal = () => {
    setShowAIAssistanceModal(false);
  };

  const onNodeResizeStop = useCallback(
    (
      nodeId: string,
      newSize: { width: number; height: number },
      newPosition: { x: number; y: number }
    ) => {
      console.log(
        `CanvasEditor: Node size before resizing: width = ${newSize.width}, height = ${newSize.height}`
      );
      updateNode(nodeId, { ...newSize, position: newPosition });
      console.log(
        `CanvasEditor: Node size after resizing: width = ${newSize.width}, height = ${newSize.height}`
      );
    },
    [updateNode]
  );

  const nodeTypes = useMemo(
    () => ({
      note: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      task: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      custom: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      code: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      draw: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      selectionMenu: (props) => (
        <NodeSelectionMenu
          {...props}
          width={nodeDimensions['selectionMenu'].width}
          height={nodeDimensions['selectionMenu'].height}
        />
      )
    }),
    [parentNode, childNodePosition, onNodeResizeStop]
  );

  const onSelectionChange = useCallback((elements) => {
    if (Array.isArray(elements)) {
      const selectedIds = elements.map((el) => el.id);
      useStore.getState().setSelectedNodes(selectedIds);
    }
  }, []);

  const onNodeDragStop = useCallback(
    (event, node) => {
      updateNode(node.id, { position: node.position });
    },
    [updateNode]
  );

  const handleConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) {
        console.error('CanvasEditor: Incomplete connection data:', connection);
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

  const handleTemporaryNodeCreationWithStore = (
    parentNode: Node | null,
    position: XYPosition,
    nodeType: 'selectionMenu'
  ) => {
    handleTemporaryNodeCreation(
      parentNode as any,
      position,
      nodeType,
      addNode,
      addEdge,
      removeNode,
      nodes
    );
  };

  useEffect(() => {
    console.log(
      'CanvasEditor: ReactFlowWrapper ref:',
      reactFlowWrapper.current
    );
    if (reactFlowWrapper.current && !domNode) {
      console.log('CanvasEditor: Setting domNode');
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
            onGenerateMindmap={handleOpenAIAssistanceModal}
            addNode={(node: Node) => {
              addNode(node as any);
              reactFlowInstance.current?.fitView({ padding: 0.2 });
            }}
            reactFlowInstance={undefined}
          />
        </div>
        <div ref={reactFlowWrapper} className="w-11/12">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={(event) => {
              onConnectEnd(event);
              if (parentNode && childNodePosition) {
                handleTemporaryNodeCreationWithStore(
                  parentNode,
                  childNodePosition,
                  'selectionMenu'
                );
              }
            }}
            onNodeDragStop={onNodeDragStop}
            onSelectionChange={onSelectionChange}
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
        {showAIAssistanceModal && (
          <AIAssistanceModal
            onClose={handleCloseAIAssistanceModal}
            onGenerateMindmap={handleGenerateMindmap}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
}
