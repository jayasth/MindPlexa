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
import { Artboard, ArtboardRef } from '@/ui/nodes/drawNode/DrawNodeTools';
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
import { initializeTools } from './toolInitialization';
import { useHistory } from './drawNodeHistory';
import { exportSVG } from './utils/svgExport';
import { Layer } from './types';
import ResizableArtboardMask from './components/ResizableArtboardMask';

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
  const [zoomLevel, setZoomLevel] = useState(data.zoomLevel || 1);
  const [tools] = useState(initializeTools());
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [toolSettings, setToolSettings] = useState(
    tools.map((tool) => ({
      name: tool.tool.name,
      color: tool.defaultColor,
      strokeWidth: tool.defaultStrokeWidth,
      opacity: 100,
      blendMode: 'normal'
    }))
  );
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [layers, setLayers] = useState<Layer[]>(
    Array.isArray(data.layers) && data.layers.length > 0
      ? data.layers
      : [{ id: '1', name: 'Layer 1', visible: true, content: '', zIndex: 0 }]
  );
  const [activeLayerId, setActiveLayerId] = useState('1');

  const currentTool = tools[currentToolIndex];
  const currentToolSetting = toolSettings[currentToolIndex];

  const artboardRef = useRef<ArtboardRef | null>(null);
  const { history, undo, redo, clear, canUndo, canRedo } = useHistory();

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

  const updateNode = useNodeStore((state) => state.updateNode);

  const updateDrawNodeData = useCallback(
    debounce(async (newData: Partial<any>) => {
      try {
        await updateNode(data.id, { data: { ...data, ...newData } }, 'draw');
      } catch (error) {
        console.error('Error updating draw node:', error);
      }
    }, 500),
    [data.id, updateNode]
  );

  useEffect(() => {
    return () => {
      updateDrawNodeData.cancel();
      removeAllPreviews();
    };
  }, [updateDrawNodeData]);

  useEffect(() => {
    const commonData = {
      title,
      backgroundColor,
      textColor,
      editWidth: nodeWidth,
      editHeight: nodeHeight
    };

    const specificData = {
      drawingData,
      tags,
      attachedFiles,
      zoomLevel
    };

    updateDrawNodeData({ ...commonData, ...specificData });
  }, [
    title,
    drawingData,
    backgroundColor,
    textColor,
    nodeWidth,
    nodeHeight,
    tags,
    attachedFiles,
    zoomLevel,
    updateDrawNodeData
  ]);

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
      if (onResize) {
        onResize();
      }
    },
    [data.id, onNodeResizeStop, position, onResize]
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

  const toggleLayerPanel = useCallback(() => {
    setShowLayerPanel((prev) => !prev);
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

  const handleDrawingChange = useCallback(
    async (newDrawingData: string) => {
      const svgContent = exportSVG(artboardRef.current?.canvas);
      setDrawingData(svgContent);
      updateDrawNodeData({ drawingData: svgContent });
    },
    [updateDrawNodeData]
  );

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom * 1.1, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom / 1.1, 0.1));
  };

  const handleToolSettingChange = useCallback(
    (toolIndex: number, key: string, value: any) => {
      setToolSettings((prev) =>
        prev.map((setting, index) =>
          index === toolIndex ? { ...setting, [key]: value } : setting
        )
      );
    },
    []
  );

  const addLayer = useCallback(() => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      content: '',
      zIndex: layers.length
    };
    setLayers((prevLayers) => [newLayer, ...prevLayers]);
    setActiveLayerId(newLayer.id);
    updateDrawNodeData({ layers: [newLayer, ...layers] });
  }, [layers, updateDrawNodeData]);

  const toggleLayerVisibility = useCallback(
    (id: string) => {
      setLayers((prevLayers) =>
        prevLayers.map((layer) =>
          layer.id === id ? { ...layer, visible: !layer.visible } : layer
        )
      );
      updateDrawNodeData({ layers });
    },
    [layers, updateDrawNodeData]
  );

  const deleteLayer = useCallback(
    (id: string) => {
      if (layers.length > 1) {
        const newLayers = layers.filter((layer) => layer.id !== id);
        setLayers(newLayers);
        if (activeLayerId === id) {
          setActiveLayerId(newLayers[0].id);
        }
        updateDrawNodeData({ layers: newLayers });
      }
    },
    [layers, activeLayerId, updateDrawNodeData]
  );

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
            handleClose(data.id, () => {}, title, drawingData, canvasId)
          }
        />
      </div>
      <DrawNodeTopbar
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        download={() => artboardRef.current?.download()}
        clear={() => {
          clear();
        }}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        backgroundColor={backgroundColor}
        textColor={textColor}
        tools={tools}
        toolSettings={toolSettings}
        onToolSettingChange={handleToolSettingChange}
        currentToolIndex={currentToolIndex}
        toggleLayerPanel={toggleLayerPanel}
        showLayerPanel={showLayerPanel}
        layers={layers}
        setLayers={setLayers}
        activeLayerId={activeLayerId}
        setActiveLayerId={setActiveLayerId}
      />
      <div className={styles.drawContent}>
        <DrawNodeSidebar
          tools={tools}
          currentToolIndex={currentToolIndex}
          setCurrentToolIndex={(index) => {
            setCurrentToolIndex(index);
            setToolSettings((prev) =>
              prev.map((setting, i) =>
                i === index
                  ? {
                      ...setting,
                      color: tools[i].defaultColor,
                      strokeWidth: tools[i].defaultStrokeWidth
                    }
                  : setting
              )
            );
          }}
          textColor={textColor}
          backgroundColor={backgroundColor}
        />
        <div
          className={`${styles.mainContent} ${showLayerPanel ? styles.withLayerPanel : ''}`}
        >
          <div className={`${styles.artboardContainer} nodrag nowheel`}>
            <ResizableArtboardMask
              initialWidth={nodeWidth * 0.8}
              initialHeight={nodeHeight * 0.6}
            >
              <Artboard
                tool={currentTool.tool}
                ref={artboardRef}
                style={{ border: '1px gray solid' }}
                content={drawingData}
                onContentChange={handleDrawingChange}
                width={nodeWidth}
                height={nodeHeight}
                zoomLevel={zoomLevel}
                color={currentToolSetting.color}
                strokeWidth={currentToolSetting.strokeWidth}
                opacity={currentToolSetting.opacity}
                blendMode={currentToolSetting.blendMode}
                layers={layers}
                activeLayerId={activeLayerId}
                onLayerContentChange={(layerId, content) => {
                  const updatedLayers = layers.map((layer) =>
                    layer.id === layerId ? { ...layer, content } : layer
                  );
                  setLayers(updatedLayers);
                  updateDrawNodeData({ layers: updatedLayers });
                }}
                settings={toolSettings}
              />
            </ResizableArtboardMask>
          </div>
          {showLayerPanel && (
            <div className={styles.layerPanelContainer}>
              <LayerPanel
                layers={layers}
                setLayers={setLayers}
                activeLayerId={activeLayerId}
                setActiveLayerId={setActiveLayerId}
                addLayer={addLayer}
                toggleLayerVisibility={toggleLayerVisibility}
                deleteLayer={deleteLayer}
              />
            </div>
          )}
        </div>
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
