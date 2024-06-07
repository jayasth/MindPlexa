import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CalendarNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import EventModal from '@/ui/nodes/calendarNode/EventModal';
import CalendarToolbar from '@/ui/nodes/calendarNode/CalendarToolbar';
import { CalendarNodeData } from '@/ui/canvasEditor/utils/nodeDatatypes';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton,
  DuplicateButton,
  TagModal,
  FileModal,
  ColorPickerModal
} from '@/ui/nodes/common/CommonNodeComponents';
import TagFileContainer from '@/ui/nodes/common/TagFileContainer';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  handleAddTag,
  handleRemoveAttachedFile,
  handleDuplicate,
  colorCombinations,
  handleAttachmentPreview
} from '@/ui/nodes/common/CommonNodeFunctions';
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';

const localizer = momentLocalizer(moment);

interface CalendarNodeEditProps extends NodeProps {
  data: CalendarNodeData;
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
  const [events, setEvents] = useState(data.events || []);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [view, setView] = useState(data.view || 'month');
  const [newEvent, setNewEvent] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [title, setTitle] = useState(data.title || 'Untitled Calendar');
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [attachedFiles, setAttachedFiles] = useState<File[]>(
    data.attachedFiles || []
  );
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const updateNode = useStore((state) => state.updateNode);

  useEffect(() => {
    updateNode(data.id, {
      data: { events, title, tags, attachedFiles, backgroundColor, textColor }
    });
  }, [
    events,
    title,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    updateNode,
    data.id
  ]);

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

  const handleBackgroundColorChange = useBackgroundColorChange(
    data.id,
    setBackgroundColor,
    setTextColor
  );

  const onChangeColor = (color: { hex: string }) => {
    handleBackgroundColorChange(color);
  };

  const onAddTag = (newTags: string[]) => {
    const uniqueTags = Array.from(new Set([...tags, ...newTags]));
    setTags(uniqueTags);
    handleAddTag(data.id, uniqueTags, () => {});
  };

  const onRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    handleAddTag(data.id, updatedTags, () => {});
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles(files);
  };

  const onRemoveFile = (fileToRemove: File) => {
    handleRemoveAttachedFile(data.id, fileToRemove, () => {});
  };

  useEffect(() => {
    setTags(data.tags || []);
    setAttachedFiles(data.attachedFiles || []);
  }, [data.tags, data.attachedFiles]);

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
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
          onChange={(e) => handleTitleChange(data.id, e.target.value, setTitle)}
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
      {(tags.length > 0 || attachedFiles.length > 0) && (
        <TagFileContainer
          tags={tags}
          attachedFiles={attachedFiles}
          onRemoveTag={onRemoveTag}
          onRemoveFile={onRemoveFile}
          textColor={textColor}
          handleAttachmentPreview={handleAttachmentPreview}
        />
      )}
      <div className={styles.footer}>
        <SaveButton
          onClick={() =>
            handleSave(data.id, () => {}, {
              ...data,
              title,
              events,
              tags
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton onClick={() => toggleColorPicker()} />
        <AddTagButton onClick={() => setIsTagModalOpen(true)} />
        <AttachFileButton onClick={() => setIsFileModalOpen(true)} />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        <ColorPickerModal
          isOpen={isColorPickerVisible}
          onClose={() => setIsColorPickerVisible(false)}
          currentColor={backgroundColor}
          onChangeColor={onChangeColor}
          colorCombinations={colorCombinations}
        />
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
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        existingTags={tags}
      />
      <FileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onAttachFiles={onAttachFiles}
        onRemoveFile={onRemoveFile}
        existingFiles={attachedFiles}
        data={data}
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
