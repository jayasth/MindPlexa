import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { CompactPicker } from 'react-color';
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
  DuplicateButton,
  TagModal
} from '@/ui/nodes/CommonNodeComponents';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  handleChangeColorWithCombination,
  handleAddTag,
  handleAttachFile,
  handleDuplicate,
  colorCombinations,
  getContrastYIQ
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface NoteNodeEditProps extends NodeProps {
  data: {
    id: string;
    content?: string;
    title?: string;
    backgroundColor?: string;
    textColor?: string;
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
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const updateNode = useStore((state) => state.updateNode);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      quillRef.current &&
      !quillInstance.current
    ) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean']
          ]
        }
      });

      quillInstance.current.on('text-change', () => {
        setContent(quillInstance.current?.root.innerHTML || '');
      });

      if (content) {
        quillInstance.current.root.innerHTML = content;
      }
    }
  }, [content, data.id]);

  useEffect(() => {
    updateNode(data.id, {
      data: { title, content, tags, attachedFiles, backgroundColor, textColor }
    });
  }, [
    title,
    content,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    updateNode,
    data.id
  ]);

  useEffect(() => {
    if (quillInstance.current) {
      const toolbar = quillRef.current?.previousSibling as HTMLElement;
      if (toolbar) {
        toolbar.style.backgroundColor = backgroundColor;
        toolbar.style.color = textColor;
        const icons = toolbar.querySelectorAll(
          '.ql-stroke, .ql-fill, .ql-picker'
        );
        icons.forEach((icon) => {
          if (icon instanceof SVGElement) {
            icon.style.fill = '';
            icon.style.stroke = textColor;
          } else if (icon instanceof HTMLElement) {
            icon.style.color = textColor;
          }
        });
      }
    }
  }, [backgroundColor, textColor]);

  const onChangeTitle = (newTitle: string) => {
    handleTitleChange(data.id, newTitle, setTitle);
  };

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

  const onAddTag = (newTags: string[]) => {
    const uniqueTags = Array.from(new Set([...tags, ...newTags]));
    setTags(uniqueTags);
    handleAddTag(data.id, uniqueTags, (tag) =>
      setTags((prev) => [...prev, tag])
    );
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles(files);
  };

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleResize = (event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleClickOutside = (event) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target)
    ) {
      setIsColorPickerVisible(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [colorPickerRef]);

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor
  };

  return (
    <div
      className={styles.noteNode}
      style={customStyles}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
      data-toolbar-background-color={backgroundColor}
      data-toolbar-text-color={textColor}
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
          onClick={() => handleClose(data.id, () => {}, title, content)}
        />
      </div>
      <div
        ref={quillRef}
        className={`${styles.noteContent} nowheel nodrag`}
        style={{ color: textColor }}
      />
      {(tags.length > 0 || attachedFiles.length > 0) && (
        <div className={styles.tagFileContainer}>
          <div className={styles.tagContainer}>
            {tags.map((tag, index) => (
              <span
                key={index}
                className={styles.tag}
                style={{ color: textColor }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className={styles.fileContainer}>
            {attachedFiles.map((file, index) => (
              <span
                key={index}
                className={styles.file}
                style={{ color: textColor }}
              >
                {file.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className={styles.footer}>
        <SaveButton
          onClick={() =>
            handleSave(data.id, () => {}, {
              ...data,
              title,
              content,
              tags
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton onClick={() => toggleColorPicker()} />
        <AddTagButton onClick={() => setIsTagModalOpen(true)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFiles)(e)}
        />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        {isColorPickerVisible && (
          <div className={`${styles.colorPicker} nodrag`} ref={colorPickerRef}>
            <CompactPicker
              color={backgroundColor}
              onChange={handleBackgroundColorChange}
              colors={colorCombinations.map(
                (combination) => combination.background
              )}
              styles={{
                default: {
                  input: {
                    height: '16px',
                    fontSize: '12px'
                  },
                  swatch: {
                    width: '20px',
                    height: '20px',
                    position: 'relative'
                  }
                }
              }}
              width="180px"
              className="compact-picker"
            />
            {colorCombinations.map((combination) => (
              <div
                key={combination.background}
                className="compact-picker__swatch"
                style={{ backgroundColor: combination.background }}
                data-name={combination.name}
              />
            ))}
          </div>
        )}
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
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onAddTag={(newTags) => {
          const uniqueTags = Array.from(new Set([...tags, ...newTags]));
          setTags(uniqueTags);
          handleAddTag(data.id, uniqueTags, (tag) =>
            setTags((prev) => [...prev, tag])
          );
        }}
        onRemoveTag={(tagToRemove) => {
          const updatedTags = tags.filter((tag) => tag !== tagToRemove);
          setTags(updatedTags);
          handleAddTag(data.id, updatedTags, () => {});
        }}
        existingTags={tags}
      />
    </div>
  );
};

export default NoteNodeEdit;
