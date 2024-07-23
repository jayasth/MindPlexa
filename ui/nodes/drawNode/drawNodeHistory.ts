import { useCallback, useMemo, useRef, useState } from 'react';

async function applyImage(context: CanvasRenderingContext2D, blob: Blob) {
  const img = new Image();
  img.onload = () => {
    context.canvas.width = img.width;
    context.canvas.height = img.height;
    context.drawImage(img, 0, 0);
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(blob);
}

export interface History {
  setContext: (context: CanvasRenderingContext2D) => void;
  pushState: (canvas: HTMLCanvasElement) => Promise<boolean>;
  clear: () => void;
}
export interface HistoryHook {
  history: History;

  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useHistory(size?: number): HistoryHook {
  const stack = useRef<Array<Blob>>([]);
  const crs = useRef(0);
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushState = useCallback(
    async (canvas: HTMLCanvasElement) => {
      if (!context) {
        console.error('Context not initialised');
        return false;
      }
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve)
      );
      if (blob) {
        // Check if the canvas dimensions have changed
        if (
          stack.current.length === 0 ||
          canvas.width !== context.canvas.width ||
          canvas.height !== context.canvas.height
        ) {
          // If the dimensions have changed, clear the stack and push the new state
          stack.current = [blob];
        } else {
          // Insert the new state after the current position
          stack.current.splice(stack.current.length - crs.current, 0, blob);
          // Remove any redo states
          stack.current = stack.current.slice(
            0,
            stack.current.length - crs.current
          );
          crs.current = 0;
        }
      }
      if (size && stack.current.length > size) {
        stack.current = stack.current.slice(-size);
      }
      setCanUndo(stack.current.length > 1);
      setCanRedo(false);
      return true;
    },
    [crs, stack, context, size]
  );

  const undo = useCallback(async () => {
    if (
      !context ||
      stack.current.length <= 1 ||
      crs.current + 1 >= stack.current.length
    ) {
      return false;
    }

    crs.current++;
    await applyImage(
      context,
      stack.current[stack.current.length - (crs.current + 1)]
    );
    setCanUndo(crs.current + 1 < stack.current.length);
    setCanRedo(true);
    return true;
  }, [context]);

  const redo = useCallback(async () => {
    if (!context || crs.current <= 0) {
      return false;
    }

    crs.current--;
    await applyImage(
      context,
      stack.current[stack.current.length - (crs.current + 1)]
    );
    setCanUndo(true);
    setCanRedo(crs.current > 0);
    return true;
  }, [context]);

  const clear = useCallback(() => {
    stack.current = [];
    crs.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const history = useMemo<History>(
    () => ({
      setContext: (context: CanvasRenderingContext2D) => {
        setContext(context);
      },
      pushState,
      clear
    }),
    [setContext, pushState, clear]
  );

  return { history, undo, redo, clear, canUndo, canRedo };
}
