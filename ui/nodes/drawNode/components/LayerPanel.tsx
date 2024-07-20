import React from 'react';
import { Layer } from '../types';
import styles from './LayerPanel.module.css';
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaLockOpen,
  FaTrash,
  FaPlus
} from 'react-icons/fa';

interface LayerPanelProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  setLayers,
  activeLayerId,
  setActiveLayerId
}) => {
  const addLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const toggleVisibility = (id: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const toggleLock = (id: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      )
    );
  };

  const deleteLayer = (id: string) => {
    if (layers.length > 1) {
      setLayers(layers.filter((layer) => layer.id !== id));
      if (activeLayerId === id) {
        setActiveLayerId(layers[layers.length - 2].id);
      }
    }
  };

  return (
    <div className={styles.layerPanel}>
      <button className={styles.addLayerButton} onClick={addLayer}>
        <FaPlus /> Add Layer
      </button>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`${styles.layer} ${layer.id === activeLayerId ? styles.active : ''}`}
          onClick={() => setActiveLayerId(layer.id)}
        >
          <span className={styles.layerName}>{layer.name}</span>
          <div className={styles.layerControls}>
            <button onClick={() => toggleVisibility(layer.id)}>
              {layer.visible ? <FaEye /> : <FaEyeSlash />}
            </button>
            <button onClick={() => toggleLock(layer.id)}>
              {layer.locked ? <FaLock /> : <FaLockOpen />}
            </button>
            <button onClick={() => deleteLayer(layer.id)}>
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayerPanel;
