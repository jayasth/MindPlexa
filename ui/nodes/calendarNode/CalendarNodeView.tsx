import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CalendarNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';

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
  const { title, events, id, backgroundColor, textColor } = data;
  const toggleEditMode = useStore((state) => state.toggleEditMode);

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
