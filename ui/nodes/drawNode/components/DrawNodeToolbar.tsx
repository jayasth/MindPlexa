import React, { useState } from 'react';
import {
  FaUndo,
  FaRedo,
  FaDownload,
  FaSearchPlus,
  FaSearchMinus,
  FaRuler,
  FaPencilAlt,
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan,
  FaSquare,
  FaCircle,
  FaDrawPolygon,
  FaLayerGroup,
  FaCog
} from 'react-icons/fa';
import { IoMdWater } from 'react-icons/io';
import { GrPaint } from 'react-icons/gr';
import { SketchPicker } from 'react-color';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import Slider from './DrawNodeSlider';
import styles from './DrawNodeToolbar.module.css';
import { Layer } from '../types';
import LayerPanel from './LayerPanel';

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
  backgroundColor: string;
  textColor: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  layers: Layer[];
  activeLayerId: string;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setActiveLayerId: (id: string) => void;
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
  clear,
  backgroundColor,
  textColor,
  onZoomIn,
  onZoomOut,
  layers,
  activeLayerId,
  setLayers,
  setActiveLayerId
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isStrokeWidthOpen, setIsStrokeWidthOpen] = useState(false);
  const [isLayerModalOpen, setIsLayerModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const iconSize = 16;

  const toolGroups = [
    { icon: FaPencilAlt, name: 'Pencil' },
    { icon: IoMdWater, name: 'Watercolor' },
    { icon: FaPaintBrush, name: 'Brush' },
    { icon: FaMarker, name: 'Marker' },
    { icon: FaSprayCan, name: 'Airbrush' },
    { icon: FaEraser, name: 'Eraser' },
    { icon: FaSquare, name: 'Square' },
    { icon: FaCircle, name: 'Circle' },
    { icon: FaDrawPolygon, name: 'Polygon' }
  ];

  return (
    <div className={styles.toolbarContainer} style={{ backgroundColor }}>
      <div className={styles.verticalToolbar}>
        {toolGroups.map((tool, index) => (
          <Tooltip key={tool.name} content={tool.name}>
            <button
              className={`${styles.toolbarButton} ${currentTool === index ? styles.selected : ''}`}
              onClick={() => setCurrentTool(index)}
              style={{ color: textColor }}
            >
              <tool.icon size={iconSize} />
            </button>
          </Tooltip>
        ))}
        <Tooltip content="Change Color">
          <button
            className={`${styles.toolbarButton} ${styles.colorPickerButton}`}
            onClick={() => setIsColorPickerOpen(true)}
          >
            <GrPaint size={iconSize} color={color} />
          </button>
        </Tooltip>
        <Tooltip content="Change Stroke Width">
          <button
            className={`${styles.toolbarButton} ${styles.sizePickerButton}`}
            onClick={() => setIsStrokeWidthOpen(true)}
          >
            <FaRuler size={iconSize} color={textColor} />
          </button>
        </Tooltip>
        <Tooltip content="Layers">
          <button
            className={`${styles.toolbarButton}`}
            onClick={() => setIsLayerModalOpen(true)}
          >
            <FaLayerGroup size={iconSize} color={textColor} />
          </button>
        </Tooltip>
        <Tooltip content="Settings">
          <button
            className={`${styles.toolbarButton}`}
            onClick={() => setIsSettingsOpen(true)}
          >
            <FaCog size={iconSize} color={textColor} />
          </button>
        </Tooltip>
      </div>
      <div className={styles.horizontalToolbar}>
        <Tooltip content="Undo">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={styles.toolbarButton}
          >
            <FaUndo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Redo">
          <button
            onClick={redo}
            disabled={!canRedo}
            className={styles.toolbarButton}
          >
            <FaRedo size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Clear">
          <button onClick={clear} className={styles.toolbarButton}>
            <FaEraser size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Download">
          <button onClick={download} className={styles.toolbarButton}>
            <FaDownload size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Zoom In">
          <button onClick={onZoomIn} className={styles.toolbarButton}>
            <FaSearchPlus size={iconSize} />
          </button>
        </Tooltip>
        <Tooltip content="Zoom Out">
          <button onClick={onZoomOut} className={styles.toolbarButton}>
            <FaSearchMinus size={iconSize} />
          </button>
        </Tooltip>
      </div>
      <Modal
        open={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        center
      >
        <h2>Change Drawing Color</h2>
        <SketchPicker
          color={color}
          onChange={(newColor) => setColor(newColor.hex)}
        />
      </Modal>
      <Modal
        open={isStrokeWidthOpen}
        onClose={() => setIsStrokeWidthOpen(false)}
        center
      >
        <h2>Change Stroke Width</h2>
        <Slider
          min={1}
          max={100}
          value={strokeWidth}
          onChange={setStrokeWidth}
        />
      </Modal>
      <Modal
        open={isLayerModalOpen}
        onClose={() => setIsLayerModalOpen(false)}
        center
      >
        <h2>Layers</h2>
        <LayerPanel
          layers={layers}
          setLayers={setLayers}
          activeLayerId={activeLayerId}
          setActiveLayerId={setActiveLayerId}
        />
      </Modal>
      <Modal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        center
      >
        <h2>Settings</h2>
        {/* Add settings content here */}
      </Modal>
    </div>
  );
};

export default DrawNodeToolbar;
