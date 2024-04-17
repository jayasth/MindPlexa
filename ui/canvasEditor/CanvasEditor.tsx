// ui/canvasEditor/CanvasEditor.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import Diagram from '@/ui/canvasEditor/diagram';
import Button from '@/ui/Button/Button';
import { Textarea } from '@/ui/Textarea/textarea';
import Toolbar from '@/ui/canvasEditor/toolbar';
import { useCompletion } from 'ai/react';
import debounce from 'lodash/debounce'; // Ensure lodash.debounce is installed

type Canvas = Tables<'canvases'>;

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
  ); // 2000 milliseconds debounce period

  useEffect(() => {
    if (canvas) {
      saveCanvas(canvas);
    }
  }, [canvas, saveCanvas]);

  const handleCanvasChange = (newCanvasData: Canvas) => {
    setCanvas(newCanvasData);
    saveCanvas(newCanvasData);
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

  const handleAddNode = () => {
    // Logic to add a new node
  };

  const handleDeleteNode = () => {
    // Logic to delete the selected node
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-screen">
      <div className="flex flex-1">
        <div className="bg-myLightGray-800 p-4">
          <Toolbar onAddNode={handleAddNode} onDeleteNode={handleDeleteNode} />
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
              <Diagram mermaidCode={mermaidCode} isComplete={!isLoading} />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
