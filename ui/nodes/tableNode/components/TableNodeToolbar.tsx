import React, { useState } from 'react';
import { FaSort } from 'react-icons/fa';
import { FcDeleteDatabase } from 'react-icons/fc';
import { MdOutlineViewColumn, MdOutlineViewAgenda } from 'react-icons/md';
import {
  CiViewTable,
  CiFilter,
  CiTextAlignCenter,
  CiTextAlignLeft,
  CiTextAlignRight,
  CiSettings
} from 'react-icons/ci';
import { RiImportFill, RiExportFill } from 'react-icons/ri';
import styles from '@/ui/nodes/tableNode/styles/TableNodeToolbar.module.css';
import ConfirmationModal from '@/ui/nodes/tableNode/components/ConfirmationModal';
import AddTableModal from '@/ui/nodes/tableNode/components/AddTableModal';

const iconSize = 16;

export const AddTableButton = ({ onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTable = (columns, rows) => {
    onClick(columns, rows);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className={styles.actionButton}
        onClick={() => setIsModalOpen(true)}
        title="Add Table"
      >
        <CiViewTable size={iconSize} />
      </button>
      <AddTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTable={handleAddTable}
        hasExistingData={false}
      />
    </>
  );
};

export const AddColumnButton = ({ onClick }) => {
  const columnType = 'text';

  return (
    <div className={styles.addColumnContainer}>
      <button
        className={styles.actionButton}
        onClick={() => onClick(columnType)}
        title="Add Column"
      >
        <MdOutlineViewColumn size={iconSize} />
      </button>
    </div>
  );
};

export const AddRowButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Row">
    <MdOutlineViewAgenda size={iconSize} />
  </button>
);

export const AlignLeftButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Align Left">
    <CiTextAlignLeft size={iconSize} />
  </button>
);

export const AlignCenterButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Align Center"
  >
    <CiTextAlignCenter size={iconSize} />
  </button>
);

export const AlignRightButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Align Right">
    <CiTextAlignRight size={iconSize} />
  </button>
);

export const SortButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Sort">
    <FaSort size={iconSize} />
  </button>
);

export const FilterButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Filter">
    <CiFilter size={iconSize} />
  </button>
);

export const DeleteTableButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Delete Table"
  >
    <FcDeleteDatabase size={iconSize} />
  </button>
);

export const ImportButton = ({ onChange, content, setContent }) => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [fileEvent, setFileEvent] = useState(null);

  const handleImport = (event) => {
    if (content.columns.length > 0 || content.rows.length > 0) {
      setFileEvent(event);
      setIsWarningOpen(true);
    } else {
      onChange(event);
    }
  };

  const handleConfirmImport = () => {
    onChange(fileEvent);
    setIsWarningOpen(false);
  };

  return (
    <>
      <label className={styles.actionButton} title="Import Table">
        <RiImportFill size={iconSize} />
        <input
          type="file"
          className={styles.fileInput}
          onChange={handleImport}
        />
      </label>
      <ConfirmationModal
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        onConfirm={handleConfirmImport}
        message="This will override existing data. Continue?"
      />
    </>
  );
};

export const ExportButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Export Table"
  >
    <RiExportFill size={iconSize} />
  </button>
);

export const SettingsButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Settings">
    <CiSettings size={iconSize} />
  </button>
);
