import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { XYPosition } from 'reactflow';

interface UIState {
  showNodeSelectionMenu: boolean;
  setShowNodeSelectionMenu: (show: boolean) => void;
  menuPosition: XYPosition | null;
  setMenuPosition: (position: XYPosition | null) => void;
  domNode: HTMLDivElement | null;
  setDomNode: (node: HTMLDivElement | null) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  lastLoadTime: number;
  setLastLoadTime: (time: number) => void;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
}

const useUIStore = create<UIState>()(
  devtools((set, get) => ({
    showNodeSelectionMenu: false,
    setShowNodeSelectionMenu: (show) => {
      console.log('Store: Setting show node selection menu to:', show);
      set({ showNodeSelectionMenu: show });
    },
    menuPosition: null,
    setMenuPosition: (position) => {
      console.log('Setting menu position to:', position);
      set({ menuPosition: position });
    },
    domNode: null,
    setDomNode: (node) => {
      if (!node || get().domNode) return;
      console.log('Store: Setting DOM node');
      set({ domNode: node });
    },
    screenToFlowPosition: (position) => {
      console.log('Store: Converting screen to flow position:', position);
      return position;
    },
    isLoading: false,
    setIsLoading: (loading) => {
      console.log('Store: Setting isLoading to:', loading);
      set({ isLoading: loading });
    },
    lastLoadTime: 0,
    setLastLoadTime: (time) => {
      console.log('Store: Setting lastLoadTime to:', time);
      set({ lastLoadTime: time });
    },
    canvasSize: { width: 0, height: 0 },
    setCanvasSize: (size) => {
      console.log('Store: Setting canvas size to:', size);
      set({ canvasSize: size });
    }
  }))
);

export default useUIStore;
