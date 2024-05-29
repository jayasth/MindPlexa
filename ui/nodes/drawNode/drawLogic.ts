import { useState, useRef, useCallback } from 'react';
import Konva from 'konva';
import { useStore } from '@/app/store/useCanvasStore';
import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';

interface Shape {
  tool: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  fill: string;
  text?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
}

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
  setCurrentStroke: (color: string) => void
) => {
  const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
  setCurrentStroke(rgbaColor);
};

export const handleStrokeWidthChange = (
  value: string,
  setThickness: (thickness: number) => void
) => {
  setThickness(parseInt(value, 10));
};

export const handleEraserSelect = (setCurrentTool: (tool: string) => void) => {
  setCurrentTool('eraser');
};

export const undo = (stageRef: React.RefObject<Konva.Stage>) => {
  const stage = stageRef.current;
  if (stage) {
    const nodeId = stage.attrs.id;
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
  }
};

export const redo = (stageRef: React.RefObject<Konva.Stage>) => {
  const stage = stageRef.current;
  if (stage) {
    const nodeId = stage.attrs.id;
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
    console.log('handleMouseDown: Initial content:', node.data.content);
    history.push([...node.data.content]);
    const newContent = [...node.data.content, newShape];
    console.log('handleMouseDown: New content:', newContent);
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

  if (!node || node.data.content.length === 0) {
    console.log('handleMouseMove: No node or empty content');
    return;
  }

  const content = node.data.content;
  console.log('handleMouseMove: Current content:', content);
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
  console.log('handleMouseMove: New content:', newContent);
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
    console.log('handleMouseUp: Final content:', node.data.content);
    redoStack = [];
  }
};

export const useDrawing = (initialContent: Shape[] = []) => {
  const [content, setContent] = useState<Shape[]>(initialContent);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('marker');
  const [currentColor, setCurrentColor] = useState({ r: 0, g: 0, b: 0, a: 1 });
  const [thickness, setThickness] = useState(1);
  const [currentStroke, setCurrentStroke] = useState('#000000');
  const stageRef = useRef<Konva.Stage | null>(null);

  return {
    content,
    setContent,
    isDrawing,
    setIsDrawing,
    tool,
    setTool,
    currentColor,
    setCurrentColor: (color: any) =>
      handleStrokeColorChange(color, setCurrentStroke),
    thickness,
    setThickness: (value: string) =>
      handleStrokeWidthChange(value, setThickness),
    currentStroke,
    setCurrentStroke,
    stageRef,
    handleMouseDown: (e: any) =>
      handleMouseDown(e, tool, currentColor, thickness),
    handleMouseMove: (e: any) => handleMouseMove(e),
    handleMouseUp: (e: any) => handleMouseUp(e),
    undo: () => undo(stageRef),
    redo: () => redo(stageRef),
    handleBackgroundColorChange,
    handleEraserSelect: () => handleEraserSelect(setTool)
  };
};
