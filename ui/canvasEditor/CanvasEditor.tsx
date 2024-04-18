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
  ); // Adjust the debounce delay as needed

  useEffect(() => {
    if (canvas) {
      saveCanvas(canvas);
    }
  }, [canvas, saveCanvas]);

  const handleCanvasChange = (newCanvasData: Canvas) => {
    setCanvas(newCanvasData);
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
    let newNode: Node;

    switch (nodeType) {
      case 'note':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'note',
          position: { x: 0, y: 0 },
          data: {
            content: '', // provide default value
            color: '', // provide default value
            width: 0, // provide default value
            height: 0 // provide default value
          }
        };
        break;
      case 'task':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            task: '', // provide default value
            completed: false, // provide default value
            color: '', // provide default value
            width: 0, // provide default value
            height: 0 // provide default value
          }
        };
        break;
      case 'custom':
        newNode = {
          id: `node-${Date.now()}`,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: {
            /* custom-specific data */
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
            color={''}
            width={0}
            height={0}
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
            onToggleComplete={function (): void {
              throw new Error('Function not implemented.');
            }}
            color={''}
            width={0}
            height={0}
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
          <Toolbar onAddNode={handleAddNode} />
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
              <div>
                <Diagram mermaidCode={mermaidCode} isComplete={!isLoading} />
                <div>
                  {state.nodes.map((node) => (
                    <div key={node.id}>{renderNode(node)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
