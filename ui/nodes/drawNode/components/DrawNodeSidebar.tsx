import React, { useState } from 'react';
import {
  FaPencilAlt,
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan,
  FaSquare,
  FaCircle,
  FaDrawPolygon,
  FaRuler,
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
import styles from './DrawNodeSidebar.module.css';
import LayerPanel from './LayerPanel';
import { Layer } from '../types';

interface DrawNodeSidebarProps {
  currentTool: number;
  setCurrentTool: (index: number) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  backgroundColor: string;
  textColor: string;
  layers: Layer[];
  activeLayerId: string;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setActiveLayerId: (id: string) => void;
}

const DrawNodeSidebar: React.FC<DrawNodeSidebarProps> = ({
  currentTool,
  setCurrentTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  backgroundColor,
  textColor,
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
    [
      { icon: FaPencilAlt, name: 'Pencil' },
      { icon: IoMdWater, name: 'Watercolor' },
      { icon: FaPaintBrush, name: 'Brush' },
      { icon: FaMarker, name: 'Marker' },
      { icon: FaSprayCan, name: 'Airbrush' },
      { icon: FaEraser, name: 'Eraser' }
    ],
    [
      { icon: FaSquare, name: 'Square' },
      { icon: FaCircle, name: 'Circle' },
      { icon: FaDrawPolygon, name: 'Polygon' }
    ]
  ];

  return (
    <div className={styles.sidebar} style={{ backgroundColor }}>
      {toolGroups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.toolGroup}>
          {group.map((tool, index) => (
            <Tooltip key={tool.name} content={tool.name}>
              <button
                className={`${styles.toolbarButton} ${
                  currentTool === index + (groupIndex === 1 ? 6 : 0)
                    ? styles.selected
                    : ''
                }`}
                onClick={() =>
                  setCurrentTool(index + (groupIndex === 1 ? 6 : 0))
                }
                style={{ color: textColor }}
              >
                <tool.icon size={iconSize} />
              </button>
            </Tooltip>
          ))}
        </div>
      ))}
      <div className={styles.toolGroup}>
        <Tooltip content="Change Color">
          <button
            className={`${styles.toolbarButton} ${styles.colorPickerButton}`}
            onClick={() => setIsColorPickerOpen(true)}
          >
            <div
              className={styles.colorPreview}
              style={{ backgroundColor: color }}
            />
          </button>
        </Tooltip>
        <Tooltip content="Change Stroke Width">
          <button
            className={`${styles.toolbarButton} ${styles.sizePickerButton}`}
            onClick={() => setIsStrokeWidthOpen(true)}
          >
            <FaRuler size={iconSize} color={textColor} />
            <span className={styles.strokeWidthLabel}>{strokeWidth}</span>
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

export default DrawNodeSidebar;
