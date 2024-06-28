import type { Node, Edge } from 'reactflow';

export const handleDownload = (state: { nodes: Node[]; edges: Edge[] }) => {
  try {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(state)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'canvas.json');
    link.click();
    console.log('canvasUtils: Downloaded canvas:', state);
  } catch (error) {
    console.error('canvasUtils: Failed to download the canvas:', error);
  }
};

export const handleShare = (state: { nodes: Node[]; edges: Edge[] }) => {
  try {
    console.log('Sharing canvas:', state);
    // Implement sharing logic here, possibly using an API or local sharing options
  } catch (error) {
    console.error('Failed to share the canvas:', error);
  }
};
