import { useState, useRef } from 'react';
import Konva from 'konva';

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

export const useDrawing = (initialContent: Shape[] = []) => {
  const [content, setContent] = useState<Shape[]>(initialContent);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('marker');
  const [currentColor, setCurrentColor] = useState({ r: 0, g: 0, b: 0, a: 1 });
  const [thickness, setThickness] = useState(1);
  const stageRef = useRef<Konva.Stage | null>(null);

  const handleMouseDown = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (tool === 'select') {
      // Handle selection tool logic here
      return;
    }

    const newShape: Shape = {
      tool,
      points: [pos.x, pos.y],
      stroke: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
      strokeWidth: thickness,
      fill: 'transparent'
    };

    setContent([...content, newShape]);
    setIsDrawing(true);
  };

  const handleMouseMove = () => {
    if (!isDrawing) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const lastShape = content[content.length - 1];
    if (!lastShape) return;

    const newPoints = [...lastShape.points, pos.x, pos.y];
    const updatedShape = { ...lastShape, points: newPoints };

    setContent([...content.slice(0, -1), updatedShape]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return {
    content,
    setContent,
    isDrawing,
    setIsDrawing,
    tool,
    setTool,
    currentColor,
    setCurrentColor,
    thickness,
    setThickness,
    stageRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};
