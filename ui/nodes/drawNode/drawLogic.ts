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

    let newShape: Shape;

    switch (tool) {
      case 'rectangle':
      case 'circle':
        newShape = {
          tool,
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
          strokeWidth: thickness,
          fill: 'transparent'
        };
        break;
      case 'text':
        newShape = {
          tool,
          points: [pos.x, pos.y],
          stroke: 'transparent',
          strokeWidth: 0,
          fill: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
          text: 'Sample Text',
          x: pos.x,
          y: pos.y,
          fontSize: 20,
          fontFamily: 'Arial'
        };
        break;
      default:
        newShape = {
          tool,
          points: [pos.x, pos.y],
          stroke: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
          strokeWidth: thickness,
          fill: 'transparent'
        };
    }

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

    let updatedShape: Shape;

    switch (tool) {
      case 'rectangle':
      case 'circle':
        updatedShape = {
          ...lastShape,
          points: [lastShape.points[0], lastShape.points[1], pos.x, pos.y]
        };
        break;
      default:
        const newPoints = [...lastShape.points, pos.x, pos.y];
        updatedShape = { ...lastShape, points: newPoints };
    }

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
