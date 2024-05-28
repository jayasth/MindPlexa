import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import { useStore } from '@/app/store/useCanvasStore';

export const handleBackgroundColorChange = (
  color,
  setTextColor,
  setBackgroundColor,
  dataId
) => {
  const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
  const newTextColor = getContrastYIQ(rgbaColor);
  setTextColor(newTextColor);
  setBackgroundColor(rgbaColor);
};

export const handleStrokeColorChange = (color, setCurrentColor) => {
  setCurrentColor(color.rgb);
};

export const handleStrokeWidthChange = (event, setThickness) => {
  setThickness(parseInt(event.target.value, 10));
};

export const handleEraserSelect = (setCurrentTool) => {
  setCurrentTool('eraser');
};

export const undo = (stageRef) => {
  const { content, setContent } = useStore((state) => ({
    content: state.nodes.find((node) => node.id === stageRef.current.attrs.id)
      ?.data.content,
    setContent: (newContent) =>
      state.updateNode(stageRef.current.attrs.id, {
        data: { content: newContent }
      })
  }));

  if (content.length > 0) {
    const newContent = content.slice(0, -1);
    setContent(newContent);
  }
};

export const redo = (stageRef) => {
  // Redo functionality would require tracking the history of undos, which is not implemented in the current context.
  // This function is a placeholder to illustrate where redo logic would be implemented.
  console.warn('Redo functionality is not implemented yet.');
};
