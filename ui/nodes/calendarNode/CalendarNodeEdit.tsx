import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import {
  Calendar,
  momentLocalizer,
  Views,
  DateLocalizer
} from 'react-big-calendar';
import { navigate } from 'react-big-calendar/lib/utils/dates';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CalendarNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton,
  DuplicateButton
} from '@/ui/nodes/CommonNodeComponents';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  handleChangeColorWithCombination,
  handleAddTag,
  handleAttachFile,
  handleDuplicate,
  getContrastYIQ,
  colorCombinations
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import { CompactPicker } from 'react-color';
import EventModal from '@/ui/nodes/calendarNode/EventModal';
import CalendarToolbar from '@/ui/nodes/calendarNode/CalendarToolbar';

const localizer = momentLocalizer(moment);

interface CalendarNodeEditProps extends NodeProps {
  data: {
    id: string;
    events?: any[];
    title?: string;
    backgroundColor?: string;
    textColor?: string;
    view?: string;
  };
  width: number;
  height: number;
  selected: boolean;
  onNodeResizeStop: (
    nodeId: string,
    newSize: { width: number; height: number },
    newPosition: { x: number; y: number }
  ) => void;
  position: { x: number; y: number };
}

const CalendarNodeEdit: React.FC<CalendarNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Calendar');
  const [events, setEvents] = useState(data.events || []);
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [view, setView] = useState(data.view || 'month');
  const [newEvent, setNewEvent] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const updateNode = useStore((state) => state.updateNode);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateNode(data.id, {
      data: { title, events, tags, attachedFiles, backgroundColor, textColor }
    });
  }, [
    title,
    events,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    updateNode,
    data.id
  ]);

  const onChangeTitle = (newTitle: string) => {
    handleTitleChange(data.id, newTitle, setTitle);
  };

  const handleBackgroundColorChange = (color: { hex: string }) => {
    const selectedCombination = colorCombinations.find(
      (combination) =>
        combination.background.toLowerCase() === color.hex.toLowerCase()
    );
    if (selectedCombination) {
      setTextColor(selectedCombination.text);
      handleChangeColorWithCombination(
        data.id,
        selectedCombination.background,
        selectedCombination.text,
        setBackgroundColor
      );
    } else {
      const calculatedTextColor = getContrastYIQ(color.hex);
      setTextColor(calculatedTextColor);
      handleChangeColorWithCombination(
        data.id,
        color.hex,
        calculatedTextColor,
        setBackgroundColor
      );
    }
  };

  const onAddTag = (newTag: string) => {
    setTags([...tags, newTag]);
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles(files);
  };

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleResize = (event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleClickOutside = (event) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target)
    ) {
      setIsColorPickerVisible(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [colorPickerRef]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleAddEvent = ({ start, end }) => {
    setNewEvent({ start, end });
    setIsModalOpen(true);
  };

  const handleEventDelete = (eventToDelete) => {
    setEvents(events.filter((event) => event !== eventToDelete));
    setIsModalOpen(false);
  };

  const handleEventSave = (updatedEvent) => {
    if (newEvent) {
      setEvents([...events, updatedEvent]);
      setNewEvent(null);
    } else {
      setEvents(
        events.map((event) => (event === selectedEvent ? updatedEvent : event))
      );
    }
    setIsModalOpen(false);
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  const handleEventResize = (data) => {
    const { start, end, event } = data;
    const updatedEvent = { ...event, start, end };
    setEvents(events.map((ev) => (ev === event ? updatedEvent : ev)));
  };

  const handleEventDrop = (data) => {
    const { start, end, event } = data;
    const updatedEvent = { ...event, start, end };
    setEvents(events.map((ev) => (ev === event ? updatedEvent : ev)));
  };

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor
  };

  return (
    <div
      className={styles.calendarNode}
      style={customStyles}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
      data-toolbar-background-color={backgroundColor}
      data-toolbar-text-color={textColor}
    >
      <NodeResizer
        isVisible={isContainerSelected}
        minWidth={200}
        minHeight={200}
        onResize={handleResize}
      />
      <div className={styles.header}>
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className={`${styles.titleInput} nodrag`}
          style={{ color: textColor }}
        />
        <CloseButton
          onClick={() => handleClose(data.id, () => {}, title, events)}
        />
      </div>
      <div className={`${styles.calendarContent} nowheel nodrag`}>
        <CalendarToolbar
          view={view}
          onViewChange={handleViewChange}
          textColor={textColor}
        />
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100% - 40px)', width: '100%' }}
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleAddEvent}
          view={view as Views}
          onEventResize={handleEventResize}
          onEventDrop={handleEventDrop}
          onView={(newView) => handleViewChange(newView)}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          toolbar={true}
        />
      </div>
      <div className={styles.footer}>
        <SaveButton
          onClick={() =>
            handleSave(data.id, () => {}, {
              title,
              events,
              tags,
              attachedFiles
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton onClick={() => toggleColorPicker()} />
        <AddTagButton onClick={() => handleAddTag(data.id, tags, onAddTag)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFiles)(e)}
        />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        {isColorPickerVisible && (
          <div className={`${styles.colorPicker} nodrag`} ref={colorPickerRef}>
            <CompactPicker
              color={backgroundColor}
              onChange={handleBackgroundColorChange}
              colors={colorCombinations.map(
                (combination) => combination.background
              )}
              styles={{
                default: {
                  input: {
                    height: '16px',
                    fontSize: '12px'
                  },
                  swatch: {
                    width: '20px',
                    height: '20px',
                    position: 'relative'
                  }
                }
              }}
              width="180px"
              className="compact-picker"
            />
            {colorCombinations.map((combination) => (
              <div
                key={combination.background}
                className="compact-picker__swatch"
                style={{ backgroundColor: combination.background }}
                data-name={combination.name}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag} style={{ color: textColor }}>
            {tag}
          </span>
        ))}
      </div>
      {attachedFiles.length > 0 && (
        <div className={styles.attachedFile} style={{ color: textColor }}>
          Attached files: {attachedFiles.map((file) => file.name).join(', ')}
        </div>
      )}
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
      {isModalOpen && (
        <EventModal
          event={selectedEvent || newEvent}
          onClose={() => {
            setIsModalOpen(false);
            setNewEvent(null);
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      )}
    </div>
  );
};

export default CalendarNodeEdit;
