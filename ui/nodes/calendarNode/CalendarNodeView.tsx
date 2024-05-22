import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CalendarNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';

interface CalendarNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    events?: any[];
    backgroundColor?: string;
    textColor?: string;
  };
  width: number;
  height: number;
}

const CalendarNodeView: React.FC<CalendarNodeViewProps> = ({
  data,
  width,
  height
}) => {
  const { title, events, id, backgroundColor } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const updateNode = useStore((state) => state.updateNode);

  const [textColor, setTextColor] = useState(
    data.textColor || getContrastYIQ(backgroundColor || '#F4F4F4')
  );

  // Ensure text color is updated based on the latest background color
  useEffect(() => {
    const newTextColor = getContrastYIQ(backgroundColor || '#F4F4F4');
    if (textColor !== newTextColor) {
      setTextColor(newTextColor);
      updateNode(id, { data: { ...data, textColor: newTextColor } });
    }
  }, [backgroundColor, textColor, id, updateNode, data]);

  return (
    <div
      className={styles.calendarNode}
      style={{ width, height, backgroundColor }}
    >
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          {title || 'Untitled Calendar'}
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
        {events && events.length > 0 ? (
          <ul>
            {events.map((event, index) => (
              <li key={index}>{event.title}</li>
            ))}
          </ul>
        ) : (
          <span className={styles.noContent} style={{ color: textColor }}>
            No events available
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

export default CalendarNodeView;
