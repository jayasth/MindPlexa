import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
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
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import modalStyles from '@/ui/Modal/Modal.module.css';
import addTableModalStyles from '@/ui/nodes/tableNode/styles/AddTableModal.module.css';
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
      className={addTableModalStyles.columnConfig}
    >
      <Input
        type="text"
        placeholder="Column Name"
        value={column.name}
        onChange={(value) => handleColumnChange(index, 'name', value)}
        variant="slim"
        className={addTableModalStyles.inputWide}
      />
      <Dropdown
        value={column.type}
        onChange={(value) => handleColumnChange(index, 'type', value)}
        variant="slim"
        className={addTableModalStyles.dropdownWide}
      >
        {validTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </Dropdown>
      <button
        onClick={() => handleDeleteColumn(index)}
        className={addTableModalStyles.deleteButton}
        title="Delete Column"
      >
        <FaTimes />
      </button>
      <div
        {...listeners}
        className={addTableModalStyles.dragHandle}
        title="Drag Column"
      >
        <MdDragIndicator />
      </div>
    </div>
  );
};

const AddTableModal = ({ onClose, onAddTable, hasExistingData, locale }) => {
  const [columns, setColumns] = useState<Column[]>([
    { id: uuidv4(), name: '', type: 'text' }
  ]);
  const [rows, setRows] = useState(1);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const handleAddColumn = () => {
    setColumns([...columns, { id: uuidv4(), name: '', type: 'text' }]);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    if (field === 'type' && !validTypes.some((type) => type.value === value)) {
      alert('Invalid type selected.');
      return;
    }
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleDeleteColumn = (index) => {
    const newColumns = columns.filter((_, colIndex) => colIndex !== index);
    setColumns(newColumns);
  };

  const handleAddTable = () => {
    if (hasExistingData) {
      setIsWarningOpen(true);
    } else {
      onAddTable(columns, rows, locale); // Pass locale to onAddTable
      onClose();
    }
  };

  const handleConfirmAddTable = () => {
    onAddTable(columns, rows, locale); // Pass locale to onAddTable
    onClose();
    setIsWarningOpen(false);
  };

  const handleRowsChange = (value) => {
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
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      center
      classNames={{ modal: modalStyles.customModal }}
    >
      <div className={`${modalStyles.modal} nodrag nowheel`}>
        <div className={modalStyles.modalContent}>
          <h2 className={modalStyles.modalHeader}>Add Table</h2>
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>Columns:</label>
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
            <Button variant="slim" onClick={handleAddColumn}>
              Add Column
            </Button>
          </div>
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>Rows:</label>
            <div className={addTableModalStyles.rowInputGroup}>
              <Input
                type="number"
                value={rows}
                onChange={handleRowsChange}
                min="1"
                max="1000"
                variant="slim"
                className={addTableModalStyles.inputNarrow}
              />
              <Button
                variant="submit"
                onClick={handleAddTable}
                className={addTableModalStyles.addButton}
              >
                Add Table
              </Button>
            </div>
          </div>
        </div>
        <Modal
          open={isWarningOpen}
          onClose={() => setIsWarningOpen(false)}
          center
        >
          <h2>Warning</h2>
          <p>This will override existing data. Continue?</p>
          <div className={modalStyles.actions}>
            <Button variant="submit" onClick={handleConfirmAddTable}>
              Yes
            </Button>
            <Button variant="cancel" onClick={() => setIsWarningOpen(false)}>
              No
            </Button>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

export default AddTableModal;
