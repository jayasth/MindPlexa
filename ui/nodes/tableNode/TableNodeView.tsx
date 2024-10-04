import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useNodeStore, useUIStore } from '@/app/store';
import styles from '@/ui/nodes/tableNode/styles/TableNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { getNodeSpecificData } from '@/utils/canvas/nodeSpecificDataService';
import { Column, Row } from '@/ui/nodes/tableNode/utils/TableFunctions';

interface TableNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    content?: {
      columns: Column[];
      rows: Row[];
    };
    backgroundColor?: string;
    textColor?: string;
    columns?: Column[];
    rows?: Row[];
  };
  width: number;
  height: number;
}

const TableNodeView: React.FC<TableNodeViewProps> = ({
  data,
  width,
  height
}) => {
  const { id, backgroundColor, textColor } = data;
  const [title, setTitle] = useState<string>(data.title || 'Untitled Table');
  const [content, setContent] = useState<{ columns: Column[]; rows: Row[] }>({
    columns: data.columns || [],
    rows: data.rows || []
  });
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const isLoading = useUIStore((state) => state.isLoading);

  useEffect(() => {
    const fetchNodeData = async () => {
      const nodeData = await getNodeSpecificData(id, 'table');
      if (nodeData) {
        setTitle((nodeData.title as string) || 'Untitled Table');
        setContent({
          columns: Array.isArray(nodeData.columns)
            ? (nodeData.columns as Column[])
            : [],
          rows: Array.isArray(nodeData.rows) ? (nodeData.rows as Row[]) : []
        });
      }
    };

    if (!data.columns || !data.rows) {
      fetchNodeData();
    }
  }, [id, data.columns, data.rows]);

  useEffect(() => {
    setContent({
      columns: data.columns || [],
      rows: data.rows || []
    });
  }, [data.columns, data.rows]);

  console.log(
    `TableNodeView: backgroundColor = ${backgroundColor}, textColor = ${textColor}, columns = ${JSON.stringify(content.columns)}, rows = ${JSON.stringify(content.rows)}`
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={styles.tableNode}
      style={{ width, height, backgroundColor }}
    >
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title}
        </div>
        <div
          className={styles.editButton}
          style={{ color: textColor }}
          onClick={() => toggleEditMode(id)}
        >
          <FaEdit />
        </div>
      </div>
      <div className={styles.contentPreview} style={{ color: textColor }}>
        {content.columns.length > 0 && content.rows.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  {content.columns.map((col, index) => (
                    <th key={index}>{col.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.rows.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {content.columns.map((col, colIndex) => (
                      <td key={colIndex}>
                        {typeof row[col.field] === 'object' &&
                        row[col.field] instanceof Date
                          ? row[col.field]?.toString()
                          : row[col.field]?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <span className={styles.noContent} style={{ color: textColor }}>
            No content available
          </span>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleTop}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default TableNodeView;
