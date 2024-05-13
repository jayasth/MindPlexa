import React, { useState, useEffect } from 'react';
import { NodeProps, NodeResizer, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import { useNodeResizing } from '@/ui/canvasEditor/hooks/useNodeResizing';
import styles from './NoteNodeEdit.module.css';
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

interface NoteNodeEditProps extends NodeProps {
  data: {
    id: string;
    content?: string;
    title?: string;
  };
  width: number;
  height: number;
  selected: boolean;
}

const NoteNodeEdit: React.FC<NoteNodeEditProps> = ({
  data,
  width,
  height,
  selected
}) => {
  const [title, setTitle] = useState(data.title || 'Untitled Note');
  const [content, setContent] = useState(data.content || '');
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const updateNode = useStore((state) => state.updateNode);

  const onChangeTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateNode(data.id, { data: { ...data, content: newContent } });
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

  const handleMouseDown = (event: React.MouseEvent) => {
    if (
      event.target instanceof Element &&
      event.target.closest('.resize-handle')
    ) {
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
        onResize={useNodeResizing}
        lineStyle={{ stroke: '#ff0071', strokeWidth: 2 }}
        handleStyle={{ fill: '#ff0071' }}
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
        className={styles.noteContent}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
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

export default NoteNodeEdit;
