'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import { FaTrash } from 'react-icons/fa';
import { MdAddCircleOutline } from 'react-icons/md';
import {
  deleteCanvas,
  deleteCanvasWithNodes
} from '@/utils/canvas/canvasService';
import DeleteCanvasModal from '@/ui/Modal/DeleteCanvasModal';

type Canvas = Tables<'canvases'>;

function CanvasesContent() {
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
  }, [supabase]);

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
        await deleteCanvas(selectedCanvasId, (updatedCanvases) => {
          setCanvases(updatedCanvases as Canvas[]);
        });
      } else {
        await deleteCanvasWithNodes(selectedCanvasId, (updatedCanvases) => {
          setCanvases(updatedCanvases as Canvas[]);
        });
      }
      setIsModalOpen(false);
      setSelectedCanvasId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-myGray-800">Canvases</h1>
        <Link
          href="/canvasEditor/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-lavender-600 hover:bg-lavender-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500 transition-colors duration-200"
        >
          <MdAddCircleOutline className="mr-2" size={18} />
          Create New Canvas
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canvases.map((canvas) => (
          <div
            key={canvas.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <Link href={`/canvasEditor/${canvas.id}`} className="block p-4">
              <h2 className="text-lg font-semibold text-myGray-800 mb-2">
                {canvas.name}
              </h2>
              <p className="text-sm text-myGray-600 mb-4">
                {canvas.description}
              </p>
            </Link>
            <div className="px-4 py-3 bg-myLightGray-100 flex justify-between items-center">
              <span className="text-xs text-myGray-500">
                Updated:{' '}
                {canvas.updated_at
                  ? new Date(canvas.updated_at).toLocaleDateString()
                  : 'N/A'}
              </span>
              <button
                onClick={() => openDeleteModal(canvas.id)}
                className="text-myGray-500 hover:text-red-500 transition-colors duration-200"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
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

export default function CanvasesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CanvasesContent />
    </Suspense>
  );
}
