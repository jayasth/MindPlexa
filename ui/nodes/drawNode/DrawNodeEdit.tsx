import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useCallback
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '@/app/store/canvas/useCanvasStore';
import styles from './DrawNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';

import {
  FaPencilAlt,
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan
} from 'react-icons/fa';
import { IoMdWater } from 'react-icons/io';
import {
  useBrush,
  useMarker,
  useAirbrush,
  Artboard,
  ArtboardRef,
  useShadingBrush,
  useEraser,
  useWatercolor,
  ToolHandlers
} from '@/ui/nodes/drawNode/DrawNodeTools';
import { useHistory } from '@/ui/nodes/drawNode/drawNodeHistory';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';
import type { IconType } from 'react-icons/lib';
import DrawNodeToolbar from '@/ui/nodes/drawNode/components/DrawNodeToolbar';
import type { DrawNodeData } from '@/ui/canvasEditor/utils/nodeDatatypes';
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
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';

interface DrawNodeEditProps extends NodeProps {
  data: DrawNodeData;
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

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const DrawNodeEdit: React.FC<DrawNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Drawing');
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [attachedFiles, setAttachedFiles] = useState<File[]>(
    data.attachedFiles || []
  );
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [drawingData, setDrawingData] = useState(data.drawingData || '');
  const [color, setColor] = useState('#531B93');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const artboardInstance = useRef<ArtboardRef | null>(null);

  const brush = useBrush({ color, strokeWidth });
  const marker = useMarker({ color, strokeWidth });
  const watercolor = useWatercolor({ color, strokeWidth });
  const airbrush = useAirbrush({ color, strokeWidth });
  const eraser = useEraser({ strokeWidth });
  const shading = useShadingBrush({
    color,
    spreadFactor: (1 / 45) * strokeWidth,
    distanceThreshold: 100
  });

  const tools: Array<[ToolHandlers, IconType, number]> = [
    [shading, FaPencilAlt, 5],
    [watercolor, IoMdWater, 20],
    [brush, FaPaintBrush, 15],
    [marker, FaMarker, 20],
    [airbrush, FaSprayCan, 10],
    [eraser, FaEraser, 30]
  ];

  const [currentTool, setCurrentTool] = useState(0);

  const { undo, redo, history, canUndo, canRedo } = useHistory();

  const updateNode = useStore((state) => state.updateNode);
  const sizePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodeProperties = getNodeSpecificProperties('draw', true);
    setNodeWidth(nodeProperties.width);
    setNodeHeight(nodeProperties.height);
  }, []);

  useEffect(() => {
    updateNode(data.id, {
      data: {
        title,
        tags,
        attachedFiles,
        textColor,
        backgroundColor,
        drawingData
      }
    });
  }, [
    data.id,
    title,
    tags,
    attachedFiles,
    textColor,
    backgroundColor,
    drawingData,
    updateNode
  ]);

  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sizePickerRef.current &&
        !sizePickerRef.current.contains(event.target as Node)
      ) {
        setSizeOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setStrokeWidth(tools[currentTool][2]);
  }, [currentTool]);

  const handleBackgroundColorChange = useBackgroundColorChange(
    data.id,
    setBackgroundColor,
    setTextColor
  );

  const onChangeColor = (color: { hex: string }) => {
    handleBackgroundColorChange(color);
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

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const onRemoveFile = (fileToRemove: File) => {
    const updatedFiles = attachedFiles.filter((file) => file !== fileToRemove);
    setAttachedFiles(updatedFiles);
    handleRemoveAttachedFile(data.id, fileToRemove, () => {});
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
      className={`${styles.drawNode} ${isSelected ? styles.selected : ''}`}
      style={customStyles}
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
          onChange={(e) => handleTitleChange(data.id, e.target.value, setTitle)}
          className={`${styles.titleInput} nodrag`}
          style={{ color: textColor }}
        />
        <CloseButton
          onClick={() => handleClose(data.id, () => {}, title, drawingData)}
        />
      </div>
      <div className={`${styles.drawContent} nowheel nodrag`}>
        <DrawNodeToolbar
          tools={tools}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          download={() => artboardInstance.current?.download()}
          clear={() => artboardInstance.current?.clear()}
        />
        <div id="artboard" className={styles.artboard}>
          <Artboard
            tool={tools[currentTool][0]}
            ref={artboardInstance}
            history={history}
            style={{ border: '1px gray solid' }}
            content={drawingData}
            width={nodeWidth / 2}
            height={nodeHeight / 2}
          />
        </div>
      </div>
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
              tags,
              attachedFiles,
              backgroundColor,
              textColor,
              drawingData
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
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

export default DrawNodeEdit;
