import React from 'react';
import styles from './TableToolbar.module.css';
import { addRow, addColumn, deleteRow, deleteColumn } from './TableFunctions';
import { useStore } from '@/app/store/useCanvasStore';
import { FaPlusSquare, FaMinusSquare } from 'react-icons/fa';

interface TableToolbarProps {
  nodeId: string;
}

const TableToolbar: React.FC<TableToolbarProps> = ({ nodeId }) => {
  const { nodes } = useStore.getState();
  const node = nodes.find((n) => n.id === nodeId);
  const tableData = node?.data.tableData || [];

  return (
    <div className={styles.toolbar}>
      <button
        className={styles.iconButton}
        onClick={() => addRow(nodeId)}
        title="Add Row"
      >
        <FaPlusSquare />
      </button>
      <button
        className={styles.iconButton}
        onClick={() => addColumn(nodeId)}
        title="Add Column"
      >
        <FaPlusSquare />
      </button>
      <button
        className={styles.iconButton}
        onClick={() => deleteRow(nodeId, tableData.length - 1)}
        title="Delete Row"
      >
        <FaMinusSquare />
      </button>
      <button
        className={styles.iconButton}
        onClick={() => deleteColumn(nodeId, tableData[0]?.length - 1)}
        title="Delete Column"
      >
        <FaMinusSquare />
      </button>
    </div>
  );
};

export default TableToolbar;
