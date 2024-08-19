import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useNodeStore, useUIStore } from '@/app/store';
import styles from '@/ui/nodes/tableNode/styles/TableNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { getNodeSpecificData } from '@/utils/canvas/nodeSpecificDataService';

interface TableNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    content?: any;
    backgroundColor?: string;
    textColor?: string;
    columns?: any[];
    rows?: any[];
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
  const [title, setTitle] = useState(data.title || 'Untitled Table');
  const [content, setContent] = useState<{ columns: any[]; rows: any[] }>({
    columns: data.columns || [],
    rows: data.rows || []
  });
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const isLoading = useUIStore((state) => state.isLoading);

  useEffect(() => {
    const fetchNodeData = async () => {
      const nodeData = await getNodeSpecificData(id, 'table');
      if (nodeData) {
        setTitle(nodeData.title || 'Untitled Table');
        setContent({
          columns: Array.isArray(nodeData.columns) ? nodeData.columns : [],
          rows: Array.isArray(nodeData.rows) ? nodeData.rows : []
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
          <table>
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
                    <td key={colIndex}>{row[col.field]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
