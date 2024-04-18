// ui/canvasEditor/CanvasEditor.tsx

'use client';

import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import Diagram from '@/ui/canvasEditor/diagram';
import Button from '@/ui/Button/Button';
import { Textarea } from '@/ui/Textarea/textarea';
import Toolbar from '@/ui/canvasEditor/toolbar';
import { useCompletion } from 'ai/react';
import debounce from 'lodash/debounce';
import NoteNode from '../nodes/NoteNode';
import TaskNode from '../nodes/TaskNode';
import CustomNode from '../nodes/CustomNode';
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
    link.click();
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

  const handleAddNode = (nodeType: 'note' | 'task' | 'custom') => {
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

  const renderNode = (node: Node) => {
    switch (node.type) {
      case 'note':
        return (
          <NoteNode
            content={node.data.content}
            onDelete={() => handleDeleteNode(node.id)}
            onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
            onResize={(width, height) =>
              handleResizeNode(node.id, width, height)
            }
            color={node.data.color}
            width={node.data.width}
            height={node.data.height}
          />
        );
      case 'task':
        return (
          <TaskNode
            task={node.data.task}
            completed={node.data.completed}
            onDelete={() => handleDeleteNode(node.id)}
            onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
            onResize={(width, height) =>
              handleResizeNode(node.id, width, height)
            }
            onToggleComplete={() => {
              const updatedNode = { ...node };
              updatedNode.data.completed = !updatedNode.data.completed;
              dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
            }}
            color={node.data.color}
            width={node.data.width}
            height={node.data.height}
          />
        );
      case 'custom':
        return (
          <CustomNode
            data={node.data}
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
