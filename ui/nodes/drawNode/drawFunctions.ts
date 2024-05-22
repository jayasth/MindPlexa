import React from 'react';

export const startDrawing = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  setContent: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.beginPath();
  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  setContent((prevContent) => [
    ...prevContent,
    { type: 'start', x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
  ]);
};

export const draw = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  setContent: React.Dispatch<React.SetStateAction<any[]>>
) => {
  if (e.buttons !== 1) return;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  ctx.stroke();
  setContent((prevContent) => [
    ...prevContent,
    { type: 'draw', x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
  ]);
};

export const stopDrawing = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.closePath();
};
