import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './TaskNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  handleChangeColorWithCombination,
  handleAddTag,
  handleDuplicate,
  handleRemoveAttachedFile,
  getContrastYIQ,
  colorCombinations,
  handleAttachmentPreview
} from '@/ui/nodes/common/CommonNodeFunctions';
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
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';
import { TaskNodeData } from '@/ui/canvasEditor/utils/nodeDatatypes';

interface TaskNodeEditProps extends NodeProps {
  data: TaskNodeData;
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
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Task');
  const [tasks, setTasks] = useState(data.tasks || []);
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [attachedFiles, setAttachedFiles] = useState<File[]>(
    data.attachedFiles || []
  );
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  const updateNode = useStore((state) => state.updateNode);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodeProperties = getNodeSpecificProperties('task', true);
    setNodeWidth(nodeProperties.width);
    setNodeHeight(nodeProperties.height);
  }, []);

  useEffect(() => {
    updateNode(data.id, {
      data: {
        title,
        tasks,
        tags,
        attachedFiles,
        backgroundColor,
        textColor
      }
    });
  }, [
    data.id,
    title,
    tasks,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    updateNode
  ]);

  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);

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

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target as Node)
    ) {
      setIsColorPickerVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onChangeTitle = (value: string) => {
    handleTitleChange(data.id, value, setTitle);
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
        completed: false
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const updateTaskText = (taskId: string, text: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, text } : task))
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  const handleResize = (event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  const handleNewTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const toggleShowCompletedTasks = () => {
    setShowCompletedTasks(!showCompletedTasks);
  };

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor
  };

  return (
    <div
      className={`${styles.taskNode} ${isSelected ? styles.selected : ''}`}
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
          onClick={() => handleClose(data.id, () => {}, title, tasks)}
        />
      </div>
      <div className={`${styles.taskContent} nowheel nodrag`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
            {tasks
              .filter((task) => showCompletedTasks || !task.completed)
              .map((task) => (
                <SortableItem
                  key={task.id}
                  id={task.id}
                  task={task}
                  updateTaskText={updateTaskText}
                  toggleTaskCompletion={toggleTaskCompletion}
                  deleteTask={deleteTask}
                  textColor={textColor}
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
      {(tags.length > 0 || attachedFiles.length > 0) && (
        <div className={styles.tagFileContainer}>
          <div className={styles.tagContainer}>
            {tags.map((tag, index) => (
              <span
                key={index}
                className={styles.tag}
                style={{ color: textColor }}
                onClick={() => onRemoveTag(tag)}
              >
                #{tag}{' '}
                <button className={styles.removeTagButton}>&times;</button>
              </span>
            ))}
          </div>
          <div className={styles.fileContainer}>
            {attachedFiles.map((file, index) => (
              <div key={index} className={styles.file}>
                <span
                  onClick={() => {
                    if (file.type === 'text/plain') {
                      window.open(file.name, '_blank');
                    } else {
                      const url = URL.createObjectURL(file);
                      window.open(url, '_blank');
                    }
                  }}
                  onMouseEnter={() => handleAttachmentPreview(file)}
                  onMouseLeave={() => {
                    const preview = document.querySelector('.file-preview');
                    if (preview) {
                      document.body.removeChild(preview);
                    }
                  }}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {file.name}
                </span>
                <button
                  className={styles.removeFileButton}
                  onClick={() => onRemoveFile(file)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.footer}>
        <SaveButton
          onClick={() =>
            handleSave(data.id, () => {}, {
              title,
              tasks,
              tags,
              attachedFiles,
              backgroundColor,
              textColor
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton onClick={() => toggleColorPicker()} />
        <AddTagButton onClick={() => setIsTagModalOpen(true)} />
        <AttachFileButton onClick={() => setIsFileModalOpen(true)} />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        <button
          onClick={toggleShowCompletedTasks}
          className={styles.iconButton}
          title={
            showCompletedTasks ? 'Hide completed tasks' : 'Show completed tasks'
          }
        >
          {showCompletedTasks ? <FaEyeSlash /> : <FaEye />}
        </button>
        <ColorPickerModal
          isOpen={isColorPickerVisible}
          onClose={() => setIsColorPickerVisible(false)}
          currentColor={backgroundColor}
          onChangeColor={handleBackgroundColorChange}
          colorCombinations={colorCombinations}
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

export default TaskNodeEdit;
