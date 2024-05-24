import React from 'react';
import styles from './TableContent.module.css';

interface TableContentProps {
  tableData: any[];
  setTableData: (data: any[]) => void;
}

const TableContent: React.FC<TableContentProps> = ({
  tableData,
  setTableData
}) => {
  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const updatedTableData = [...tableData];
    updatedTableData[rowIndex][colIndex] = value;
    setTableData(updatedTableData);
  };

  return (
    <table className={styles.table}>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, colIndex) => (
              <td key={colIndex} className={styles.tableCell}>
                <input
                  type="text"
                  value={cell}
                  onChange={(e) =>
                    handleCellChange(rowIndex, colIndex, e.target.value)
                  }
                  className={styles.cellInput}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableContent;
