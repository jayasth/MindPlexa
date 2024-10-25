import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useNodeStore, useUIStore } from '@/app/store';
import styles from './CalendarNodeView.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { FaEdit } from 'react-icons/fa';
import { CalendarEvent } from './eventTypes';

interface CalendarNodeViewProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    events?: CalendarEvent[];
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
  const { title, events, backgroundColor, textColor } = data;
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const isLoading = useUIStore((state) => state.isLoading);

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
        {isLoading ? (
          <span className={styles.loading}>Loading...</span>
        ) : events && events.length > 0 ? (
          <div className={styles.calendarPreview}>
            {/* existing calendar/events rendering */}
          </div>
        ) : (
          <span className={styles.noContent} style={{ color: textColor }}>
            Click edit to manage events
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
