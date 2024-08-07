import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback
} from 'react';
import FixedSizeDrawingLayer, {
  FixedSizeDrawingLayerRef
} from './FixedSizeDrawingLayer';
import { ToolHandlers } from '../DrawNodeTools';
import { exportSVG } from '../utils/svgExport';

interface ArtboardProps {
  tool: ToolHandlers;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  onContentChange: (newContent: string) => void;
  content?: string;
}

export interface ArtboardRef {
  download: (filename?: string, type?: string) => void;
  getImageAsDataUri: (type?: string) => string | undefined;
  getImageAsSVG: () => string;
  clear: () => void;
  canvas: HTMLCanvasElement | null;
}

const Artboard = forwardRef<ArtboardRef, ArtboardProps>(
  (
    {
      tool,
      width,
      height,
      color,
      strokeWidth,
      opacity,
      onContentChange,
      content
    },
    ref
  ) => {
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const drawingLayerRef = useRef<FixedSizeDrawingLayerRef>(null);

    const originalWidth = 1000; // Set a fixed original width
    const originalHeight = 1000; // Set a fixed original height

    const handleContentChange = useCallback(
      (newContent: string) => {
        onContentChange(newContent);
      },
      [onContentChange]
    );

    useImperativeHandle(ref, () => ({
      download: (filename = 'image.png', type?: string) => {
        const dataUrl = drawingLayerRef.current?.getImageAsDataUri(type);
        if (dataUrl) {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = filename;
          a.click();
        }
      },
      getImageAsDataUri: (type?: string) =>
        drawingLayerRef.current?.getImageAsDataUri(type),
      getImageAsSVG: () => drawingLayerRef.current?.getImageAsSVG() || '',
      clear: () => drawingLayerRef.current?.clear(),
      get canvas() {
        return drawingLayerRef.current?.canvas || null;
      }
    }));

    return (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0'
          }}
        >
          <FixedSizeDrawingLayer
            ref={drawingLayerRef}
            width={originalWidth}
            height={originalHeight}
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
            onContentChange={handleContentChange}
            content={content}
          />
        </div>
      </div>
    );
  }
);

export default Artboard;
