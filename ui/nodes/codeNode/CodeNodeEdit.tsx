import React, { useState } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CodeNodeEdit.module.css';
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

interface CodeNodeEditProps extends NodeProps {
  data: {
    id: string;
    code?: string;
    language?: string;
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

const CodeNodeEdit: React.FC<CodeNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Code');
  const [code, setCode] = useState(data.code || '');
  const [language, setLanguage] = useState(data.language || 'javascript');
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);

  const updateNode = useStore((state) => state.updateNode);

  const onChangeTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const onChangeCode = (newCode: string) => {
    setCode(newCode);
    updateNode(data.id, { data: { ...data, code: newCode } });
  };

  const onChangeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
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
    console.log(`CodeNodeEdit: Resizing: width = ${width}, height = ${height}`);
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  return (
    <div
      className={styles.codeNode}
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
          onChange={(e) =>
            handleTitleChange(data.id, e.target.value, onChangeTitle)
          }
          className={styles.titleInput}
        />
        <CloseButton onClick={() => handleClose(data.id)} />
      </div>
      <textarea
        className={styles.codeContent}
        value={code}
        onChange={(e) => onChangeCode(e.target.value)}
      />
      <div className={styles.footer}>
        <SaveButton onClick={() => handleSave(data.id, () => {})} />
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

export default CodeNodeEdit;
