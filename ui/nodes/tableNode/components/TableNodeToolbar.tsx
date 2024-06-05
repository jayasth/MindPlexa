import React from 'react';
import { FaSort } from 'react-icons/fa';
import { FcDeleteDatabase } from 'react-icons/fc';
import { MdOutlineViewColumn, MdOutlineViewAgenda } from 'react-icons/md';
import {
  CiImport,
  CiExport,
  CiViewTable,
  CiFilter,
  CiTextAlignCenter,
  CiTextAlignLeft,
  CiTextAlignRight
} from 'react-icons/ci';
import styles from '@/ui/nodes/tableNode/styles/TableNodeToolbar.module.css';

const iconSize = 16;

export const AddTableButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Table">
    <CiViewTable size={iconSize} />
  </button>
);

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

export const ExportButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Export Table"
  >
    <CiExport size={iconSize} />
  </button>
);

export const ImportButton = ({ onChange }) => (
  <label className={styles.actionButton} title="Import Table">
    <CiImport size={iconSize} />
    <input type="file" className={styles.fileInput} onChange={onChange} />
  </label>
);
