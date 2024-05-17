import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './TaskNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton
} from '@/ui/nodes/CommonNodeComponents';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  handleChangeColor,
  handleAddTag,
  handleAttachFile
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';

interface TaskNodeEditProps extends NodeProps {
  data: {
    id: string;
    tasks?: { text: string; completed: boolean }[];
    title?: string;
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
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);

  const updateNode = useStore((state) => state.updateNode);

  useEffect(() => {
    updateNode(data.id, { data: { title, tasks, tags, attachedFiles } });
  }, [title, tasks, tags, attachedFiles, updateNode, data.id]);

  const onChangeTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleTaskChange = (
    index: number,
    newTask: { text: string; completed: boolean }
  ) => {
    const updatedTasks = tasks.map((task, i) => (i === index ? newTask : task));
    setTasks(updatedTasks);
    updateNode(data.id, { data: { ...data, tasks: updatedTasks } });
  };

  const addTask = () => {
    setTasks([...tasks, { text: '', completed: false }]);
  };

  const onChangeColor = (newColor: string) => {
    setBackgroundColor(newColor);
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

  return (
    <div
      className={styles.taskNode}
      style={{ width: nodeWidth, height: nodeHeight, backgroundColor }}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={200}
        onResize={handleResize}
      />
      <div className={styles.header}>
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className={styles.titleInput}
        />
        <CloseButton
          onClick={() =>
            handleClose(data.id, () => {}, title, JSON.stringify(tasks))
          }
        />
      </div>
      <div className={styles.taskList}>
        {tasks.map((task, index) => (
          <div key={index} className={styles.taskItem}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) =>
                handleTaskChange(index, {
                  ...task,
                  completed: e.target.checked
                })
              }
            />
            <input
              type="text"
              value={task.text}
              onChange={(e) =>
                handleTaskChange(index, { ...task, text: e.target.value })
              }
              className={styles.taskInput}
            />
          </div>
        ))}
        <button onClick={addTask} className={styles.addTaskButton}>
          Add Task
        </button>
      </div>
      <div className={styles.footer}>
        <SaveButton
          onClick={() =>
            handleSave(data.id, () => {}, {
              title,
              tasks,
              tags,
              attachedFiles
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton
          onClick={() =>
            handleChangeColor(data.id, backgroundColor, onChangeColor)
          }
        />
        <AddTagButton onClick={() => handleAddTag(data.id, tags, onAddTag)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFiles)(e)}
        />
      </div>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      {attachedFiles.length > 0 && (
        <div className={styles.attachedFile}>
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
    </div>
  );
};

export default TaskNodeEdit;
