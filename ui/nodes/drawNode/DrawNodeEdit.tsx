import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useCallback,
  useMemo
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import styles from './DrawNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan,
  FaSquare,
  FaCircle,
  FaPen
} from 'react-icons/fa';
import { TbInnerShadowBottomRightFilled } from 'react-icons/tb';
import { IoMdWater } from 'react-icons/io';
import { BsSlashLg } from 'react-icons/bs';
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
import { usePen } from './tools/pen/usePen';
import { useHistory } from '@/ui/nodes/drawNode/drawNodeHistory';
import type { IconType } from 'react-icons/lib';
import DrawNodeSidebar from './components/DrawNodeSidebar';
import DrawNodeTopbar from './components/DrawNodeTopbar';
import LayerPanel from './components/LayerPanel';
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
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';
import { debounce } from 'lodash';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import { Layer } from './types';
import { useRectangle } from './tools/rectangle/useRectangle';
import { useCircle } from './tools/circle/useCircle';
import { useLine } from './tools/line/useLine';
import { ToolSetting } from './types';
import {
  getDrawNodeData,
  updateDrawNodeData
} from '@/utils/canvas/drawNodeService';

interface DrawNodeEditProps extends NodeProps {
  data: any;
  width: number;
  height: number;
  selected: boolean;
  onNodeResizeStop: (
    nodeId: string,
    newSize: { width: number; height: number },
    newPosition: { x: number; y: number }
  ) => void;
  position: { x: number; y: number };
  onResize?: () => void;
}

