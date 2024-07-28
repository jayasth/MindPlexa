import React from 'react';
import { Layer } from '../types';
import styles from './LayerPanel.module.css';
import { FaEye, FaEyeSlash, FaTrash, FaPlus } from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LayerPanelProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  addLayer: () => void;
  toggleLayerVisibility: (id: string) => void;
  deleteLayer: (id: string) => void;
}

const SortableLayer = ({
  layer,
  toggleVisibility,
  deleteLayer,
  setActiveLayerId,
  isActive
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`${styles.layer} ${isActive ? styles.active : ''} nodrag nowheel`}
      onClick={() => setActiveLayerId(layer.id)}
    >
      <div {...listeners} className={`${styles.dragHandle} nodrag`}>
        <MdDragIndicator size={12} />
      </div>
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
  );
};

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  setLayers,
  activeLayerId,
  setActiveLayerId,
  addLayer,
  toggleLayerVisibility,
  deleteLayer
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className={`${styles.layerPanel} nodrag nowheel`}>
      <div className={styles.layerHeader}>
        <h3>Layers</h3>
        <button
          className={`${styles.addLayerButton} nodrag`}
          onClick={addLayer}
        >
          <FaPlus size={8} />
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={layers} strategy={verticalListSortingStrategy}>
          <div className={`${styles.layerList} nodrag nowheel`}>
            {layers.map((layer) => (
              <SortableLayer
                key={layer.id}
                layer={layer}
                toggleVisibility={toggleLayerVisibility}
                deleteLayer={deleteLayer}
                setActiveLayerId={setActiveLayerId}
                isActive={layer.id === activeLayerId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default LayerPanel;
