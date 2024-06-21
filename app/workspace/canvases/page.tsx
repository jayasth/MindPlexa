// app/workspace/canvases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import { FaTrash } from 'react-icons/fa';
import { MdAddCircleOutline } from 'react-icons/md';
import {
  deleteCanvas,
  deleteCanvasWithNodes
} from '@/utils/canvas/canvasDatabaseOperations';
import DeleteCanvasModal from '@/ui/Modal/DeleteCanvasModal';

type Canvas = Tables<'canvases'>;

export default function CanvasesPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasNodes, setHasNodes] = useState(false);
  const [hasSharedNodes, setHasSharedNodes] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Fetch canvases
    const fetchCanvases = async () => {
      const { data, error } = await supabase
        .from('canvases')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error) {
        setCanvases(data);
      }
    };

    fetchCanvases();

    // Cleanup
    return () => {};
  }, []);

  const openDeleteModal = async (canvasId: string) => {
    setSelectedCanvasId(canvasId);
    // Check if the canvas has nodes and if any of them are shared
    const { data: nodes, error } = await supabase
      .from('node_canvas_link')
      .select('node_id')
      .eq('canvas_id', canvasId);

    if (error) {
      console.error('Error fetching canvas nodes:', error);
    } else {
      setHasNodes(nodes.length > 0);
      if (nodes.length > 0) {
        const nodeIds = nodes.map((node) => node.node_id);
        const { count } = await supabase
          .from('node_canvas_link')
          .select('node_id', { count: 'exact' })
          .in('node_id', nodeIds)
          .neq('canvas_id', canvasId);

        if (count !== null) {
          setHasSharedNodes(count > 0);
        } else {
          console.error('Error fetching shared nodes count');
        }
      }
    }
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async (
    deleteOption: 'canvasOnly' | 'withNodes'
  ) => {
    if (selectedCanvasId) {
      if (deleteOption === 'canvasOnly') {
        await deleteCanvas(selectedCanvasId, setCanvases);
      } else {
        await deleteCanvasWithNodes(selectedCanvasId, setCanvases);
      }
      setIsModalOpen(false);
      setSelectedCanvasId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Canvases</h1>
        <Link href="/canvasEditor/new" className="relative group">
          <MdAddCircleOutline size={24} className="text-myGray-500" />
          <span className="sr-only">Create New Canvas</span>
          <div className="absolute right-4 bg-myGray-300 text-white px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Create New Canvas
          </div>
        </Link>
      </div>
      <ul>
        {canvases.map((canvas) => (
          <li key={canvas.id} className="mb-4">
            <div className="border border-gray-300 rounded p-4">
              <div className="flex justify-between items-center">
                <Link href={`/canvasEditor/${canvas.id}`}>
                  <h2 className="text-xl font-bold">{canvas.name}</h2>
                </Link>
                <button
                  onClick={() => openDeleteModal(canvas.id)}
                  className="text-lavender-500 hover:text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
              <p className="text-gray-500">{canvas.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <DeleteCanvasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        hasNodes={hasNodes}
        hasSharedNodes={hasSharedNodes}
      />
    </div>
  );
}
