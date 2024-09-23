import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/ui/Modal/Modal';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from '../styles/AddTableModal.module.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTimes } from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';

interface Column {
  id: string;
  name: string;
  type: string;
  cellEditorParams?: { options: string[] };
}

const validTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'currency', label: 'Currency' }
];

const SortableItem = ({
  id,
  column,
  index,
  handleColumnChange,
  handleDeleteColumn
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={styles.columnConfig}
    >
      <Input
        type="text"
        placeholder="Column Name"
        value={column.name}
        onChange={(value) => handleColumnChange(index, 'name', value)}
        variant="slim"
        className={styles.inputWide}
      />
      <Dropdown
        value={column.type}
        onChange={(value) => handleColumnChange(index, 'type', value)}
        variant="slim"
        className={styles.dropdownWide}
      >
        {validTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </Dropdown>
      <button
        onClick={() => handleDeleteColumn(index)}
        className={styles.deleteButton}
        title="Delete Column"
      >
        <FaTimes />
      </button>
      <div {...listeners} className={styles.dragHandle} title="Drag Column">
        <MdDragIndicator />
      </div>
    </div>
  );
};

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (columns: Column[], rows: number) => void;
  hasExistingData: boolean;
}

const AddTableModal: React.FC<AddTableModalProps> = ({
  isOpen,
  onClose,
  onAddTable,
  hasExistingData
}) => {
  const [columns, setColumns] = useState<Column[]>([
    { id: uuidv4(), name: '', type: 'text' }
  ]);
  const [rows, setRows] = useState(1);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  useEffect(() => {
    console.log('Modal opened, initializing state');
    setColumns([{ id: uuidv4(), name: '', type: 'text' }]);
    setRows(1);
  }, [isOpen]);

  const handleAddColumn = () => {
    console.log('Adding a new column');
    setColumns([...columns, { id: uuidv4(), name: '', type: 'text' }]);
  };

  const handleColumnChange = (index, field, value) => {
    console.log(
      `Changing column at index ${index}, field: ${field}, value: ${value}`
    );
    const newColumns = [...columns];
    if (field === 'type' && !validTypes.some((type) => type.value === value)) {
      alert('Invalid type selected.');
      return;
    }
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleDeleteColumn = (index) => {
    console.log(`Deleting column at index ${index}`);
    const newColumns = columns.filter((_, colIndex) => colIndex !== index);
    setColumns(newColumns);
  };

  const handleAddTable = () => {
    console.log('Submitting table:', columns, rows);
    if (hasExistingData) {
      setIsWarningOpen(true);
    } else {
      onAddTable(columns, rows);
    }
  };

  const handleConfirmAddTable = () => {
    console.log('Confirming add table');
    onAddTable(columns, rows);
    onClose();
    setIsWarningOpen(false);
  };

  const handleRowsChange = (value) => {
    console.log(`Changing rows to ${value}`);
    setRows(parseInt(value, 10));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      console.log(`Dragging column from ${active.id} to ${over.id}`);
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AddTableModal: Submitting form', { columns, rows });
    onAddTable(columns, rows);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Table">
      <div className={styles.columnList}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns}
            strategy={verticalListSortingStrategy}
          >
            {columns.map((col, index) => (
              <SortableItem
                key={col.id}
                id={col.id}
                column={col}
                index={index}
                handleColumnChange={handleColumnChange}
                handleDeleteColumn={handleDeleteColumn}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <Button variant="slim" onClick={handleAddColumn}>
        Add Column
      </Button>
      <div className={styles.rowInput}>
        <label htmlFor="rows">Rows:</label>
        <Input
          id="rows"
          type="number"
          value={rows}
          onChange={handleRowsChange}
          min="1"
          max="1000"
          variant="slim"
        />
      </div>
      <Button variant="submit" onClick={handleSubmit}>
        Add Table
      </Button>
      {isWarningOpen && (
        <Modal
          isOpen={isWarningOpen}
          onClose={() => setIsWarningOpen(false)}
          title="Warning"
        >
          <p>This will override existing data. Continue?</p>
          <div className={styles.actions}>
            <Button variant="submit" onClick={handleConfirmAddTable}>
              Yes
            </Button>
            <Button variant="cancel" onClick={() => setIsWarningOpen(false)}>
              No
            </Button>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default AddTableModal;