const DrawNodeEdit: React.FC<DrawNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position,
  onResize
}) => {
  console.log('DrawNodeEdit: Node details:', {
    id: data.id,
    title: data.title,
    drawingData: data.drawingData,
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    width,
    height,
    position
  });

  const { canvasId } = useCanvasStore();
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Drawing');
  const [drawingData, setDrawingData] = useState(data.drawingData || '');
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
  const [color, setColor] = useState('#531B93');
  const [isLayerPanelVisible, setIsLayerPanelVisible] = useState(false);
  const [currentTool, setCurrentTool] = useState(0);
  const [toolSettings, setToolSettings] = useState<ToolSetting[]>([
    {
      name: 'Pen',
      color: '#000000',
      strokeWidth: 5,
      opacity: 100,
      blendMode: 'normal'
    },
    {
      name: 'Line',
      color: '#000000',
      strokeWidth: 2,
      opacity: 100,
      blendMode: 'normal'
    },
    {
      name: 'Rectangle',
      color: '#000000',
      strokeWidth: 2,
      opacity: 100,
      blendMode: 'normal'
    },
    {
      name: 'Circle',
      color: '#000000',
      strokeWidth: 2,
      opacity: 100,
      blendMode: 'normal'
    },
    {
      name: 'Marker',
      color: '#000000',
      strokeWidth: 20,
      opacity: 50,
      blendMode: 'multiply'
    },
    {
      name: 'Brush',
      color: '#000000',
      strokeWidth: 20,
      opacity: 100,
      blendMode: 'normal'
    },
    {
      name: 'Watercolor',
      color: '#000000',
      strokeWidth: 20,
      opacity: 30,
      blendMode: 'overlay'
    },
    {
      name: 'Airbrush',
      color: '#000000',
      strokeWidth: 20,
      opacity: 20,
      blendMode: 'screen'
    },
    {
      name: 'Shading',
      color: '#000000',
      strokeWidth: 20,
      opacity: 10,
      blendMode: 'multiply'
    },
    {
      name: 'Eraser',
      color: '#ffffff',
      strokeWidth: 40,
      opacity: 100,
      blendMode: 'normal'
    }
  ]);
  const [strokeWidth, setStrokeWidth] = useState(
    toolSettings[currentTool].strokeWidth
  );
  const [zoom, setZoom] = useState(1);
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Layer 1', visible: true, locked: false }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('1');
  const [aspectRatio, setAspectRatio] = useState(1);
  const [drawNodeData, setDrawNodeData] = useState<any>(null);

  const artboardRef = useRef<ArtboardRef | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const artboardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDrawNodeData = async () => {
      const fetchedData = await getDrawNodeData(data.id);
      if (fetchedData) {
        setDrawNodeData(fetchedData);
        setDrawingData(fetchedData.drawingFileUrl || '');
        setLayers(
          Array.isArray(fetchedData.layers)
            ? fetchedData.layers
            : [{ id: '1', name: 'Layer 1', visible: true, locked: false }]
        );
        setCurrentTool(fetchedData.currentTool || 0);
        setZoom(fetchedData.zoomLevel || 1);
        if (history) {
          history.clear();
          if (fetchedData.drawingData && artboardRef.current) {
            history.pushState(artboardRef.current.canvas);
          }
        }
      }
    };

    fetchDrawNodeData();
  }, [data.id]);

  useEffect(() => {
    const saveDrawNodeData = async () => {
      if (drawNodeData) {
        await updateDrawNodeData(data.id, {
          drawingData,
          layers,
          currentTool,
          zoomLevel: zoom
        });
      }
    };

    saveDrawNodeData();
  }, [data.id, drawingData, layers, currentTool, zoom]);

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

  const debouncedUpdateNodeData = useMemo(
    () =>
      debounce(async (commonData, specificData) => {
        try {
          const updateNode = useNodeStore.getState().updateNode;
          await updateNode(
            data.id,
            { ...commonData, data: specificData },
            'draw'
          );
        } catch (error) {
          console.error('Error updating node:', error);
        }
      }, 500),
    [data.id]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateNodeData.cancel();
      removeAllPreviews();
    };
  }, [debouncedUpdateNodeData]);

  useEffect(() => {
    const commonData = {
      title,
      backgroundColor,
      textColor,
      editWidth: nodeWidth,
      editHeight: nodeHeight
    };

    const specificData = { drawingData, tags, attachedFiles };

    debouncedUpdateNodeData(commonData, specificData);
  }, [
    title,
    drawingData,
    backgroundColor,
    textColor,
    nodeWidth,
    nodeHeight,
    tags,
    attachedFiles,
    debouncedUpdateNodeData
  ]);

  useEffect(() => {
    if (onResize) {
      onResize();
    }
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context && drawingData) {
      const image = new Image();
      image.onload = () => {
        setAspectRatio(image.width / image.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = drawingData;
    }
  }, [width, height, onResize, drawingData]);

  const artboardSize = useMemo(() => {
    const containerWidth =
      artboardContainerRef.current?.clientWidth || nodeWidth * 0.9;
    const containerHeight =
      artboardContainerRef.current?.clientHeight || nodeHeight * 0.7;
    return {
      width: containerWidth / zoom,
      height: containerHeight / zoom
    };
  }, [nodeWidth, nodeHeight, zoom, artboardContainerRef]);

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
      handleAddTag(data.id, uniqueTags, () => {}, canvasId);
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

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    handleDeleteNode(data.id, canvasId);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const pen = usePen({ color, strokeWidth });
  const line = useLine({ color, strokeWidth });
  const rectangle = useRectangle({ color, strokeWidth });
  const circle = useCircle({ color, strokeWidth });
  const marker = useMarker({ color, strokeWidth });
  const brush = useBrush({ color, strokeWidth });
  const watercolor = useWatercolor({ color, strokeWidth });
  const airbrush = useAirbrush({ color, strokeWidth });
  const shading = useShadingBrush({
    color,
    spreadFactor: (1 / 45) * strokeWidth,
    distanceThreshold: 100
  });
  const eraser = useEraser({ strokeWidth });

  const tools: Array<[ToolHandlers, IconType, number]> = [
    [pen, FaPen, toolSettings[0].strokeWidth],
    [line, BsSlashLg, toolSettings[1].strokeWidth],
    [rectangle, FaSquare, toolSettings[2].strokeWidth],
    [circle, FaCircle, toolSettings[3].strokeWidth],
    [marker, FaMarker, toolSettings[4].strokeWidth],
    [brush, FaPaintBrush, toolSettings[5].strokeWidth],
    [watercolor, IoMdWater, toolSettings[6].strokeWidth],
    [airbrush, FaSprayCan, toolSettings[7].strokeWidth],
    [shading, TbInnerShadowBottomRightFilled, toolSettings[8].strokeWidth],
    [eraser, FaEraser, toolSettings[9].strokeWidth]
  ];

  const handleSizeChange = useCallback(
    (newSize: number) => {
      setStrokeWidth(newSize);
      setToolSettings((prev) => {
        const newSettings = [...prev];
        newSettings[currentTool].strokeWidth = newSize;
        return newSettings;
      });
    },
    [currentTool]
  );

  useEffect(() => {
    setColor(toolSettings[currentTool].color);
    setStrokeWidth(toolSettings[currentTool].strokeWidth);
  }, [currentTool, toolSettings]);

  const {
    undo,
    redo,
    history,
    canUndo,
    canRedo,
    clear: clearHistory
  } = useHistory(drawNodeData?.drawingData || '');
  const [hasDrawing, setHasDrawing] = useState(false);

  useEffect(() => {
    setHasDrawing(drawingData !== '');
  }, [drawingData]);

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

  const download = () => artboardRef.current?.download();
  const handleClear = useCallback(() => {
    if (artboardRef.current) {
      artboardRef.current.clear();
      clearHistory();
      setDrawingData('');
      setHasDrawing(false);
    }
  }, [clearHistory]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  useEffect(() => {
    if (artboardContainerRef.current) {
      const container = artboardContainerRef.current;
      const artboard = container.firstChild as HTMLElement;
      if (artboard) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const artboardWidth = artboard.clientWidth * zoom;
        const artboardHeight = artboard.clientHeight * zoom;

        const left = (containerWidth - artboardWidth) / 2;
        const top = (containerHeight - artboardHeight) / 2;

        artboard.style.transform = `scale(${zoom})`;
        artboard.style.transformOrigin = 'center center';
        artboard.style.left = `${left}px`;
        artboard.style.top = `${top}px`;
      }
    }
  }, [zoom, nodeWidth, nodeHeight]);

  return (
    <div
      className={styles.drawNode}
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
            handleClose(
              data.id,
              () => {},
              title,
              drawNodeData?.drawingData || '',
              canvasId
            )
          }
        />
      </div>
      <DrawNodeTopbar
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        download={download}
        clear={handleClear}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        backgroundColor={backgroundColor}
        textColor={textColor}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={handleSizeChange}
        layers={layers}
        activeLayerId={activeLayerId}
        setLayers={setLayers}
        setActiveLayerId={setActiveLayerId}
        hasDrawing={hasDrawing}
        toolSettings={toolSettings}
        setToolSettings={setToolSettings}
        isLayerPanelVisible={isLayerPanelVisible}
        setIsLayerPanelVisible={setIsLayerPanelVisible}
      />
      <div className={styles.drawContent}>
        <DrawNodeSidebar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          textColor={textColor}
        />
        <div className={styles.mainContent}>
          <div
            className={`${styles.artboardContainer} nodrag nowheel`}
            ref={artboardContainerRef}
          >
            <Artboard
              tool={tools[currentTool][0]}
              ref={artboardRef}
              history={history}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center'
              }}
              drawingData={drawNodeData?.drawingData || ''}
              width={artboardSize.width}
              height={artboardSize.height}
              layers={layers}
              activeLayerId={activeLayerId}
              zoom={zoom}
              onResize={() => {
                if (artboardRef.current) {
                  const dataUrl = artboardRef.current.getImageAsDataUri();
                  setDrawingData(dataUrl || '');
                }
              }}
            />
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        {isLayerPanelVisible && (
          <LayerPanel
            layers={layers}
            setLayers={setLayers}
            activeLayerId={activeLayerId}
            setActiveLayerId={setActiveLayerId}
          />
        )}
      </div>
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
        onRemoveFile={onRemoveFile}
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

export default React.memo(DrawNodeEdit);
