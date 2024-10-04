import React, {
  useState,
  useEffect,
  CSSProperties,
  useMemo,
  useCallback
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment-timezone';
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
import { exportEventsToICS } from './exportCalendarEvent';
import { CalendarEvent } from './eventTypes';

const localizer = momentLocalizer(moment);

interface CalendarNodeEditProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    events?: CalendarEvent[];
    backgroundColor?: string;
    textColor?: string;
    tags?: string[];
    view?: string;
    defaultView?: string;
    timeZone?: string;
    exportSettings?: Record<string, unknown>;
  };
  width: number;
  height: number;
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
  const [title, setTitle] = useState(data.title || 'Untitled Calendar');
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (data.events && Array.isArray(data.events)) {
      return data.events.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        timezone: event.timezone || data.timeZone || moment.tz.guess()
      }));
    }
    return [];
  });
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [view, setView] = useState(data.view || 'month');
  const [currentDate, setCurrentDate] = useState(() => {
    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
      const latestEvent = data.events.reduce((latest, event) =>
        event.start > latest.start ? event : latest
      );
      return moment(latestEvent.start).toDate();
    }
    return moment().toDate();
  });
  const [timeZone, setTimeZone] = useState(data.timeZone || moment.tz.guess());

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
      timeZone,
      exportSettings: data.exportSettings
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
    timeZone,
    data.exportSettings,
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

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    handleDeleteNode(data.id, canvasId);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  const handleAddEvent = ({ start, end }: { start: Date; end: Date }) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: '',
      start: new Date(start),
      end: new Date(end),
      timezone: timeZone
    };
    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  };

  const handleEventSave = (updatedEvent: CalendarEvent) => {
    const newEvent: CalendarEvent = {
      ...updatedEvent,
      start: moment.tz(updatedEvent.start, updatedEvent.timezone).toDate(),
      end: moment.tz(updatedEvent.end, updatedEvent.timezone).toDate(),
      timezone: updatedEvent.timezone
    };
    if (events.find((e) => e.id === newEvent.id)) {
      setEvents(
        events.map((event) => (event.id === newEvent.id ? newEvent : event))
      );
    } else {
      setEvents([...events, newEvent]);
    }
    setTimeZone(newEvent.timezone);
    setIsModalOpen(false);
  };

  const handleEventDelete = (eventToDelete: CalendarEvent) => {
    setEvents(events.filter((event) => event.id !== eventToDelete.id));
    setIsModalOpen(false);
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  const handleEventResize = (data: {
    start: Date;
    end: Date;
    event: CalendarEvent;
  }) => {
    const { start, end, event } = data;
    const updatedEvent = { ...event, start, end };
    setEvents(events.map((ev) => (ev === event ? updatedEvent : ev)));
  };

  const handleEventDrop = (data: {
    start: Date;
    end: Date;
    event: CalendarEvent;
  }) => {
    const { start, end, event } = data;
    const updatedEvent = { ...event, start, end };
    setEvents(events.map((ev) => (ev === event ? updatedEvent : ev)));
  };

  const handleExport = () => {
    exportEventsToICS(events);
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

  const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
    setCurrentDate((prevDate) => {
      const newDate = moment(prevDate);
      switch (action) {
        case 'PREV':
          return newDate.startOf('month').subtract(1, 'month').toDate();
        case 'NEXT':
          return newDate.startOf('month').add(1, 'month').toDate();
        case 'TODAY':
          return moment().startOf('month').toDate();
        default:
          return prevDate;
      }
    });
  }, []);

  const { bringNodeToFront } = useNodeStore();

  useEffect(() => {
    bringNodeToFront(data.id);
  }, [data.id, bringNodeToFront]);

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
            handleClose(
              data.id,
              () => {},
              title,
              { events } as Record<string, unknown>,
              canvasId
            )
          }
        />
      </div>
      <div className={`${styles.calendarContent} nowheel nodrag`}>
        <CalendarToolbar
          view={view}
          onViewChange={handleViewChange}
          textColor={textColor}
          backgroundColor={backgroundColor}
          onNavigate={handleNavigate}
          currentDate={currentDate}
          onExport={handleExport}
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
          toolbar={false}
          dayPropGetter={customDayPropGetter}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || backgroundColor,
              color: textColor,
              border: `1px solid ${textColor}`
            }
          })}
          className={styles.customCalendar}
          views={{
            month: true,
            week: true,
            day: true,
            agenda: true
          }}
          messages={{
            agenda: 'List'
          }}
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
          event={
            selectedEvent
              ? { ...selectedEvent, id: selectedEvent.id?.toString() }
              : null
          }
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={(updatedEvent) =>
            handleEventSave({
              ...updatedEvent,
              id: parseInt(updatedEvent.id as string)
            })
          }
          onDelete={(eventToDelete) =>
            handleEventDelete({
              ...eventToDelete,
              id: parseInt(eventToDelete.id as string)
            })
          }
          defaultTimezone={timeZone}
        />
      )}
    </div>
  );
};

export default React.memo(CalendarNodeEdit);
