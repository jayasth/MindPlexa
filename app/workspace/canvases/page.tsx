// app/workspace/canvases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import { FaTrash } from 'react-icons/fa';
import { IoIosCreate } from 'react-icons/io';

type Canvas = Tables<'canvases'>;

export default function CanvasesPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
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
    // Setting up the real-time subscription
    const subscription = supabase
      .from('canvases')
      .on('*', (payload) => {
        console.log('Change received:', payload);
        fetchCanvases(); // Refresh the list when a change occurs
      })
      .subscribe();

    // Cleanup
    return () => subscription.unsubscribe();
  }, []);

  const handleDeleteCanvas = async (canvasId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('canvases')
      .delete()
      .eq('id', canvasId);

    if (error) {
      console.log('Error deleting canvas:', error);
    } else {
      setCanvases((prevCanvases) =>
        prevCanvases.filter((canvas) => canvas.id !== canvasId)
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Canvases</h1>
        <Link href="/canvasEditor/new" className="relative group">
          <IoIosCreate size={24} className="text-myGray-500" />
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
                  onClick={() => handleDeleteCanvas(canvas.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
              <p className="text-gray-500">{canvas.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
