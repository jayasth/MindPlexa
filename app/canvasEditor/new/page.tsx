// app/canvasEditor/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import Modal from '@/ui/Modal/Modal';
import CanvasEditor from '@/ui/canvasEditor/CanvasEditor';

type Canvas = Tables<'canvases'>;

export default function NewCanvasPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [canvasTitle, setCanvasTitle] = useState('');
  const [createdCanvasId, setCreatedCanvasId] = useState<string | null>(null);
  const supabase = createClient();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasTitle(e.target.value);
  };

  const handleCreateCanvas = async () => {
    if (canvasTitle.trim() !== '') {
      const { data, error } = await supabase
        .from('canvases')
        .insert({ name: canvasTitle })
        .single<Canvas>();

      if (!error && data) {
        setCreatedCanvasId(data.id);
        setIsModalOpen(false);
        router.push(`/workspace/canvases/${data.id}`); // Adjust the URL as needed
      } else {
        console.error('Error creating canvas:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/workspace/canvases');
  };

  if (createdCanvasId) {
    return <CanvasEditor key={createdCanvasId} />;
  }

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSubmit={handleCreateCanvas}
      title="Create New Canvas"
    >
      <input
        type="text"
        placeholder="Enter canvas title"
        value={canvasTitle}
        onChange={handleTitleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </Modal>
  );
}
