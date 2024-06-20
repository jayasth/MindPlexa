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
import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import {
  fetchCanvas,
  saveCanvasState
} from '@/utils/canvas/canvasDatabaseOperations';

const supabase = createClient();

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const defaultEdgeOptions = {
  type: 'customEdge'
};

export default function CanvasEditor({ canvasId }) {
  console.log('CanvasEditor: canvasId:', canvasId);

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
    updateNode: updateNodeInStore,
    setCanvasId,
    saveCanvas
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
    updateNode: state.updateNode,
    setCanvasId: state.setCanvasId,
    saveCanvas: state.saveCanvas
  }));

  useEffect(() => {
    setCanvasId(canvasId);
  }, [canvasId, setCanvasId]);

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
    if (canvasId) {
      fetchCanvas(canvasId).then((response) => {
        if (response.data) {
          setNodes(response.data.common_node_properties);
          setEdges(response.data.edges);
        }
      });
    }
  }, [canvasId, setNodes, setEdges]);

  useEffect(() => {
    if (canvasId) {
      const channel = supabase
        .channel('canvases')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'canvases' },
          (payload) => {
            console.log('CanvasEditor: Canvas inserted:', payload);
            // Fetch updated canvas data and update the store
            fetchCanvas(canvasId).then((response) => {
              if (response.data) {
                setNodes(response.data.common_node_properties);
                setEdges(response.data.edges);
              }
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'canvases' },
          (payload) => {
            console.log('CanvasEditor: Canvas updated:', payload);
            // Fetch updated canvas data and update the store
            fetchCanvas(canvasId).then((response) => {
              if (response.data) {
                setNodes(response.data.common_node_properties);
                setEdges(response.data.edges);
              }
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'canvases' },
          (payload) => {
            console.log('CanvasEditor: Canvas deleted:', payload);
            // Handle canvas deletion (e.g., redirect to a different page)
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [canvasId]);

  const handleOpenAIAssistanceModal = () => {
    setShowAIAssistanceModal(true);
  };

  const handleCloseAIAssistanceModal = () => {
    setShowAIAssistanceModal(false);
  };

  const handleAddNode = (node) => {
    const newNode = {
      ...node,
      id: nanoid(),
      position: node.position as XYPosition,
      type: node.type || 'defaultType'
    };
    addNode(newNode);
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
      nodeId: string,
      newSize: { width: number; height: number },
      newPosition: { x: number; y: number }
    ) => {
      updateNodeInStore(nodeId, { ...newSize, position: newPosition });
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
      updateNodeInStore(node.id, { position: node.position });
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

  // Save the canvas state when the component unmounts
  useEffect(() => {
    return () => {
      saveCanvas();
    };
  }, [saveCanvas]);

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
