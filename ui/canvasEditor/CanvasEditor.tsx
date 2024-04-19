// ui/canvasEditor/CanvasEditor.tsx

'use client';

import React, { useState, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Diagram from '@/ui/canvasEditor/diagram';
import Button from '@/ui/Button/Button';
import { Textarea } from '@/ui/Textarea/textarea';
import Toolbar from '@/ui/canvasEditor/toolbar';
import { useCompletion } from 'ai/react';
import type { Tables } from 'types_db';
import NodeRenderer from '@/ui/nodes/NodeRenderer';
import {
  canvasEditorReducer,
  Edge,
  Node
} from '@/ui/canvasEditor/canvasEditorReducer';
import SharingModal from './SharingModal';
import {
  handleAddNode,
  handleDownload,
  handleShare
} from '@/ui/canvasEditor/utils/canvasEditorUtils';
import { useCanvas } from '@/hooks/useCanvas'; // Import the useCanvas hook

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
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [canvas, setCanvas] = useCanvas(initialCanvas); // Use the custom hook

  const [state, dispatch] = useReducer(canvasEditorReducer, {
    nodes: initialCanvas?.nodes || [],
    edges: initialCanvas?.edges || [],
    currentVersion: 0,
    versions: []
  });

  const {
    completion: mermaidCode,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useCompletion();

  const Loading = () => (
    <div className="relative h-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Loading...
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-screen">
      <div className="flex flex-1">
        <div className="bg-myLightGray-800 p-4">
          <Toolbar
            onAddNode={(nodeType) =>
              handleAddNode(
                nodeType,
                dispatch,
                window.innerWidth,
                window.innerHeight
              )
            }
            onUndo={() => dispatch({ type: 'UNDO' })}
            onRedo={() => dispatch({ type: 'REDO' })}
            onShare={() => setIsSharingModalOpen(true)}
            onDownload={() => handleDownload(state)}
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
                    <div key={node.id}>
                      <NodeRenderer node={node} dispatch={dispatch} />
                    </div>
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
        onShare={() => handleShare(state)}
      />
    </form>
  );
}
