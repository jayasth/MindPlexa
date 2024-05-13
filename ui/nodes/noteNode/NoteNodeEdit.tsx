import React, { useState, useEffect } from 'react';
import { NodeProps, NodeResizer, Handle, Position } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import { useNodeResizing } from '@/ui/canvasEditor/hooks/useNodeResizing';
import styles from './NoteNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  useTitleChange,
  useContentChange,
  useSave,
  useClose, // Replaced useCancel with useClose
  useDelete,
  useChangeColor,
  useAddTag,
  useAttachFile
} from './noteNodeEditFunctions';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton // Assuming CloseButton is imported correctly
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

  const { updateNode, toggleEditMode } = useStore((state) => ({
    updateNode: state.updateNode,
    toggleEditMode: state.toggleEditMode
  }));

  const handleTitleChangeWrapper = useTitleChange(data.id, data.onChangeTitle);
  const handleContentChangeWrapper = useContentChange(
    data.id,
    data.onChangeContent
  );
  const handleSaveWrapper = useSave(data.id, data.onSave);
  const handleCloseWrapper = useClose(data.id); // Changed handleCancelWrapper to handleCloseWrapper
  const handleDeleteWrapper = useDelete(data.id, data.onDelete);
  const handleChangeColorWrapper = useChangeColor(data.id);
  const handleAddTagWrapper = useAddTag(data.id, tags, data.onAddTag);
  const handleAttachFileWrapper = useAttachFile(data.id, data.onAttachFile);

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
        onResize={useNodeResizing}
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
        <CloseButton onClick={handleCloseWrapper} />{' '}
        {/* Changed CancelButton to CloseButton */}
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
