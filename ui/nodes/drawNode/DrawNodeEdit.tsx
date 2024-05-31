import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useCallback
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './DrawNodeEdit.module.css';
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
  handleDuplicate,
  getContrastYIQ
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import { SketchPicker } from 'react-color';

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

interface DrawNodeEditProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    backgroundColor?: string;
    textColor?: string;
    content?: string;
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
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const [color, setColor] = useState('#531B93');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [sizeOpen, setSizeOpen] = useState(false);
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
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const sizePickerRef = useRef<HTMLDivElement>(null);
  const backgroundColorPickerRef = useRef<HTMLDivElement>(null);

  const handleArtboardResize = useCallback(() => {
    const artboardRef = artboardInstance.current;
    if (artboardRef) {
      const dataUri = artboardRef.getImageAsDataUri();
      setContent(dataUri || '');
    }
  }, []);

  useClickOutside(backgroundColorPickerRef, () =>
    setIsColorPickerVisible(false)
  );

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
        backgroundColor,
        textColor,
        content
      }
    });
  }, [
    data.id,
    title,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    content,
    updateNode
  ]);

  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setIsColorPickerVisible(false);
      }
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

  const onChangeTitle = (value: string) => {
    handleTitleChange(data.id, value, setTitle);
  };

  const onAddTag = (tag: string) => {
    setTags([...tags, tag]);
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleBackgroundColorChange = (color: any) => {
    const newColor = color.hex;
    setBackgroundColor(newColor);
    setTextColor(getContrastYIQ(newColor));
    handleChangeColor(data.id, newColor, () => {});
  };

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  const handleResize = (event, { width, height }) => {
    handleArtboardResize();
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  const handleSaveDrawing = () => {
    const artboardRef = artboardInstance.current;
    if (artboardRef) {
      const dataUri = artboardRef.getImageAsDataUri();
      setContent(dataUri || '');
      handleSave(data.id, () => {}, {
        title,
        tags,
        attachedFiles,
        backgroundColor,
        textColor,
        content: dataUri
      });
    }
  };

  const handleCloseDrawing = () => {
    const artboardRef = artboardInstance.current;
    if (artboardRef) {
      const dataUri = artboardRef.getImageAsDataUri();
      setContent(dataUri || '');
      handleClose(data.id, () => {}, title, dataUri);
    }
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
          onChange={(e) => onChangeTitle(e.target.value)}
          className={`${styles.titleInput} nodrag`}
          style={{ color: textColor }}
        />
        <CloseButton onClick={handleCloseDrawing} />
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
          download={() => {}}
          clear={() => {}}
        />
        <div id="artboard" className={styles.artboard}>
          <Artboard
            tool={tools[currentTool][0]}
            ref={artboardInstance}
            history={history}
            style={{ border: '1px gray solid' }}
            content={content}
            width={nodeWidth / 2}
            height={nodeHeight / 2}
          />
        </div>
      </div>
      <div className={styles.footer}>
        <SaveButton onClick={handleSaveDrawing} />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton onClick={toggleColorPicker} />
        <AddTagButton onClick={() => handleAddTag(data.id, tags, onAddTag)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFiles)(e)}
        />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        {isColorPickerVisible && (
          <div
            className={`${styles.colorPicker} nodrag`}
            ref={backgroundColorPickerRef}
          >
            <SketchPicker
              color={backgroundColor}
              onChange={handleBackgroundColorChange}
            />
          </div>
        )}
      </div>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag} style={{ color: textColor }}>
            {tag}
          </span>
        ))}
      </div>
      {attachedFiles.length > 0 && (
        <div className={styles.attachedFile} style={{ color: textColor }}>
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

export default DrawNodeEdit;
