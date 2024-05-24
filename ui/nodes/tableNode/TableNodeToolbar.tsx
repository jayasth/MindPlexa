import React from 'react';
import {
  FaPlus,
  FaFileImport,
  FaFileExport,
  FaTable,
  FaThList,
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaSort,
  FaFilter
} from 'react-icons/fa';
import styles from '@/ui/nodes/tableNode/TableNodeToolbar.module.css';

export const AddColumnButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Column">
    <FaTable size={16} />
  </button>
);

export const AddRowButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Row">
    <FaThList size={16} />
  </button>
);

export const ExportButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Export Table"
  >
    <FaFileExport size={16} />
  </button>
);

export const ImportButton = ({ onChange }) => (
  <label className={styles.actionButton} title="Import Table">
    <FaFileImport size={16} />
    <input type="file" className={styles.fileInput} onChange={onChange} />
  </label>
);

export const BoldButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Bold">
    <FaBold size={16} />
  </button>
);

export const ItalicButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Italic">
    <FaItalic size={16} />
  </button>
);

export const UnderlineButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Underline">
    <FaUnderline size={16} />
  </button>
);

export const AlignLeftButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Align Left">
    <FaAlignLeft size={16} />
  </button>
);

export const AlignCenterButton = ({ onClick }) => (
  <button
    className={styles.actionButton}
    onClick={onClick}
    title="Align Center"
  >
    <FaAlignCenter size={16} />
  </button>
);

export const AlignRightButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Align Right">
    <FaAlignRight size={16} />
  </button>
);

export const SortButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Sort">
    <FaSort size={16} />
  </button>
);

export const FilterButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Filter">
    <FaFilter size={16} />
  </button>
);
