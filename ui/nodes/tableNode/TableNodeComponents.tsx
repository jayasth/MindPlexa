import React from 'react';
import {
  FaPlus,
  FaFileImport,
  FaFileExport,
  FaTable,
  FaThList
} from 'react-icons/fa';
import styles from './TableNodeComponents.module.css';

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
