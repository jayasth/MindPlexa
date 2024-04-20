// ui/canvasEditor/CanvasEditor.tsx

'use client';

import React, { useState, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Diagram from '@/ui/canvasEditor/diagram';
import Button from '@/ui/Button/Button';
import { Textarea } from '@/ui/Textarea/textarea';
import Toolbar from '@/ui/canvasEditor/toolbar';
import { useCompletion } from 'ai/react';
import { ReactFlowProvider, useReactFlow, ReactFlowInstance } from 'reactflow';
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
import { useCanvas } from '@/hooks/useCanvas';

type Canvas = Tables<'canvases'> & {
  nodes?: Node[];
  edges?: Edge[];
};

type CanvasEditorProps = {
  initialCanvas?: Canvas | null;
  onCanvasUpdate?: (updatedCanvas: Canvas) => void;
};

const CanvasEditorContent = ({
  initialCanvas,
  onCanvasUpdate
}: CanvasEditorProps) => {
  const reactFlowInstance = useReactFlow(); // Now inside a child component

  const router = useRouter();
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [canvas, setCanvas] = useCanvas(initialCanvas);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
            onAddNode={(nodeType) => {
              if (reactFlowInstance && reactFlowWrapper.current) {
                handleAddNode(
                  nodeType,
                  dispatch,
                  reactFlowWrapper,
                  reactFlowInstance
                );
              }
            }}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onRedo={() => dispatch({ type: 'REDO' })}
            onShare={() => setIsSharingModalOpen(true)}
            onDownload={() => handleDownload(state)}
          />
        </div>
        <div className="flex-1 flex flex-col" ref={reactFlowWrapper}>
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
              <Diagram mermaidCode={mermaidCode} isComplete={!isLoading}>
                <>
                  {state.nodes.map((node) => (
                    <NodeRenderer
                      key={node.id}
                      node={node}
                      dispatch={dispatch}
                    />
                  ))}
                </>
              </Diagram>
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
};

export default function CanvasEditor(props: CanvasEditorProps) {
  return (
    <ReactFlowProvider>
      <CanvasEditorContent {...props} />
    </ReactFlowProvider>
  );
}
