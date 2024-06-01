import React from 'react';
import { FaUndo, FaRedo, FaDownload, FaTrash } from 'react-icons/fa';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Slider from './DrawNodeSlider';
import toolbarStyles from '@/ui/nodes/drawNode/components/DrawNodeToolbar.module.css';
import Input from '@/ui/Input/Input';

interface DrawNodeToolbarProps {
  tools: Array<[any, any, number]>;
  currentTool: number;
  setCurrentTool: (index: number) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  download: () => void;
  clear: () => void;
}

const DrawNodeToolbar: React.FC<DrawNodeToolbarProps> = ({
  tools,
  currentTool,
  setCurrentTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  undo,
  redo,
  canUndo,
  canRedo,
  download,
  clear
}) => {
  const [colorOpen, setColorOpen] = React.useState(false);
  const [sizeOpen, setSizeOpen] = React.useState(false);
  const colorPickerRef = React.useRef<HTMLDivElement>(null);
  const sizePickerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className={toolbarStyles.toolbar}>
      <div className={toolbarStyles.toolbarSection}>
        {tools.map(([tool, Icon], index) => (
          <button
            aria-label={tool.name}
            key={tool.name}
            title={tool.name}
            className={toolbarStyles.toolbarButton}
            style={{
              backgroundColor: currentTool === index ? '#aaaaff' : '#eeeeee'
            }}
            onClick={() => setCurrentTool(index)}
          >
            {<Icon size={14} title={tool.name} />}
          </button>
        ))}
        <label className={toolbarStyles.toolbarLabel}>
          Color:
          <button
            onClick={() => setColorOpen(!colorOpen)}
            style={{
              backgroundColor: color,
              width: 50,
              border: '2px gray solid',
              color: 'transparent'
            }}
          >
            Color
          </button>
          <Modal open={colorOpen} onClose={() => setColorOpen(false)} center>
            <div ref={colorPickerRef} style={{ padding: '20px' }}>
              <HexColorPicker color={color} onChange={setColor} />
              <Input
                className={toolbarStyles.input}
                variant="slim"
                value={color}
                onChange={setColor}
              />
            </div>
          </Modal>
        </label>
        <label className={toolbarStyles.toolbarLabel}>
          Size:
          <button onClick={() => setSizeOpen(!sizeOpen)}>{strokeWidth}</button>
          <Modal open={sizeOpen} onClose={() => setSizeOpen(false)} center>
            <div
              ref={sizePickerRef}
              style={{
                width: 150,
                padding: '30px 20px 10px 20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Slider
                min={1}
                max={100}
                value={strokeWidth}
                onChange={setStrokeWidth}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: 150,
                  justifyContent: 'center',
                  flexDirection: 'column',
                  display: 'flex',
                  placeItems: 'center'
                }}
              >
                <div
                  style={{
                    width: strokeWidth,
                    height: strokeWidth,
                    backgroundColor: color,
                    borderRadius: strokeWidth
                  }}
                ></div>
              </div>
            </div>
          </Modal>
        </label>
        <button
          onClick={undo}
          disabled={!canUndo}
          className={toolbarStyles.toolbarButton}
        >
          <FaUndo size={12} title="Undo" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={toolbarStyles.toolbarButton}
        >
          <FaRedo title="Redo" />
        </button>
        <button onClick={download} className={toolbarStyles.toolbarButton}>
          <FaDownload title="Download" />
        </button>
        <button onClick={clear} className={toolbarStyles.toolbarButton}>
          <FaTrash title="Clear" />
        </button>
      </div>
    </div>
  );
};

export default DrawNodeToolbar;
