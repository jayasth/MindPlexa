import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';
import { useDrawing } from './drawLogic';
import styles from './DrawingCanvas.module.css';
import Konva from 'konva';
import { useStore } from '@/app/store/useCanvasStore';

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

interface DrawingCanvasProps {
  width: number;
  height: number;
  initialContent: Shape[];
  stageRef: React.RefObject<Konva.Stage>;
  tool: string;
  currentColor: string;
  currentStrokeWidth: number;
  onMouseDown: (
    e: any,
    tool: string,
    color: string,
    strokeWidth: number
  ) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: (e: any) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  initialContent,
  stageRef,
  tool,
  currentColor,
  currentStrokeWidth,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) => {
  const [content, setContent] = useState<Shape[]>(initialContent);
  const { setTool } = useDrawing(content);

  const storeContent = useStore(
    (state) =>
      state.nodes.find((node) => node.id === stageRef.current?.attrs.id)?.data
        .content
  );

  useEffect(() => {
    if (storeContent) {
      setContent(storeContent);
    }
  }, [storeContent]);

  useEffect(() => {
    setTool(tool);
  }, [tool, setTool]);

  return (
    <div className={styles.canvasContainer}>
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onMouseDown={(e) =>
          onMouseDown(e, tool, currentColor, currentStrokeWidth)
        }
        onMouseMove={(e) => onMouseMove(e)}
        onMouseUp={(e) => onMouseUp(e)}
        className={`nodrag nowheel ${styles.canvas}`}
      >
        <Layer>
          {content.map((shape, i) => {
            switch (shape.tool) {
              case 'marker':
              case 'eraser':
                return (
                  <Line
                    key={i}
                    points={shape.points}
                    stroke={shape.tool === 'eraser' ? 'white' : currentColor}
                    strokeWidth={currentStrokeWidth}
                    globalCompositeOperation={
                      shape.tool === 'eraser'
                        ? 'destination-out'
                        : 'source-over'
                    }
                  />
                );
              case 'rectangle':
                return (
                  <Rect
                    key={i}
                    x={shape.points[0]}
                    y={shape.points[1]}
                    width={shape.points[2] - shape.points[0]}
                    height={shape.points[3] - shape.points[1]}
                    stroke={currentColor}
                    strokeWidth={currentStrokeWidth}
                    fill={shape.fill}
                  />
                );
              case 'circle':
                const radius = Math.sqrt(
                  Math.pow(shape.points[2] - shape.points[0], 2) +
                    Math.pow(shape.points[3] - shape.points[1], 2)
                );
                return (
                  <Circle
                    key={i}
                    x={shape.points[0]}
                    y={shape.points[1]}
                    radius={radius}
                    stroke={currentColor}
                    strokeWidth={currentStrokeWidth}
                    fill={shape.fill}
                  />
                );
              case 'text':
                return (
                  <Text
                    key={i}
                    text={shape.text}
                    x={shape.x}
                    y={shape.y}
                    fontSize={shape.fontSize}
                    fontFamily={shape.fontFamily}
                    fill={shape.fill}
                  />
                );
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;
