import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import { useStore } from '@/app/store/useCanvasStore';

let history: any[][] = [];
let redoStack: any[][] = [];

export const handleBackgroundColorChange = (
  color: any,
  setTextColor: (color: string) => void,
  setBackgroundColor: (color: string) => void,
  dataId: string
) => {
  const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
  const newTextColor = getContrastYIQ(rgbaColor);
  setTextColor(newTextColor);
  setBackgroundColor(rgbaColor);
};

export const handleStrokeColorChange = (
  color: any,
  setCurrentColor: (color: any) => void
) => {
  setCurrentColor(color.rgb);
};

export const handleStrokeWidthChange = (
  event: any,
  setThickness: (thickness: number) => void
) => {
  setThickness(parseInt(event.target.value, 10));
};

export const handleEraserSelect = (setCurrentTool: (tool: string) => void) => {
  setCurrentTool('eraser');
};

export const undo = (stageRef: any) => {
  const nodeId = stageRef.current.attrs.id;
  const node = useStore
    .getState()
    .nodes.find((node: any) => node.id === nodeId);

  if (node && node.data.content.length > 0) {
    history.push([...node.data.content]);
    const newContent = node.data.content.slice(0, -1);
    useStore.getState().updateNode(nodeId, {
      data: { content: newContent }
    });
  }
};

export const redo = (stageRef: any) => {
  const nodeId = stageRef.current.attrs.id;
  const node = useStore
    .getState()
    .nodes.find((node: any) => node.id === nodeId);

  if (node && history.length > 0) {
    redoStack.push([...node.data.content]);
    const newContent = history.pop();
    useStore.getState().updateNode(nodeId, {
      data: { content: newContent }
    });
  }
};

export const handleMouseDown = (
  e: any,
  tool: string,
  currentColor: any,
  currentStrokeWidth: number
) => {
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
  const node = useStore
    .getState()
    .nodes.find((node: any) => node.id === nodeId);

  if (node) {
    history.push([...node.data.content]);
    const newContent = [...node.data.content, newShape];
    useStore.getState().updateNode(nodeId, {
      data: { content: newContent }
    });
  }
};

export const handleMouseMove = (e: any) => {
  const stage = e.target.getStage();
  const point = stage.getPointerPosition();
  const nodeId = stage.attrs.id;
  const node = useStore
    .getState()
    .nodes.find((node: any) => node.id === nodeId);

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

export const handleMouseUp = (e: any) => {
  const stage = e.target.getStage();
  const nodeId = stage.attrs.id;
  const node = useStore
    .getState()
    .nodes.find((node: any) => node.id === nodeId);

  if (node) {
    redoStack = []; // Clear redo stack on new action
  }
};
