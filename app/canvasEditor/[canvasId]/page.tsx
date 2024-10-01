'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import CanvasEditor from '@/ui/canvasEditor/CanvasEditor';

type Canvas = Tables<'canvases'>;

export default function CanvasEditorPage() {
  const { canvasId } = useParams();
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    const fetchCanvas = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('canvases')
        .select('*')
        .eq('id', canvasId)
        .single();

      if (error) {
        console.log('Error fetching canvas:', error);
      } else {
        setCanvas(data);
      }
    };

    fetchCanvas();
  }, [canvasId]);

  const handleCanvasUpdate = async (updatedCanvas: Canvas) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('canvases')
      .update(updatedCanvas)
      .eq('id', canvasId);

    if (error) {
      console.log('Error updating canvas:', error);
    }
  };

  if (!canvas) {
    return <div>Loading...</div>;
  }

  return <CanvasEditor canvasId={canvasId} />;
  // End of the Selection
}
