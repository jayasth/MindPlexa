import React from 'react';
import { Layer } from '../types';
import styles from './LayerPanel.module.css';
import { FaEye, FaEyeSlash, FaTrash, FaPlus } from 'react-icons/fa';

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
      visible: true
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
      <div className={styles.layerHeader}>
        <h3>Layers</h3>
        <button className={styles.addLayerButton} onClick={addLayer}>
          <FaPlus size={8} />
        </button>
      </div>
      <div className={styles.layerList}>
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`${styles.layer} ${layer.id === activeLayerId ? styles.active : ''}`}
            onClick={() => setActiveLayerId(layer.id)}
          >
            <button
              className={styles.visibilityButton}
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(layer.id);
              }}
            >
              {layer.visible ? <FaEye size={8} /> : <FaEyeSlash size={8} />}
            </button>
            <span className={styles.layerName}>{layer.name}</span>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                deleteLayer(layer.id);
              }}
            >
              <FaTrash size={8} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;
