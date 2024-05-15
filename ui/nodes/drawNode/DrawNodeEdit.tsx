import React, { useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './DrawNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

interface DrawNodeEditProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    width: number;
    height: number;
    onSave: () => void;
    onChangeColor: (color: string) => void;
    onAddTag: (tag: string) => void;
    onAttachFile: (file: File) => void;
  };
}

const DrawNodeEdit: React.FC<DrawNodeEditProps> = ({ data }) => {
  const [title, setTitle] = useState(data.title || 'Untitled Drawing');
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleColorChange = () => {
    const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    setBackgroundColor(newColor);
    data.onChangeColor(newColor);
  };

  const handleAddTag = () => {
    const newTag = prompt('Enter a new tag:');
    if (newTag) {
      setTags([...tags, newTag]);
      data.onAddTag(newTag);
    }
  };

  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setAttachedFile(file);
      data.onAttachFile(file);
    }
  };

  return (
    <div
      className={styles.drawNode}
      style={{ backgroundColor, width: data.width, height: data.height }}
    >
      <div className={styles.header}>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={styles.titleInput}
        />
        <button className={styles.saveButton} onClick={data.onSave}>
          Save
        </button>
      </div>
      <div className={styles.drawContent}>
        {/* Drawing content would be rendered here */}
      </div>
      <div className={styles.footer}>
        <button className={styles.iconButton} onClick={handleColorChange}>
          Change Color
        </button>
        <button className={styles.iconButton} onClick={handleAddTag}>
          Add Tag
        </button>
        <label className={styles.iconButton}>
          Attach File
          <input
            type="file"
            className={styles.fileInput}
            onChange={handleAttachFile}
          />
        </label>
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

export default DrawNodeEdit;
