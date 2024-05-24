import React from 'react';
import { FaBold, FaItalic, FaUnderline, FaSort } from 'react-icons/fa';
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
import styles from '@/ui/nodes/tableNode/TableNodeToolbar.module.css';

const iconSize = 16;

export const AddTableButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Table">
    <CiViewTable size={iconSize} />
  </button>
);

export const AddColumnButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Column">
    <MdOutlineViewColumn size={iconSize} />
  </button>
);

export const AddRowButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Add Row">
    <MdOutlineViewAgenda size={iconSize} />
  </button>
);

export const BoldButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Bold">
    <FaBold size={iconSize} />
  </button>
);

export const ItalicButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Italic">
    <FaItalic size={iconSize} />
  </button>
);

export const UnderlineButton = ({ onClick }) => (
  <button className={styles.actionButton} onClick={onClick} title="Underline">
    <FaUnderline size={iconSize} />
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
