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
  XYPosition,
  Node,
  Edge
} from 'reactflow';
import Toolbar from '@/ui/toolbar/Toolbar';
import AIAssistanceModal from '@/ui/ai/generator/AIGeneratorModal';
import {
  handleDownload,
  handleShare
} from '@/ui/canvasEditor/utils/canvasUtils';
import NodeRenderer from '@/ui/canvasEditor/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import NodeSelectionMenu from '@/ui/nodes/nodeSelectionMenu/NodeSelectionMenu';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useEdgeStore from '@/app/store/edges/useEdgeStore';
import useUIStore from '@/app/store/ui/useUIStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import { useEdgeConnection } from '@/ui/canvasEditor/hooks/useEdgeConnection';
import { v4 as uuidv4 } from 'uuid';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/TemporaryNodeHandler';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const defaultEdgeOptions = {
  type: 'customEdge'
};

export default function CanvasEditor({ canvasId }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [showAIAssistanceModal, setShowAIAssistanceModal] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const { onConnectStart, onConnectEnd, parentNode, childNodePosition } =
    useEdgeConnection();

  const {
    nodes,
    setNodes,
    onNodesChange,
    addNode,
    removeNode,
    updateNode: updateNodeInStore,
    setSelectedNodes
  } = useNodeStore();

  const { edges, setEdges, addEdge, onEdgesChange } = useEdgeStore();

  const { setDomNode, domNode, isLoading, setIsLoading } = useUIStore();

  const { canvasID, setCanvasId, saveCanvas, loadCanvas } = useCanvasStore();

  useEffect(() => {
    if (canvasId && !isLoading) {
      setCanvasId(canvasId);
      loadCanvas(canvasId);
    }
  }, [canvasId, setCanvasId, loadCanvas, isLoading]);

  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const handleOpenAIAssistanceModal = () => {
    setShowAIAssistanceModal(true);
  };

  const handleCloseAIAssistanceModal = () => {
    setShowAIAssistanceModal(false);
  };

  const handleAddNode = async (node, position) => {
    console.log('CanvasEditor: Adding new node:', node);
    await addNode(node, position);
    console.log('CanvasEditor: Node added to database:', node);
    setTimeout(() => {
      reactFlowInstance.current?.fitView({
        padding: 0.2,
        includeHiddenNodes: false
      });
      reactFlowInstance.current?.setCenter(node.position.x, node.position.y, {
        duration: 500
      });
    }, 100);
  };

  const edgeTypes = useMemo(
    () => ({
      customEdge: (props) => <CustomEdge {...props} />
    }),
    []
  );

  const onNodeResizeStop = useCallback(
    (
      node: Node,
      newSize: { width: number; height: number },
      newPosition: { x: number; y: number }
    ) => {
      const nodeType = node.type as
        | 'note'
        | 'task'
        | 'table'
        | 'calendar'
        | 'draw'
        | 'selection_menu';
      updateNodeInStore(
        node.id,
        { ...newSize, position: newPosition },
        node.data.canvasId
      );
    },
    [updateNodeInStore]
  );
  const nodeTypes = useMemo(
    () => ({
      note: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      task: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      table: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      calendar: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      draw: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      selection_menu: (props) => (
        <NodeSelectionMenu
          {...props}
          width={nodeDimensions['selection_menu'].width}
          height={nodeDimensions['selection_menu'].height}
        />
      )
    }),
    [parentNode, childNodePosition, onNodeResizeStop]
  );

  const onSelectionChange = useCallback(
    (elements) => {
      if (Array.isArray(elements)) {
        const selectedIds = elements.map((el) => el.id);
        setSelectedNodes(selectedIds);
      }
    },
    [setSelectedNodes]
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      updateNodeInStore(
        node.id,
        { position: node.position },
        node.data.canvasId
      );
    },
    [updateNodeInStore]
  );

  const handleConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) {
        console.error('CanvasEditor: Incomplete connection data:', connection);
        return;
      }
      const newEdge = {
        ...connection,
        id: `e-${uuidv4()}`,
        type: 'customEdge'
      };
      addEdge(newEdge);
      reactFlowInstance.current?.fitView({ padding: 0.2 });
    },
    [addEdge]
  );

  const handleTemporaryNodeCreationWithStore = useCallback(
    (
      parentNode: Node | null,
      position: XYPosition,
      nodeType: 'selection_menu'
    ) => {
      handleTemporaryNodeCreation(
        parentNode,
        position,
        nodeType,
        (node) => addNode(node, canvasID),
        addEdge,
        (id) => removeNode(id, canvasID),
        nodes,
        canvasID
      );
    },
    [addNode, addEdge, removeNode, nodes, canvasID]
  );

  useEffect(() => {
    if (reactFlowWrapper.current && !domNode) {
      console.log('CanvasEditor: Setting domNode');
      setDomNode(reactFlowWrapper.current);
    }
  }, [domNode, setDomNode]);

  // Save the canvas state when the component unmounts
  useEffect(() => {
    return () => {
      saveCanvas();
    };
  }, [saveCanvas]);

  console.log('CanvasEditor: Nodes passed to ReactFlow:', nodes);

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="p-2">
          <Toolbar
            canvasId={canvasId}
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
            onShare={() => handleShare({ nodes, edges })}
            onDownload={() => handleDownload({ nodes, edges })}
            onGenerateMindmap={handleOpenAIAssistanceModal}
            reactFlowInstance={reactFlowInstance.current}
          />
        </div>
        <div
          ref={reactFlowWrapper}
          className="w-11/12"
          style={{ width: canvasSize.width, height: canvasSize.height }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => onNodesChange(changes, canvasId)}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onConnectStart={onConnectStart}
            disableKeyboardA11y={true}
            onConnectEnd={(event) => {
              onConnectEnd(event);
              if (parentNode && childNodePosition) {
                handleTemporaryNodeCreationWithStore(
                  parentNode,
                  childNodePosition,
                  'selection_menu'
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
              if (reactFlowWrapper.current && !domNode) {
                console.log('CanvasEditor: Setting domNode');
                setDomNode(reactFlowWrapper.current);
              }
            }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
        {showAIAssistanceModal && (
          <AIAssistanceModal onClose={handleCloseAIAssistanceModal} />
        )}
      </ReactFlowProvider>
    </div>
  );
}
