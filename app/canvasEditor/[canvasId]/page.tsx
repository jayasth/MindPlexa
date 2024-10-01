'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import CanvasEditor from '@/ui/canvasEditor/CanvasEditor';
import React from 'react';

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

  if (!canvas) {
    return <div>Loading...</div>;
  }

  return <CanvasEditor canvasId={canvasId} />;
}
