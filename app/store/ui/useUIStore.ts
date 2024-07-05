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
}

const useUIStore = create<UIState>()(
  devtools((set) => ({
    showNodeSelectionMenu: false,
    setShowNodeSelectionMenu: (show) => set({ showNodeSelectionMenu: show }),
    menuPosition: null,
    setMenuPosition: (position) => set({ menuPosition: position }),
    domNode: null,
    setDomNode: (node) => set({ domNode: node }),
    screenToFlowPosition: (position) => position,
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    lastLoadTime: 0,
    setLastLoadTime: (time) => set({ lastLoadTime: time })
  }))
);

export default useUIStore;
