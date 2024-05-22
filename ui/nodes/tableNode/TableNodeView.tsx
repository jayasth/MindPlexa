import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './TableNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';

interface TableNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    content?: any;
    backgroundColor?: string;
    textColor?: string;
  };
  width: number;
  height: number;
}

const TableNodeView: React.FC<TableNodeViewProps> = ({
  data,
  width,
  height
}) => {
  const { title, content, id, backgroundColor } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const updateNode = useStore((state) => state.updateNode);

  const [textColor, setTextColor] = useState(
    data.textColor || getContrastYIQ(backgroundColor || '#F4F4F4')
  );

  useEffect(() => {
    const newTextColor = getContrastYIQ(backgroundColor || '#F4F4F4');
    if (textColor !== newTextColor) {
      setTextColor(newTextColor);
      updateNode(id, { data: { ...data, textColor: newTextColor } });
    }
  }, [backgroundColor, textColor, id, updateNode, data]);

  return (
    <div
      className={styles.tableNode}
      style={{ width, height, backgroundColor }}
    >
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title || 'Untitled Table'}
        </div>
        <div
          className={styles.editButton}
          style={{ color: textColor }}
          onClick={() => toggleEditMode(data.id)}
        >
          <FaEdit />
        </div>
      </div>
      <div className={styles.contentPreview} style={{ color: textColor }}>
        {/* Render a simple table preview */}
        {content ? (
          <table>
            <thead>
              <tr>
                {content.columns.map((col, index) => (
                  <th key={index}>{col.headerName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, rowIndex) => (
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
