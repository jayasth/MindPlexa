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
  Edge,
  applyEdgeChanges
} from 'reactflow';
import Toolbar from '@/ui/toolbar/Toolbar';
import AIAssistanceModal from '@/ui/ai/generator/AIGeneratorModal';
import {
  handleDownload,
  handleShare
} from '@/ui/canvasEditor/utils/canvasUtils';
import NodeRenderer from '@/ui/canvasEditor/NodeRenderer';
import CustomEdge from '@/ui/edges/CustomEdge';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useEdgeStore from '@/app/store/edges/useEdgeStore';
import useUIStore from '@/app/store/ui/useUIStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import { useEdgeConnection } from '@/ui/canvasEditor/edgeCreation';
import { v4 as uuidv4 } from 'uuid';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/nodeCreation';
import { createEdge } from '@/utils/canvas/edgeService';

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const defaultEdgeOptions = {
  type: 'customEdge'
};

export default function CanvasEditor({ canvasId: initialCanvasId }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [showAIAssistanceModal, setShowAIAssistanceModal] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const { onConnectStart, onConnectEnd } = useEdgeConnection();

  const {
    nodes,
    setNodes,
    onNodesChange,
    addNode,
    removeNode,
    updateNode: updateNodeInStore,
    setSelectedNodes
  } = useNodeStore();

  const { edges, setEdges, addEdge, removeEdge } = useEdgeStore();

  const { setDomNode, domNode, isLoading, setIsLoading } = useUIStore();

  const { canvasId, setCanvasId, saveCanvas, loadCanvas } = useCanvasStore();

  useEffect(() => {
    if (initialCanvasId) {
      setCanvasId(initialCanvasId);
      loadCanvas(initialCanvasId);
      console.log(`CanvasEditor: Canvas ID set to ${initialCanvasId}`);
    }
  }, [initialCanvasId, setCanvasId, loadCanvas]);

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

  const handleAddNode = useCallback(
    async (node, position) => {
      try {
        console.log('CanvasEditor: Adding new node:', node);
        await addNode(node, position);
        console.log('CanvasEditor: Node added to database:', node);
        setTimeout(() => {
          reactFlowInstance.current?.fitView({
            padding: 0.2,
            includeHiddenNodes: false
          });
          reactFlowInstance.current?.setCenter(
            node.position.x,
            node.position.y,
            {
              duration: 500
            }
          );
        }, 100);
      } catch (error) {
        console.error('Failed to add node:', error);
        // Optionally, show an error message to the user
      }
    },
    [addNode]
  );

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
      try {
        if (node.type !== 'selection_menu') {
          const updates = {
            position: newPosition,
            ...(window.innerWidth <= 768
              ? {
                  mobileEditWidth: newSize.width,
                  mobileEditHeight: newSize.height
                }
              : { editWidth: newSize.width, editHeight: newSize.height })
          };
        }
      } catch (error) {
        console.error('Failed to update node on resize:', error);
        // Optionally, show an error message to the user
      }
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
      selection_menu: (props) => <NodeRenderer {...props} />
    }),
    [onNodeResizeStop]
  );

  const onSelectionChange = useCallback(
    (elements) => {
      try {
        if (Array.isArray(elements)) {
          const selectedIds = elements.map((el) => el.id);
          setSelectedNodes(selectedIds);
        }
      } catch (error) {
        console.error('Failed to update selection:', error);
      }
    },
    [setSelectedNodes]
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      try {
        updateNodeInStore(
          node.id,
          { position: node.position },
          node.data.canvasId
        );
      } catch (error) {
        console.error('Failed to update node position:', error);
      }
    },
    [updateNodeInStore]
  );

  const handleConnect = useCallback(
    async (connection) => {
      try {
        if (!connection.source || !connection.target) {
          console.error(
            'CanvasEditor: Incomplete connection data:',
            connection
          );
          return;
        }

        // Create edge in database first
        const { data: createdEdge, error } = await createEdge({
          sourceNodeId: connection.source,
          targetNodeId: connection.target,
          canvasId: initialCanvasId
        });

        if (error) {
          console.error('Failed to create edge in database:', error);
          return;
        }

        if (!createdEdge) {
          console.error(
            'Failed to create edge: No data returned from database'
          );
          return;
        }

        // Use the ID from the database for the local edge
        const newEdge = {
          id: createdEdge.id,
          sourceNodeId: connection.source,
          targetNodeId: connection.target,
          source: connection.source,
          target: connection.target,
          type: 'customEdge'
        };

        // Add edge to local state
        addEdge(newEdge);

        console.log('Edge created successfully:', newEdge);

        reactFlowInstance.current?.fitView({ padding: 0.2 });
      } catch (error) {
        console.error('Failed to create edge:', error);
      }
    },
    [addEdge, initialCanvasId, createEdge]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updatedEdges = applyEdgeChanges(changes, eds);
        changes.forEach((change) => {
          if (change.type === 'remove') {
            removeEdge(change.id);
          }
        });
        return updatedEdges;
      });
    },
    [setEdges, removeEdge]
  );

  const handleTemporaryNodeCreationWithStore = useCallback(
    (
      parentNode: Node | null,
      position: XYPosition,
      nodeType: 'selection_menu'
    ) => {
      try {
        handleTemporaryNodeCreation(
          parentNode,
          position,
          nodeType,
          (node) => addNode(node, initialCanvasId),
          (id) => removeNode(id, initialCanvasId),
          nodes,
          initialCanvasId
        );
      } catch (error) {
        console.error('Failed to create temporary node:', error);
      }
    },
    [addNode, addEdge, removeNode, nodes, initialCanvasId]
  );

  useEffect(() => {
    if (reactFlowWrapper.current && !domNode) {
      console.log('CanvasEditor: Setting domNode');
      setDomNode(reactFlowWrapper.current);
    }
  }, [domNode, setDomNode]);

  useEffect(() => {
    return () => {
      try {
        saveCanvas();
      } catch (error) {
        console.error('Failed to save canvas on unmount:', error);
      }
    };
  }, [saveCanvas]);

  useEffect(() => {
    if (nodes.length > 0) {
      console.log('CanvasEditor: Nodes passed to ReactFlow:', nodes);
    }
  }, [nodes]);

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="p-2">
          <Toolbar
            canvasId={initialCanvasId}
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
            onNodesChange={(changes) => onNodesChange(changes, initialCanvasId)}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            disableKeyboardA11y={true}
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
