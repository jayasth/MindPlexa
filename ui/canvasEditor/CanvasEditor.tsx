import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState
} from 'react';
import { useSearchParams } from 'next/navigation';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType,
  ReactFlowInstance,
  XYPosition
} from 'reactflow';
import Toolbar from '@/ui/toolbar/Toolbar';
import AIAssistanceModal from '@/ui/ai/generator/AIGeneratorModal';
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
import {
  fetchCanvas,
  insertNode,
  insertEdge,
  updateNode as updateNodeInDB,
  updateEdge as updateEdgeInDB,
  deleteNode,
  deleteEdge,
  saveCanvasState
} from '@/utils/supabase/databaseOperations';

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const defaultEdgeOptions = {
  type: 'customEdge'
};

export default function CanvasEditor({ initialCanvas, onCanvasUpdate }) {
  const searchParams = useSearchParams();
  const canvasId = searchParams.get('id');
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
    async function loadData() {
      if (!canvasId) return;
      const canvasData = await fetchCanvas(canvasId);
      if (canvasData.data) {
        const nodes = canvasData.data.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position as unknown as XYPosition,
          data: node.data
        }));
        const edges = canvasData.data.edges.map((edge) => ({
          id: edge.id,
          source: edge.sourceNode || '',
          target: edge.targetNode || '',
          data: edge.data
        }));
        const formattedEdges = edges.map((edge) => ({
          ...edge,
          source:
            typeof edge.source === 'string' ? edge.source : edge.source.id,
          target: typeof edge.target === 'string' ? edge.target : edge.target.id
        }));
        setNodes(() => nodes);
        setEdges(() => formattedEdges);
      }
    }
    loadData();
  }, [canvasId, setNodes, setEdges]);

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

  useEffect(() => {
    if (!canvasId) return;

    const autosaveInterval = setInterval(async () => {
      console.log('Autosaving canvas state...');
      try {
        await saveCanvasState(canvasId, { nodes, edges });
        console.log('Canvas state saved successfully.');
      } catch (error) {
        console.error('Failed to autosave canvas state:', error);
      }
    }, 10000); // Autosave every 10 seconds

    return () => clearInterval(autosaveInterval);
  }, [canvasId, nodes, edges]);
  const handleOpenAIAssistanceModal = () => {
    setShowAIAssistanceModal(true);
  };

  const handleCloseAIAssistanceModal = () => {
    setShowAIAssistanceModal(false);
  };

  const handleAddNode = async (node) => {
    const { data } = await insertNode(node);
    if (data) {
      addNode(data);
      setTimeout(() => {
        reactFlowInstance.current?.fitView({
          padding: 0.2,
          includeHiddenNodes: false
        });
        reactFlowInstance.current?.setCenter(node.position.x, node.position.y, {
          duration: 500
        });
      }, 100);
    }
  };

  const edgeTypes = useMemo(
    () => ({
      customEdge: (props) => <CustomEdge {...props} />
    }),
    []
  );

  const onNodeResizeStop = useCallback(
    async (
      nodeId: string,
      newSize: { width: number; height: number },
      newPosition: { x: number; y: number }
    ) => {
      console.log(
        `CanvasEditor: Node size before resizing: width = ${newSize.width}, height = ${newSize.height}`
      );
      await updateNodeInDB(nodeId, { ...newSize, position: newPosition });
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
      table: (props) => (
        <NodeRenderer {...props} onNodeResizeStop={onNodeResizeStop} />
      ),
      calendar: (props) => (
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
    async (event, node) => {
      await updateNodeInDB(node.id, { position: node.position });
      updateNode(node.id, { position: node.position });
    },
    [updateNode]
  );

  const handleConnect = useCallback(
    async (connection) => {
      if (!connection.source || !connection.target) {
        console.error('CanvasEditor: Incomplete connection data:', connection);
        return;
      }
      const newEdge = {
        ...connection,
        id: `e-${nanoid()}`,
        type: 'customEdge'
      };
      const { data } = await insertEdge(newEdge);
      if (data) {
        setEdges((eds) => [...eds, data]);
        reactFlowInstance.current?.fitView({ padding: 0.2 });
      }
    },
    [setEdges]
  );

  const onEdgesChange = useCallback(
    async (changes) => {
      setEdges((eds) => {
        if (changes[0].type === 'remove') {
          return eds.filter((e) => e.id !== changes[0].id);
        }
        return applyEdgeChanges(changes, eds);
      });

      changes.forEach(async (change) => {
        if (change.type === 'remove') {
          await deleteEdge(change.id);
        } else {
          await updateEdgeInDB(change.id, change);
        }
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
        <div className="p-2">
          <Toolbar
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
            onShare={() => handleShare({ nodes, edges })}
            onDownload={() => handleDownload({ nodes, edges })}
            onGenerateMindmap={handleOpenAIAssistanceModal}
            addNode={handleAddNode}
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
            onNodesChange={onNodesChange}
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
          <AIAssistanceModal onClose={handleCloseAIAssistanceModal} />
        )}
      </ReactFlowProvider>
    </div>
  );
}
