import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useMemo,
  useCallback
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import styles from './NoteNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
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
import NodeDeleteConfirmationModal from '@/ui/nodes/common/NodeDeleteConfirmationModal';
import TagFileContainer from '@/ui/nodes/common/TagFileContainer';
import {
  handleTitleChange,
  handleClose,
  handleDelete as handleDeleteNode,
  colorCombinations,
  handleAddTag,
  handleDuplicate
} from '@/ui/nodes/common/CommonNodeFunctions';
import {
  Attachment,
  removeAttachment,
  getAttachments,
  removeAllPreviews
} from '@/utils/canvas/attachmentService';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';
import { debounce } from 'lodash';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import QuillErrorBoundary from '@/ui/nodes/noteNode/QuillErrorBoundary';

interface NoteNodeEditProps extends NodeProps {
  data: {
    id: string;
    title: string;
    content: string;
    backgroundColor: string;
    textColor: string;
    tags: string[];
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
  onNodeResizeStop,
  position
}) => {
  console.log('NoteNodeEdit: Node details:', {
    id: data.id,
    title: data.title,
    content: data.content,
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    width,
    height,
    position
  });

  const { canvasId } = useCanvasStore();
  const [title, setTitle] = useState(data.title || 'Untitled Note');
  const [content, setContent] = useState(data.content || '');
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  const handleBackgroundColorChange = useBackgroundColorChange(
    data.id,
    setBackgroundColor,
    setTextColor
  );

  const onChangeColor = useCallback(
    (color: { hex: string }) => {
      handleBackgroundColorChange(color);
    },
    [handleBackgroundColorChange]
  );

  // First, modify the initialization to use a ref for initial content
  const initialContentRef = useRef(data.content || '');

  const initializeQuill = useCallback(() => {
    if (!quillRef.current) return;

    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      // Clean up any existing Quill instances and toolbars
      const existingToolbar = quillRef.current?.previousSibling as HTMLElement;
      if (existingToolbar?.classList.contains('ql-toolbar')) {
        existingToolbar.remove();
      }

      if (quillInstance.current) {
        quillInstance.current = null;
      }

      // Initialize new Quill instance
      quillInstance.current = new Quill(quillRef.current!, {
        theme: 'snow',
        placeholder: 'Start writing...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ align: [] }],
            ['clean']
          ]
        }
      });

      // Set initial content with a check
      if (initialContentRef.current && quillInstance.current) {
        quillInstance.current.root.innerHTML = initialContentRef.current;
        quillInstance.current.update();
      }

      // Add change handler
      quillInstance.current.on('text-change', () => {
        if (quillInstance.current) {
          const newContent = quillInstance.current.root.innerHTML;
          setContent(newContent);
        }
      });
    }, 100); // Small delay to ensure DOM is ready
  }, []);

  // Modify the content synchronization effect
  useEffect(() => {
    const syncContent = () => {
      if (quillInstance.current && data.content) {
        const currentContent = quillInstance.current.root.innerHTML;
        if (currentContent !== data.content) {
          quillInstance.current.root.innerHTML = data.content;
          quillInstance.current.update();
          console.log('Content synced:', {
            previous: currentContent,
            new: data.content
          });
        }
      }
    };

    // Add retry mechanism
    let retryCount = 0;
    const maxRetries = 3;

    const attemptSync = () => {
      if (!quillInstance.current && retryCount < maxRetries) {
        retryCount++;
        setTimeout(attemptSync, 500);
        return;
      }
      syncContent();
    };

    attemptSync();

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncContent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [data.content]);

  const debouncedUpdateNodeData = useMemo(
    () =>
      debounce(async (commonData, specificData) => {
        try {
          const updateNode = useNodeStore.getState().updateNode;
          await updateNode(
            data.id,
            { ...commonData, data: specificData },
            'note'
          );
        } catch (error) {
          console.error('Error updating node:', error);
        }
      }, 500),
    [data.id]
  );

  useEffect(() => {
    initializeQuill();

    return () => {
      if (quillInstance.current) {
        quillInstance.current = null;
      }
      const toolbar = quillRef.current?.previousSibling as HTMLElement;
      if (toolbar?.classList.contains('ql-toolbar')) {
        toolbar.remove();
      }
      debouncedUpdateNodeData.cancel();
      removeAllPreviews();
    };
  }, [initializeQuill, debouncedUpdateNodeData]);

  useEffect(() => {
    const commonData = {
      title,
      backgroundColor,
      textColor,
      editWidth: nodeWidth,
      editHeight: nodeHeight
    };

    const specificData = { content, tags, attachedFiles };

    debouncedUpdateNodeData(commonData, specificData);
  }, [
    title,
    content,
    backgroundColor,
    textColor,
    nodeWidth,
    nodeHeight,
    tags,
    attachedFiles,
    debouncedUpdateNodeData
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

  const onChangeTitle = useCallback(
    (newTitle: string) => {
      handleTitleChange(data.id, newTitle, setTitle, canvasId);
    },
    [data.id, canvasId]
  );

  const onAddTag = useCallback(
    (newTags: string[]) => {
      const uniqueTags = Array.from(new Set([...tags, ...newTags]));
      setTags(uniqueTags);
      handleAddTag(data.id, [...uniqueTags], () => {}, canvasId);
    },
    [data.id, tags, canvasId]
  );

  const onRemoveTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(updatedTags);
      handleAddTag(data.id, updatedTags, () => {}, canvasId);
    },
    [data.id, tags, canvasId]
  );

  const onAttachFiles = useCallback(async (files: Attachment[]) => {
    setAttachedFiles(files);
  }, []);

  const onRemoveFile = useCallback(
    async (fileId: string) => {
      await removeAttachment(fileId);
      const updatedAttachments = await getAttachments(data.id);
      setAttachedFiles(updatedAttachments);
    },
    [data.id]
  );

  useEffect(() => {
    const fetchAttachments = async () => {
      const attachments = await getAttachments(data.id);
      setAttachedFiles(attachments);
    };
    fetchAttachments();
  }, [data.id]);

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleResize = useCallback(
    (event, { width, height }) => {
      setNodeWidth(width);
      setNodeHeight(height);
      onNodeResizeStop(data.id, { width, height }, position);
    },
    [data.id, onNodeResizeStop, position]
  );

  const handleContainerClick = useCallback(() => {
    setIsContainerSelected(true);
  }, []);

  const handleContainerBlur = useCallback(() => {
    setIsContainerSelected(false);
  }, []);

  const toggleColorPicker = useCallback(() => {
    setIsColorPickerVisible((prev) => !prev);
  }, []);

  const customStyles: CSSProperties = useMemo(
    () => ({
      width: nodeWidth,
      height: nodeHeight,
      backgroundColor,
      color: textColor
    }),
    [nodeWidth, nodeHeight, backgroundColor, textColor]
  );

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    handleDeleteNode(data.id, canvasId);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const memoizedTagFileContainer = useMemo(
    () => (
      <TagFileContainer
        tags={tags}
        attachedFiles={attachedFiles}
        onRemoveTag={onRemoveTag}
        onRemoveFile={onRemoveFile}
        textColor={textColor}
      />
    ),
    [tags, attachedFiles, onRemoveTag, onRemoveFile, textColor]
  );

  const { bringNodeToFront } = useNodeStore();

  useEffect(() => {
    bringNodeToFront(data.id);
  }, [data.id, bringNodeToFront]);

  useEffect(() => {
    console.log('NoteNodeEdit mounted with content:', {
      dataContent: data.content,
      currentContent: content,
      url: window.location.href,
      quillExists: !!quillInstance.current
    });
  }, [data.content, content]);

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
          onClick={() =>
            handleClose(data.id, () => {}, title, { content }, canvasId)
          }
        />
      </div>
      <QuillErrorBoundary>
        <div
          ref={quillRef}
          className={`${styles.noteContent} nowheel nodrag`}
          style={{ color: textColor }}
        />
      </QuillErrorBoundary>
      {(tags.length > 0 || attachedFiles.length > 0) &&
        memoizedTagFileContainer}
      <div className={styles.footer}>
        <DeleteButton onClick={() => setIsDeleteModalOpen(true)} />
        <ChangeColorButton onClick={toggleColorPicker} />
        <AddTagButton onClick={() => setIsTagModalOpen(true)} />
        <AttachFileButton onClick={() => setIsFileModalOpen(true)} />
        <DuplicateButton onClick={() => handleDuplicate(data.id, canvasId)} />
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
        existingFiles={attachedFiles}
        nodeId={data.id}
      />
      <NodeDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default React.memo(NoteNodeEdit);
