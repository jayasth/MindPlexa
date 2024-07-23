import { useCallback, useRef, useState, useEffect } from 'react';

export interface History {
  pushState: (canvas: HTMLCanvasElement) => void;
  clear: () => void;
}

export interface HistoryHook {
  history: History;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useHistory(initialDrawingData = '', size = 10): HistoryHook {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (initialDrawingData) {
      setUndoStack([initialDrawingData]);
      setCanUndo(true);
    }
  }, [initialDrawingData]);

  const pushState = useCallback(
    (canvas: HTMLCanvasElement) => {
      const dataUrl = canvas.toDataURL();
      setUndoStack((prevStack) => [...prevStack.slice(-size), dataUrl]);
      setRedoStack([]);
      setCanUndo(true);
      setCanRedo(false);
    },
    [size]
  );

  const undo = useCallback(() => {
    if (undoStack.length > 1) {
      const currentState = undoStack[undoStack.length - 1];
      setRedoStack((prevStack) => [currentState, ...prevStack]);
      setUndoStack((prevStack) => prevStack.slice(0, -1));
      setCanUndo(undoStack.length > 2);
      setCanRedo(true);
    }
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const stateToRedo = redoStack[0];
      setUndoStack((prevStack) => [...prevStack, stateToRedo]);
      setRedoStack((prevStack) => prevStack.slice(1));
      setCanUndo(true);
      setCanRedo(redoStack.length > 1);
    }
  }, [redoStack]);

  const clear = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const history = useRef<History>({ pushState, clear });

  return {
    history: history.current,
    undo,
    redo,
    clear,
    canUndo,
    canRedo
  };
}
