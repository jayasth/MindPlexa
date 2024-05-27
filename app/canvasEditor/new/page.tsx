// app/canvasEditor/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import Modal from '@/ui/Modal/Modal1';

type Canvas = Tables<'canvases'>;

export default function NewCanvasPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [canvasTitle, setCanvasTitle] = useState('');
  const supabase = createClient();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasTitle(e.target.value);
  };

  const handleCreateCanvas = async () => {
    if (canvasTitle.trim() !== '') {
      const insertResponse = await supabase
        .from('canvases')
        .insert({ name: canvasTitle });

      console.log('Insert response:', insertResponse);

      const { data, error } = await supabase
        .from('canvases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('Select data:', data);
      console.log('Select error:', error);

      if (error) {
        console.error('Error fetching canvas:', error);
      } else if (data && data[0]) {
        console.log('Redirecting to new canvas...');
        setIsModalOpen(false);
        router.push(`/canvasEditor/${data[0].id}`);
      } else {
        console.log('Fetch operation returned no data');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/workspace/canvases');
  };

  return (
    <>
      {isModalOpen && (
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
      )}
    </>
  );
}
