import React, { useState, useEffect } from 'react';
import { NodeProps, NodeResizer, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './NoteNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  handleTitleChange,
  handleContentChange,
  handleSave,
  handleCancel,
  handleDelete,
  handleChangeColor,
  handleAddTag,
  handleAttachFile
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CancelButton
} from '@/ui/nodes/CommonNodeComponents';

interface NoteNodeEditProps extends NodeProps {
  data: {
    id: string;
    content?: string;
    title?: string;
    onSave: () => void;
    onChangeContent: (content: string) => void;
    onChangeTitle: (title: string) => void;
    onDelete: () => void;
    onChangeColor: (color: string) => void;
    onAddTag: (tag: string) => void;
    onAttachFile: (file: File) => void;
  };
  width: number;
  height: number;
  selected: boolean;
  onNodeResizeStop: (
    nodeId: string,
    newSize: { width: number; height: number },
    newPosition: { x: number; y: number }
  ) => void;
}

const NoteNodeEdit: React.FC<NoteNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop
}) => {
  const [title, setTitle] = useState(data.title || 'Untitled Note');
  const [content, setContent] = useState(data.content || '');
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const { updateNode, toggleEditMode } = useStore((state) => ({
    updateNode: state.updateNode,
    toggleEditMode: state.toggleEditMode
  }));

  const handleTitleChangeWrapper = (title: string) => {
    handleTitleChange(data.id, title, data.onChangeTitle);
    setTitle(title);
  };

  const handleContentChangeWrapper = (content: string) => {
    handleContentChange(data.id, content, data.onChangeContent);
    setContent(content);
  };

  const handleSaveWrapper = () => {
    handleSave(data.id, data.onSave);
  };

  const handleCancelWrapper = () => {
    handleCancel(data.id);
  };

  const handleDeleteWrapper = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      handleDelete(data.id, data.onDelete);
    }
  };

  const handleChangeColorWrapper = () => {
    const newColor = handleChangeColor(
      data.id,
      backgroundColor,
      data.onChangeColor
    );
    setBackgroundColor(newColor);
  };

  const handleAddTagWrapper = () => {
    const newTags = handleAddTag(data.id, tags, data.onAddTag);
    setTags(newTags);
  };

  const handleAttachFileWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = handleAttachFile(data.id, data.onAttachFile)(e);
    if (file) setAttachedFile(file as File);
  };

  const handleResizeStop = (event, newSize) => {
    const newPosition = {
      x: newSize.x,
      y: newSize.y
    };
    onNodeResizeStop(data.id, newSize, newPosition);
  };

  const handleMouseDown = (event) => {
    if (event.target.closest('.resize-handle')) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    updateNode(data.id, { width, height });
  }, [width, height, updateNode, data.id]);

  return (
    <div
      className={styles.noteNode}
      style={{ width, height, backgroundColor }}
      onMouseDown={handleMouseDown}
    >
      <NodeResizer
        minWidth={100}
        minHeight={150}
        isVisible={selected}
        onResize={handleResizeStop}
        lineStyle={{ stroke: '#ff0071', strokeWidth: 2 }}
        handleStyle={{ fill: '#ff0071' }}
      />
      <div className={styles.header}>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChangeWrapper(e.target.value)}
          className={styles.titleInput}
        />
        <CancelButton onClick={handleCancelWrapper} />
      </div>
      <textarea
        className={styles.noteContent}
        value={content}
        onChange={(e) => handleContentChangeWrapper(e.target.value)}
      />
      <div className={styles.footer}>
        <SaveButton onClick={handleSaveWrapper} />
        <DeleteButton onClick={handleDeleteWrapper} />
        <ChangeColorButton onClick={handleChangeColorWrapper} />
        <AddTagButton onClick={handleAddTagWrapper} />
        <AttachFileButton onChange={handleAttachFileWrapper} />
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

export default NoteNodeEdit;
