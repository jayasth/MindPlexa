// ui/canvasEditor/CanvasEditor.tsx

'use client';

import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';

import Diagram from '@/ui/canvasEditor/diagram';
import Button from '@/ui/Button/Button';
import { Textarea } from '@/ui/Textarea/textarea';
import Toolbar from '@/ui/canvasEditor/toolbar';
import { useCompletion } from 'ai/react';
import debounce from 'lodash/debounce';
import type { Json, Tables } from 'types_db';
import CustomNode from '@/ui/nodes/CustomNode';
import NoteNode from '@/ui/nodes/NoteNode';
import TaskNode from '@/ui/nodes/TaskNode';
import CodeNode from '@/ui/nodes/CodeNode';
import DrawNode from '@/ui/nodes/DrawNode';
import {
  canvasEditorReducer,
  CanvasEditorState,
  Edge,
  Node
} from './canvasEditorReducer';
import SharingModal from './SharingModal';

type Canvas = Tables<'canvases'> & {
  nodes?: Node[];
  edges?: Edge[];
};

type CanvasEditorProps = {
  initialCanvas?: Canvas | null;
  onCanvasUpdate?: (updatedCanvas: Canvas) => void;
};

// Define a type that encompasses all node types
type NodeType = {
  id: string;
  canvas_id: string | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
  position: Json;
  height: number | null;
  width: number | null;
  title: string | null;
  type: 'note' | 'task' | 'custom' | 'code' | 'draw';
} & (
  | { type: 'note'; content: string | null }
  | { type: 'task'; task: string | null; completed: boolean | null }
  | { type: 'custom'; data: Json }
  | { type: 'code'; code: string | null; language: string | null }
  | { type: 'draw'; data: Json }
);

// Type guard to check if an object matches the NodeType
function isNodeType(node: any): node is NodeType {
  return node && typeof node === 'object' && 'type' in node;
}

