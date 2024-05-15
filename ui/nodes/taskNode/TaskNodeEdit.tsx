import React, { useState } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
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
    task?: string;
    completed?: boolean;
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
  const [task, setTask] = useState(data.task || '');
  const [completed, setCompleted] = useState(data.completed || false);
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);

  const onChangeTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const onChangeColor = (newColor: string) => {
    setBackgroundColor(newColor);
  };

  const onAddTag = (newTag: string) => {
    setTags([...tags, newTag]);
  };

  const onAttachFile = (file: File) => {
    setAttachedFile(file);
  };

  const handleContainerClick = () => {
    setIsSelected(true);
  };

  const handleContainerBlur = () => {
    setIsSelected(false);
  };

  const handleResize = (event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  const handleTaskChange = (newTask: string) => {
    setTask(newTask);
  };

  const handleToggleComplete = () => {
    setCompleted(!completed);
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
          onChange={(e) => handleTitleChange(data.id, e.target.value, setTitle)}
          className={styles.titleInput}
        />
        <CloseButton onClick={() => handleClose(data.id)} />
      </div>
      <div className={styles.taskContent}>
        <label className={styles.taskLabel}>
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggleComplete}
            className={styles.taskCheckbox}
          />
          <input
            type="text"
            value={task}
            onChange={(e) => handleTaskChange(e.target.value)}
            className={styles.taskTextInput}
          />
        </label>
      </div>
      <div className={styles.footer}>
        <SaveButton onClick={() => handleSave(data.id, () => {})} />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton
          onClick={() =>
            handleChangeColor(data.id, backgroundColor, setBackgroundColor)
          }
        />
        <AddTagButton onClick={() => handleAddTag(data.id, tags, onAddTag)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFile)(e)}
        />
      </div>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      {attachedFile && (
        <div className={styles.attachedFile}>
          Attached file: {attachedFile.name}
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
