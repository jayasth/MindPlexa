// hooks/useCanvas.ts
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { createClient } from '@/utils/supabase/supabaseClient';

export const useCanvas = (initialCanvas) => {
  const [canvas, setCanvas] = useState(initialCanvas);
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
        } else {
          console.error('Error saving canvas:', error);
        }
      }
    }, 2000),
    []
  );

  useEffect(() => {
    if (canvas) {
      saveCanvas(canvas);
    }
  }, [canvas, saveCanvas]);

  return [canvas, setCanvas];
};