export default function CanvasEditor({
  initialCanvas,
  onCanvasUpdate
}: CanvasEditorProps) {
  const router = useRouter();
  const [canvas, setCanvas] = useState<Canvas | null>(initialCanvas || null);
  const supabase = createClient();
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);

  const [state, dispatch] = useReducer(canvasEditorReducer, {
    nodes: initialCanvas?.nodes || [],
    edges: initialCanvas?.edges || [],
    currentVersion: 0,
    versions: []
  });

  const saveCanvas = useCallback(
    debounce(async (canvasData) => {
      if (canvasData && canvasData.id) {
        const { error } = await supabase
          .from('canvases')
          .update(canvasData)
          .match({ id: canvasData.id });

        if (!error) {
          console.log('Canvas saved successfully');
          onCanvasUpdate && onCanvasUpdate(canvasData);
        } else {
          console.error('Error saving canvas:', error);
        }
      }
    }, 2000),
    []
  );

  useEffect(() => {
    if (canvas) {
      saveCanvas(canvas);
    }
  }, [canvas, saveCanvas]);

  const handleCanvasChange = (newCanvasData: Canvas) => {
    setCanvas(newCanvasData);
  };

  const handleShare = (emails: string[]) => {
    console.log('Sharing canvas with:', emails);
  };

  const handleDownload = () => {
    const canvasData = {
      nodes: state.nodes,
      edges: state.edges
    };
    const json = JSON.stringify(canvasData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'canvas.json';
    link.click;
    URL.revokeObjectURL(url);
  };

  const {
    completion: mermaidCode,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useCompletion();

  useEffect(() => {
    if (canvas && onCanvasUpdate) {
      const timer = setTimeout(() => {
        onCanvasUpdate(canvas);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [canvas, onCanvasUpdate]);

  const Loading = () => (
    <div className="relative h-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Loading...
      </div>
    </div>
  );

  const handleAddNode = (
    nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let newNode: Node;

    switch (nodeType) {
      case 'note':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'note',
          position: {
            x: viewportWidth / 2 - 100,
            y: viewportHeight / 2 - 100
          },
          data: {
            content: '',
            color: '',
            width: 0,
            height: 0
          }
        };
        break;
      case 'task':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'task',
          position: {
            x: viewportWidth / 2 - 100,
            y: viewportHeight / 2 - 100
          },
          data: {
            task: '',
            completed: false,
            color: '',
            width: 0,
            height: 0
          }
        };
        break;
      case 'custom':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'custom',
          position: {
            x: viewportWidth / 2 - 100,
            y: viewportHeight / 2 - 100
          },
          data: {}
        };
        break;
      case 'code':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'code',
          position: {
            x: viewportWidth / 2 - 100,
            y: viewportHeight / 2 - 100
          },
          data: {
            code: '', // Initialize as empty string or appropriate default
            language: '' // Initialize language
          }
        };
        break;
      case 'draw':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'draw',
          position: { x: viewportWidth / 2 - 100, y: viewportHeight / 2 - 100 },
          data: {
            data: {}, // Initialize with empty or default drawing data
            color: '',
            width: 100, // Default width
            height: 100 // Default height
          }
        };
        break;
    }

    dispatch({ type: 'ADD_NODE', payload: newNode });
  };

  const handleDeleteNode = (nodeId: string) => {
    dispatch({ type: 'DELETE_NODE', payload: nodeId });
  };

  const handleChangeNodeColor = (nodeId: string, color: string) => {
    const updatedNode = state.nodes.find((node) => node.id === nodeId);
    if (updatedNode) {
      updatedNode.data.color = color;
      dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
    }
  };

  const handleResizeNode = (nodeId: string, width: number, height: number) => {
    const updatedNode = state.nodes.find((node) => node.id === nodeId);
    if (updatedNode) {
      updatedNode.data.width = width;
      updatedNode.data.height = height;
      dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
    }
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleRedo = () => {
    dispatch({ type: 'REDO' });
  };

  // Define toggleTaskCompletion function
  const toggleTaskCompletion = (id: string) => {
    const nodeIndex = state.nodes.findIndex((node) => node.id === id);
    if (nodeIndex !== -1) {
      const node = state.nodes[nodeIndex];
      if (node.type === 'task') {
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            completed: !node.data.completed
          }
        };
        dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
      }
    }
  };

  // Adjusted renderNode function
  const renderNode = (node: any) => {
    switch (node.type) {
      case 'note':
        return (
          <NoteNode
            node={node}
            onDelete={() => handleDeleteNode(node.id)}
            onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
            onResize={(width, height) =>
              handleResizeNode(node.id, width, height)
            }
          />
        );
      case 'task':
        return (
          <TaskNode
            node={node}
            task={node.task}
            completed={node.completed}
            color={node.color}
            width={node.width}
            height={node.height}
            onDelete={() => handleDeleteNode(node.id)}
            onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
            onToggleComplete={() => toggleTaskCompletion(node.id)}
            onResize={(width, height) =>
              handleResizeNode(node.id, width, height)
            }
          />
        );
      case 'custom':
        return (
          <CustomNode
            node={node}
            onDelete={() => handleDeleteNode(node.id)}
            onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
            onResize={(width, height) =>
              handleResizeNode(node.id, width, height)
            }
          />
        );
      case 'code':
        return (
          <CodeNode
            node={node}
            onDelete={() => handleDeleteNode(node.id)}
            onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
            onResize={(width, height) =>
              handleResizeNode(node.id, width, height)
            }
          />
        );
      case 'draw':
        return (
          <DrawNode
            node={node}
            onDelete={() => handleDeleteNode(node.id)}
            onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
            onResize={(width, height) =>
              handleResizeNode(node.id, width, height)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-screen">
      <div className="flex flex-1">
        <div className="bg-myLightGray-800 p-4">
          <Toolbar
            onAddNode={handleAddNode}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onShare={() => setIsSharingModalOpen(true)}
            onDownload={handleDownload}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="p-4">
            <Textarea
              placeholder="Type here..."
              value={input}
              onChange={handleInputChange}
              className="w-full rounded-b-none focus:outline-none"
            />
            <Button className="rounded-t-none" type="submit">
              Submit
            </Button>
          </div>
          <div className="flex-1 bg-myLightGray-500 p-4 overflow-auto">
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div style={{ height: '100%' }}>
                  <Diagram mermaidCode={mermaidCode} isComplete={!isLoading} />
                </div>
                <div>
                  {state.nodes.map((node) => (
                    <div key={node.id}>{renderNode(node)}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <SharingModal
        isOpen={isSharingModalOpen}
        onClose={() => setIsSharingModalOpen(false)}
        onShare={handleShare}
      />
    </form>
  );
}
