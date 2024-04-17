// ui/canvasEditor/CanvasForm.tsx

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import Button from '@/ui/Button/Button';

type Canvas = Tables<'canvases'>;

type CanvasFormProps = {
  canvas?: Canvas | null;
  onCanvasCreated?: (canvasId: string) => void;
};

const CanvasForm: React.FC<CanvasFormProps> = ({ canvas, onCanvasCreated }) => {
  const router = useRouter();
  const [name, setName] = useState(canvas?.name || '');
  const [description, setDescription] = useState(canvas?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const user = await supabase.auth.getUser();

    if (canvas) {
      const { error } = await supabase
        .from('canvases')
        .update({ name, description })
        .eq('id', canvas.id);

      if (error) {
        console.log('Error updating canvas:', error);
      } else {
        router.push(`/canvasEditor/${canvas.id}`);
      }
    } else {
      const { data, error } = await supabase
        .from('canvases')
        .insert({ name, description, user_id: user.data.user?.id })
        .single<Canvas>();

      if (error) {
        console.log('Error creating canvas:', error);
      } else {
        if (onCanvasCreated) {
          onCanvasCreated(data.id);
        } else {
          router.push(`/canvasEditor/${data.id}`);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-2 font-bold">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block mb-2 font-bold">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
        />
      </div>
      <Button type="submit" className="variant=sleek">
        {canvas?.id ? 'Update Canvas' : 'Create Canvas'}
      </Button>
    </form>
  );
};

export default CanvasForm;
