import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import styles from './TaskNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import TaskControls from './TaskControls';

interface TaskNodeEditProps extends NodeProps {
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

const TaskNodeEdit: React.FC<TaskNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  console.log('TaskNodeEdit: Node details:', {
    id: data.id,
    title: data.title,
    tasks: data.tasks,
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    width,
    height,
    position
  });

  const { canvasId } = useCanvasStore();
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Task');
  const [tasks, setTasks] = useState(data.tasks || []);
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
  const [newTaskText, setNewTaskText] = useState('');
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [totalTasks, setTotalTasks] = useState(data.total_tasks || 0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [showPriority, setShowPriority] = useState(true);
  const [showDueDate, setShowDueDate] = useState(true);

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
            'task'
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

    const specificData = { tasks, tags, attachedFiles };

    debouncedUpdateNodeData(commonData, specificData);
  }, [
    title,
    tasks,
    backgroundColor,
    textColor,
    nodeWidth,
    nodeHeight,
    tags,
    attachedFiles,
    debouncedUpdateNodeData
  ]);

  useEffect(() => {
    setTotalTasks(tasks.length);
    setCompletedTasks(tasks.filter((task) => task.completed).length);
  }, [tasks]);

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

  const customStyles = useMemo(
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        assignee: '',
        priority: 'medium',
        status: 'todo',
        due_date: null
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const updateTask = (taskId: string, updates: Partial<(typeof tasks)[0]>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const deleteCompletedTasks = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.completed));
  };

  const deleteAllTasks = () => {
    setTasks([]);
  };

  const sortTasks = useCallback(
    (tasksToSort: typeof data.tasks) => {
      return [...tasksToSort].sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            return a.priority.localeCompare(b.priority);
          case 'dueDate':
            return (a.due_date || '').localeCompare(b.due_date || '');
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
    },
    [sortBy]
  );

  const displayedTasks = useMemo(() => {
    let filteredTasks = tasks;
    if (!showCompletedTasks) {
      filteredTasks = filteredTasks.filter((task) => !task.completed);
    }
    return sortTasks(filteredTasks);
  }, [tasks, sortBy, showCompletedTasks, sortTasks]);

  const handleNewTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const toggleShowPriority = () => {
    setShowPriority(!showPriority);
  };

  const toggleShowDueDate = () => {
    setShowDueDate(!showDueDate);
  };

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
      className={styles.taskNode}
      style={customStyles}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
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
          onClick={() => handleClose(data.id, () => {}, title, tasks, canvasId)}
        />
      </div>
      <TaskControls
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showCompletedTasks={showCompletedTasks}
        showPriority={showPriority}
        showDueDate={showDueDate}
        onToggleCompletedTasks={() =>
          setShowCompletedTasks(!showCompletedTasks)
        }
        onTogglePriority={toggleShowPriority}
        onToggleDueDate={toggleShowDueDate}
        onDeleteCompletedTasks={deleteCompletedTasks}
        onDeleteAllTasks={deleteAllTasks}
      />
      <div className={`${styles.taskContent} nowheel nodrag`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayedTasks}
            strategy={verticalListSortingStrategy}
          >
            {displayedTasks.map((task) => (
              <SortableItem
                key={task.id}
                id={task.id}
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                textColor={textColor}
                showPriority={showPriority}
                showDueDate={showDueDate}
              />
            ))}
          </SortableContext>
        </DndContext>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleNewTaskKeyDown}
          placeholder="Add a new task..."
          className={styles.newTaskInput}
          style={{ color: textColor }}
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
    </div>
  );
};

export default TaskNodeEdit;
