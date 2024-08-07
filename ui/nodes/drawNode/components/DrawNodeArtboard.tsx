import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect
} from 'react';
import FixedSizeDrawingLayer, {
  FixedSizeDrawingLayerRef
} from './FixedSizeDrawingLayer';
import { ToolHandlers } from '../DrawNodeTools';
import { exportSVG } from '../utils/svgExport';
import styles from './DrawNodeArtboard.module.css';

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

const FIXED_WIDTH = 2000;
const FIXED_HEIGHT = 2000;

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
    const drawingLayerRef = useRef<FixedSizeDrawingLayerRef>(null);

    useEffect(() => {
      const newScale = Math.min(width / FIXED_WIDTH, height / FIXED_HEIGHT);
      setScale(newScale);
    }, [width, height]);

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
      <div className={styles.artboardWrapper} style={{ width, height }}>
        <div
          className={styles.scaleWrapper}
          style={{
            transform: `scale(${scale})`,
            width: FIXED_WIDTH,
            height: FIXED_HEIGHT
          }}
        >
          <FixedSizeDrawingLayer
            ref={drawingLayerRef}
            width={FIXED_WIDTH}
            height={FIXED_HEIGHT}
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
