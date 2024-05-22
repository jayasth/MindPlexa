import React from 'react';

let isDrawing = false;
let history: string[] = [];
let redoStack: string[] = [];
let startPosition = { x: 0, y: 0 };

export const startDrawing = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  setContent: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  isDrawing = true;
  startPosition = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  ctx.beginPath();
  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  setContent((prevContent) => [
    ...prevContent,
    { type: 'start', x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
  ]);
  history.push(canvas.toDataURL());
  redoStack = [];
};

export const draw = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  setContent: React.Dispatch<React.SetStateAction<any[]>>,
  tool: string,
  currentColor: { r: number; g: number; b: number; a: number },
  thickness: number
) => {
  if (!isDrawing) return;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = thickness;
  } else if (tool === 'marker') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = thickness;
    ctx.strokeStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = thickness;
    ctx.strokeStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`;
  }

  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  ctx.stroke();
  setContent((prevContent) => [
    ...prevContent,
    { type: tool, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
  ]);
};

export const stopDrawing = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  isDrawing = false;
  ctx.closePath();
};

export const undo = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  if (history.length > 0) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    redoStack.push(history.pop() as string);
    const img = new Image();
    img.src = history[history.length - 1] || '';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
};

export const redo = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  if (redoStack.length > 0) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = redoStack.pop() as string;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    history.push(canvas.toDataURL());
  }
};

export const drawShape = (
  shapeType: string,
  startPosition: { x: number; y: number },
  endPosition: { x: number; y: number },
  ctx: CanvasRenderingContext2D
) => {
  ctx.beginPath();
  switch (shapeType) {
    case 'rectangle':
      ctx.rect(
        startPosition.x,
        startPosition.y,
        endPosition.x - startPosition.x,
        endPosition.y - startPosition.y
      );
      break;
    case 'circle':
      const radius = Math.sqrt(
        Math.pow(endPosition.x - startPosition.x, 2) +
          Math.pow(endPosition.y - startPosition.y, 2)
      );
      ctx.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
      break;
    case 'line':
      ctx.moveTo(startPosition.x, startPosition.y);
      ctx.lineTo(endPosition.x, endPosition.y);
      break;
    case 'arrow':
      // Draw line part of the arrow
      ctx.moveTo(startPosition.x, startPosition.y);
      ctx.lineTo(endPosition.x, endPosition.y);
      // Draw arrowhead
      const headLength = 10; // length of head in pixels
      const angle = Math.atan2(
        endPosition.y - startPosition.y,
        endPosition.x - startPosition.x
      );
      ctx.lineTo(
        endPosition.x - headLength * Math.cos(angle - Math.PI / 6),
        endPosition.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(endPosition.x, endPosition.y);
      ctx.lineTo(
        endPosition.x - headLength * Math.cos(angle + Math.PI / 6),
        endPosition.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      break;
    case 'text':
      // Text drawing will be handled separately
      break;
    default:
      break;
  }
  ctx.stroke();
  ctx.closePath();
};
