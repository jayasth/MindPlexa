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
  const nodeId = stageRef.current.attrs.id;
  const node = useStore.getState().nodes.find((node) => node.id === nodeId);

  if (node && node.data.content.length > 0) {
    const newContent = node.data.content.slice(0, -1);
    useStore.getState().updateNode(nodeId, {
      data: { content: newContent }
    });
  }
};

export const redo = (stageRef) => {
  // Redo functionality would require tracking the history of undos, which is not implemented in the current context.
  // This function is a placeholder to illustrate where redo logic would be implemented.
  console.warn('Redo functionality is not implemented yet.');
};

export const handleMouseDown = (e, tool, currentColor, currentStrokeWidth) => {
  const stage = e.target.getStage();
  const point = stage.getPointerPosition();
  const newShape = {
    tool,
    points: [point.x, point.y],
    stroke: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
    strokeWidth: currentStrokeWidth,
    ...(tool === 'rectangle' && { width: 0, height: 0 }),
    ...(tool === 'circle' && { radius: 0 }),
    ...(tool === 'text' && {
      text: 'Sample Text',
      fontSize: 20,
      fill: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`
    })
  };

  const nodeId = stage.attrs.id;
  const node = useStore.getState().nodes.find((node) => node.id === nodeId);

  if (node) {
    const newContent = [...node.data.content, newShape];
    useStore.getState().updateNode(nodeId, {
      data: { content: newContent }
    });
  }
};

export const handleMouseMove = (e) => {
  const stage = e.target.getStage();
  const point = stage.getPointerPosition();
  const nodeId = stage.attrs.id;
  const node = useStore.getState().nodes.find((node) => node.id === nodeId);

  if (!node || node.data.content.length === 0) return;

  const content = node.data.content;
  const shape = content[content.length - 1];

  switch (shape.tool) {
    case 'rectangle':
      shape.width = point.x - shape.points[0];
      shape.height = point.y - shape.points[1];
      break;
    case 'circle':
      shape.radius = Math.sqrt(
        Math.pow(point.x - shape.points[0], 2) +
          Math.pow(point.y - shape.points[1], 2)
      );
      break;
    case 'line':
    case 'arrow':
      shape.points = [shape.points[0], shape.points[1], point.x, point.y];
      break;
    default:
      shape.points = shape.points.concat([point.x, point.y]);
      break;
  }

  const newContent = [...content.slice(0, -1), shape];
  useStore.getState().updateNode(nodeId, {
    data: { content: newContent }
  });
};

export const handleMouseUp = (e) => {
  // Finalize the shape
};
