import React, { useState, useEffect, useRef } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { ChromePicker } from 'react-color';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './NoteNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton,
  DuplicateButton
} from '@/ui/nodes/CommonNodeComponents';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  handleChangeColor,
  handleAddTag,
  handleAttachFile,
  handleDuplicate
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';

interface NoteNodeEditProps extends NodeProps {
  data: {
    id: string;
    content?: string;
    title?: string;
    backgroundColor?: string;
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

const NoteNodeEdit: React.FC<NoteNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Note');
  const [content, setContent] = useState(data.content || '');
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#f8f8f8'
  );
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const updateNode = useStore((state) => state.updateNode);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateNode(data.id, {
      data: { title, content, tags, attachedFiles, backgroundColor }
    });
  }, [
    title,
    content,
    tags,
    attachedFiles,
    backgroundColor,
    updateNode,
    data.id
  ]);

  const onChangeTitle = (newTitle: string) => {
    handleTitleChange(data.id, newTitle, setTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateNode(data.id, { data: { ...data, content: newContent } });
  };

  const onChangeColor = (newColor: string) => {
    setBackgroundColor(newColor);
  };

  const handleChangeComplete = (color) => {
    handleChangeColor(data.id, color.hex, onChangeColor);
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

  const handleContainerClick = (e) => {
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

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target) &&
        isColorPickerVisible
      ) {
        setIsColorPickerVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorPickerVisible, colorPickerRef]);

  return (
    <div
      className={styles.noteNode}
      style={{ width: nodeWidth, height: nodeHeight, backgroundColor }}
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
        />
        <CloseButton
          onClick={(e) => {
            handleClose(data.id, () => {}, title, content);
          }}
        />
      </div>
      <textarea
        className={`${styles.noteContent} nowheel nodrag`}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
      />
      <div className={styles.footer}>
        <SaveButton
          onClick={(e) => {
            handleSave(data.id, () => {}, {
              title,
              content,
              tags,
              attachedFiles
            });
          }}
        />
        <DeleteButton
          onClick={(e) => {
            handleDelete(data.id, () => {});
          }}
        />
        <ChangeColorButton
          onClick={(e) => {
            toggleColorPicker();
          }}
        />
        <AddTagButton
          onClick={(e) => {
            handleAddTag(data.id, tags, onAddTag);
          }}
        />
        <AttachFileButton
          onChange={(e) => {
            handleAttachFile(data.id, onAttachFiles)(e);
          }}
        />
        <DuplicateButton
          onClick={(e) => {
            handleDuplicate(data.id);
          }}
        />
        {isColorPickerVisible && (
          <div className={`${styles.colorPicker} nodrag`} ref={colorPickerRef}>
            <ChromePicker
              color={backgroundColor}
              onChangeComplete={handleChangeComplete}
            />
          </div>
        )}
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

export default NoteNodeEdit;
