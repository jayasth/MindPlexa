import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
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
  TagModal,
  FileModal,
  ColorPickerModal
} from '@/ui/nodes/common/CommonNodeComponents';
import TagFileContainer from '@/ui/nodes/common/TagFileContainer';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  colorCombinations,
  handleAddTag,
  handleRemoveAttachedFile,
  handleDuplicate,
  handleAttachmentPreview
} from '@/ui/nodes/common/CommonNodeFunctions';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Database } from '@/types_db';
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';
import { updateNode } from '@/utils/canvas/nodeEdgeDatabaseOperations';

interface NoteNodeEditProps extends NodeProps {
  data: Database['public']['Tables']['note_nodes']['Row'] &
    Database['public']['Tables']['common_node_properties']['Row'];
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
    data.background_color || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.text_color || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [attachedFiles, setAttachedFiles] = useState<string[]>(
    Array.isArray(data.attached_files)
      ? data.attached_files.map((file) => {
          if (typeof file === 'object' && file !== null && 'name' in file) {
            return file.name as string;
          }
          return '';
        })
      : []
  );
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  const handleBackgroundColorChange = useBackgroundColorChange(
    data.id,
    setBackgroundColor,
    setTextColor
  );

  const onChangeColor = (color: { hex: string }) => {
    handleBackgroundColorChange(color);
  };

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
    // Convert attachedFiles to a JSON serializable format
    const attachedFilesJson = attachedFiles.map((file) => ({
      name: file
    }));

    updateNode(
      data.id,
      {
        title,
        tags,
        attached_files: attachedFilesJson,
        background_color: backgroundColor,
        text_color: textColor,
        edit_width: nodeWidth,
        edit_height: nodeHeight
      },
      { content },
      'note'
    );
  }, [
    title,
    content,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    nodeWidth,
    nodeHeight,
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

  const onAddTag = (newTags: string[]) => {
    const uniqueTags = Array.from(new Set([...tags, ...newTags]));
    setTags(uniqueTags);
    handleAddTag(data.id, uniqueTags, () => {});
  };

  const onRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    handleAddTag(data.id, updatedTags, () => {});
  };

  const onAttachFiles = (files: string[]) => {
    setAttachedFiles(files);
  };

  const onRemoveFile = (fileToRemove: string) => {
    handleRemoveAttachedFile(data.id, fileToRemove, () => {});
  };

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  useEffect(() => {
    setTags(data.tags || []);
    setAttachedFiles(
      Array.isArray(data.attached_files)
        ? data.attached_files.map((file) => {
            if (typeof file === 'object' && file !== null && 'name' in file) {
              return file.name as string;
            }
            return '';
          })
        : []
    );
  }, [data.tags, data.attached_files]);

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
        <TagFileContainer
          tags={tags}
          attachedFiles={attachedFiles}
          onRemoveTag={onRemoveTag}
          onRemoveFile={onRemoveFile}
          textColor={textColor}
          handleAttachmentPreview={handleAttachmentPreview}
        />
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
        <DeleteButton onClick={() => handleDelete(data.id, () => {}, 'note')} />
        <ChangeColorButton onClick={() => toggleColorPicker()} />
        <AddTagButton onClick={() => setIsTagModalOpen(true)} />
        <AttachFileButton onClick={() => setIsFileModalOpen(true)} />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        <ColorPickerModal
          isOpen={isColorPickerVisible}
          onClose={() => setIsColorPickerVisible(false)}
          currentColor={backgroundColor}
          onChangeColor={onChangeColor}
          colorCombinations={colorCombinations}
        />
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
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        existingTags={tags}
      />
      <FileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onAttachFiles={onAttachFiles}
        onRemoveFile={onRemoveFile}
        existingFiles={attachedFiles}
        data={data}
      />
    </div>
  );
};

export default NoteNodeEdit;
