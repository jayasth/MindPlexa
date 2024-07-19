import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useMemo,
  useCallback
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './CalendarNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import EventModal from '@/ui/nodes/calendarNode/EventModal';
import CalendarToolbar from '@/ui/nodes/calendarNode/CalendarToolbar';
import {
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
import NodeDeleteConfirmationModal from '@/ui/nodes/common/NodeDeleteConfirmationModal';
import TagFileContainer from '@/ui/nodes/common/TagFileContainer';
import {
  handleTitleChange,
  handleClose,
  handleDelete as handleDeleteNode,
  colorCombinations,
  handleAddTag,
  handleDuplicate
} from '@/ui/nodes/common/CommonNodeFunctions';
import {
  Attachment,
  removeAttachment,
  getAttachments,
  removeAllPreviews
} from '@/utils/canvas/attachmentService';
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';
import { debounce } from 'lodash';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';

const localizer = momentLocalizer(moment);

interface CalendarNodeEditProps extends NodeProps {
  data: any;
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
  console.log('CalendarNodeEdit: Node details:', {
    id: data.id,
    title: data.title,
    events: data.events,
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    width,
    height,
    position
  });

  const { canvasId } = useCanvasStore();
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Calendar');
  const [events, setEvents] = useState(data.events || []);
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [view, setView] = useState(data.view || 'month');
  const [newEvent, setNewEvent] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [defaultView, setDefaultView] = useState(data.defaultView || 'month');
  const [eventCategories, setEventCategories] = useState(
    data.eventCategories || []
  );
  const [timeZone, setTimeZone] = useState(data.timeZone || 'UTC');
  const [exportSettings, setExportSettings] = useState(
    data.exportSettings || {}
  );

  const handleBackgroundColorChange = useBackgroundColorChange(
    data.id,
    setBackgroundColor,
    setTextColor
  );

  const onChangeColor = useCallback(
    (color: { hex: string }) => {
      handleBackgroundColorChange(color);
    },
    [handleBackgroundColorChange]
  );

  const debouncedUpdateNodeData = useMemo(
    () =>
      debounce(async (commonData, specificData) => {
        try {
          const updateNode = useNodeStore.getState().updateNode;
          await updateNode(
            data.id,
            { ...commonData, data: specificData },
            'calendar'
          );
        } catch (error) {
          console.error('Error updating node:', error);
        }
      }, 500),
    [data.id]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateNodeData.cancel();
      removeAllPreviews();
    };
  }, [debouncedUpdateNodeData]);

  useEffect(() => {
    const commonData = {
      title,
      backgroundColor,
      textColor,
      editWidth: nodeWidth,
      editHeight: nodeHeight
    };

    const specificData = {
      events,
      tags,
      attachedFiles,
      defaultView,
      eventCategories,
      timeZone,
      exportSettings
    };

    debouncedUpdateNodeData(commonData, specificData);
  }, [
    title,
    events,
    backgroundColor,
    textColor,
    nodeWidth,
    nodeHeight,
    tags,
    attachedFiles,
    defaultView,
    eventCategories,
    timeZone,
    exportSettings,
    debouncedUpdateNodeData
  ]);

  const onChangeTitle = useCallback(
    (newTitle: string) => {
      handleTitleChange(data.id, newTitle, setTitle, canvasId);
    },
    [data.id, canvasId]
  );

  const onAddTag = useCallback(
    (newTags: string[]) => {
      const uniqueTags = Array.from(new Set([...tags, ...newTags]));
      setTags(uniqueTags);
      handleAddTag(data.id, uniqueTags, () => {}, canvasId);
    },
    [data.id, tags, canvasId]
  );

  const onRemoveTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(updatedTags);
      handleAddTag(data.id, updatedTags, () => {}, canvasId);
    },
    [data.id, tags, canvasId]
  );

  const onAttachFiles = useCallback(async (files: Attachment[]) => {
    setAttachedFiles(files);
  }, []);

  const onRemoveFile = useCallback(
    async (fileId: string) => {
      await removeAttachment(fileId);
      const updatedAttachments = await getAttachments(data.id);
      setAttachedFiles(updatedAttachments);
    },
    [data.id]
  );

  useEffect(() => {
    const fetchAttachments = async () => {
      const attachments = await getAttachments(data.id);
      setAttachedFiles(attachments);
    };
    fetchAttachments();
  }, [data.id]);

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleResize = useCallback(
    (event, { width, height }) => {
      setNodeWidth(width);
      setNodeHeight(height);
      onNodeResizeStop(data.id, { width, height }, position);
    },
    [data.id, onNodeResizeStop, position]
  );

  const handleContainerClick = useCallback(() => {
    setIsContainerSelected(true);
  }, []);

  const handleContainerBlur = useCallback(() => {
    setIsContainerSelected(false);
  }, []);

  const toggleColorPicker = useCallback(() => {
    setIsColorPickerVisible((prev) => !prev);
  }, []);

  const customStyles: CSSProperties = useMemo(
    () => ({
      width: nodeWidth,
      height: nodeHeight,
      backgroundColor,
      color: textColor
    }),
    [nodeWidth, nodeHeight, backgroundColor, textColor]
  );

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    handleDeleteNode(data.id, canvasId);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
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

  const handleAddEventCategory = (category: string, color: string) => {
    setEventCategories([...eventCategories, { name: category, color }]);
  };

  const handleExport = () => {
    // Implement export logic based on exportSettings
    // This could be exporting to iCal, CSV, etc.
  };

  const customDayPropGetter = useCallback(
    (date: Date) => {
      if (moment(date).isSame(moment(), 'day')) {
        return {
          className: styles.todayCell,
          style: {
            backgroundColor: backgroundColor,
            color: textColor,
            border: `2px solid ${textColor}`
          }
        };
      }
      return {};
    },
    [backgroundColor, textColor]
  );

  const memoizedTagFileContainer = useMemo(
    () => (
      <TagFileContainer
        tags={tags}
        attachedFiles={attachedFiles}
        onRemoveTag={onRemoveTag}
        onRemoveFile={onRemoveFile}
        textColor={textColor}
      />
    ),
    [tags, attachedFiles, onRemoveTag, onRemoveFile, textColor]
  );

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
          onClick={() =>
            handleClose(data.id, () => {}, title, events, canvasId)
          }
        />
      </div>
      <div className={`${styles.calendarContent} nowheel nodrag`}>
        <CalendarToolbar
          view={view}
          onViewChange={handleViewChange}
          textColor={textColor}
          defaultView={defaultView}
          onDefaultViewChange={handleViewChange}
          backgroundColor={backgroundColor}
        />
        <Calendar
          localizer={localizer}
          events={events.map((event) => ({
            ...event,
            color: eventCategories.find((cat) => cat.name === event.category)
              ?.color
          }))}
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
          toolbar={false}
          timezone={timeZone}
          dayPropGetter={customDayPropGetter}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || backgroundColor,
              color: textColor,
              border: `1px solid ${textColor}`
            }
          })}
          className={styles.customCalendar}
        />
      </div>
      {(tags.length > 0 || attachedFiles.length > 0) &&
        memoizedTagFileContainer}
      <div className={styles.footer}>
        <DeleteButton onClick={() => setIsDeleteModalOpen(true)} />
        <ChangeColorButton onClick={toggleColorPicker} />
        <AddTagButton onClick={() => setIsTagModalOpen(true)} />
        <AttachFileButton onClick={() => setIsFileModalOpen(true)} />
        <DuplicateButton onClick={() => handleDuplicate(data.id, canvasId)} />
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
        nodeId={data.id}
      />
      <NodeDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
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
          eventCategories={eventCategories}
        />
      )}
    </div>
  );
};

export default React.memo(CalendarNodeEdit);
