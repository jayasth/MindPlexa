import React, { useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './CustomNodeEdit.module.css';
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

interface CustomNodeEditProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    data?: any;
    onSave: () => void;
    onChangeData: (data: any) => void;
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

const CustomNodeEdit: React.FC<CustomNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Custom Node');
  const [customData, setCustomData] = useState(data.data || {});
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);

  const onChangeTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const onChangeCustomData = (newData: any) => {
    setCustomData(newData);
    data.onChangeData(newData);
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
      className={styles.customNode}
      style={{ width: nodeWidth, height: nodeHeight, backgroundColor }}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
    >
      <div className={styles.header}>
        <input
          type="text"
          value={title}
          onChange={(e) =>
            handleTitleChange(data.id, e.target.value, onChangeTitle)
          }
          className={styles.titleInput}
        />
        <CloseButton onClick={() => handleClose(data.id)} />
      </div>
      <textarea
        className={styles.customContent}
        value={JSON.stringify(customData, null, 2)}
        onChange={(e) => onChangeCustomData(JSON.parse(e.target.value))}
      />
      <div className={styles.footer}>
        <SaveButton onClick={() => handleSave(data.id, data.onSave)} />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton
          onClick={() =>
            handleChangeColor(data.id, backgroundColor, onChangeColor)
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

export default CustomNodeEdit;
