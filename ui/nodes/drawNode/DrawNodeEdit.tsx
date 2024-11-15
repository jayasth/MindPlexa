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
import Artboard, { ArtboardRef } from './components/DrawNodeArtboard';
import DrawNodeSidebar from './components/DrawNodeSidebar';
import DrawNodeTopbar from './components/DrawNodeTopbar';
import {
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  CloseButton,
  DuplicateButton,
  TagModal,
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
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';
import { debounce } from 'lodash';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import { useInitializeTools } from './toolInitialization';
import ResizableArtboardMask from './components/ResizableArtboardMask';
import {
  updateNodeSpecificData,
  getNodeSpecificData
} from '@/utils/canvas/nodeSpecificDataService';
import {
  handleDrawingUpdate,
  getDrawing
} from '@/utils/canvas/drawNodeService';

interface DrawNodeEditProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    backgroundColor?: string;
    textColor?: string;
    drawingData?: string;
    tags?: string[];
    toolSettings?: Array<{
      name: string;
      color: string;
      strokeWidth: number;
      opacity: number;
    }>;
    settings?: Array<{
      name: string;
      color: string;
      strokeWidth: number;
      opacity: number;
    }>;
  };
  width: number;
  height: number;
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
  id,
  width,
  height,
  onNodeResizeStop,
  position,
  onResize
}) => {
  const { canvasId } = useCanvasStore();
  const [title, setTitle] = useState(data.title || 'Untitled Drawing');
  const [drawingData, setDrawingData] = useState(data.drawingData || '');
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialTools = useInitializeTools();
  const [tools] = useState(initialTools);
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [currentTool, setCurrentTool] = useState(tools[0].tool.name);
  const [currentColor, setCurrentColor] = useState(tools[0].defaultColor);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(
    tools[0].defaultStrokeWidth
  );
  const [toolSettings, setToolSettings] = useState(
    () =>
      data.toolSettings ||
      data.settings ||
      tools.map((tool) => ({
        name: tool.tool.name,
        color: tool.defaultColor,
        strokeWidth: tool.defaultStrokeWidth,
        opacity: 100
      }))
  );

  const artboardRef = useRef<ArtboardRef | null>(null);

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
  const { bringNodeToFront } = useNodeStore();

  useEffect(() => {
    bringNodeToFront(data.id);
  }, [data.id, bringNodeToFront]);

  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateDrawNodeData = useCallback(
    debounce(async (newData: Partial<Record<string, unknown>>) => {
      setIsSaving(true);
      try {
        if (newData.drawingData) {
          const result = await handleDrawingUpdate(
            data.id,
            newData.drawingData as string,
            {
              currentTool,
              currentColor,
              currentStrokeWidth,
              settings: toolSettings
            }
          );

          if (result) {
            await updateNode(
              data.id,
              {
                data: {
                  ...data,
                  ...newData,
                  drawingFileUrl: result.drawingFileUrl
                }
              },
              canvasId
            );
          }
        }
      } catch (error) {
        console.error('Error updating draw node:', error);
      } finally {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        const timeout = setTimeout(() => setIsSaving(false), 500);
        saveTimeoutRef.current = timeout;
      }
    }, 500),
    [
      data.id,
      updateNode,
      canvasId,
      currentTool,
      currentColor,
      currentStrokeWidth,
      toolSettings
    ]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadDrawNodeData = async () => {
      setIsLoading(true);
      try {
        const drawNodeData = await getNodeSpecificData(id, 'draw');

        if (drawNodeData) {
          setCurrentTool(
            (drawNodeData.current_tool as string) || tools[0].tool.name
          );
          setCurrentColor(
            (drawNodeData.current_color as string) || tools[0].defaultColor
          );
          setCurrentStrokeWidth(
            (drawNodeData.current_stroke_width as number) ||
              tools[0].defaultStrokeWidth
          );

          if (drawNodeData.settings && Array.isArray(drawNodeData.settings)) {
            setToolSettings(drawNodeData.settings);
          }
        }
      } catch (error) {
        console.error('Error loading draw node data:', error);
      }
      setIsLoading(false);
    };
    loadDrawNodeData();
  }, [id, tools, data.id]);

  const saveSettings = async (
    settingsToSave: Array<{
      name: string;
      color: string;
      strokeWidth: number;
      opacity: number;
    }>
  ) => {
    const updatedData = {
      currentTool,
      currentColor,
      currentStrokeWidth,
      settings: settingsToSave
    };
    await updateNodeSpecificData(id, 'draw', updatedData);
  };

  const handleToolChange = (index: number) => {
    setCurrentTool(tools[index].tool.name);
    setCurrentToolIndex(index);
    saveSettings(toolSettings);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    saveSettings(toolSettings);
  };

  const handleStrokeWidthChange = (width: number) => {
    setCurrentStrokeWidth(width);
    saveSettings(toolSettings);
  };

  const handleToolSettingChange = (
    toolIndex: number,
    key: string,
    value: string | number
  ) => {
    setToolSettings((prevSettings) => {
      const newSettings = [...prevSettings];
      newSettings[toolIndex] = { ...newSettings[toolIndex], [key]: value };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  useEffect(() => {
    return () => {
      updateDrawNodeData.flush();
      updateDrawNodeData.cancel();
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
      currentTool,
      currentColor,
      currentStrokeWidth,
      settings: toolSettings
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
    currentTool,
    currentColor,
    currentStrokeWidth,
    toolSettings,
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
        onRemoveTag={onRemoveTag}
        textColor={textColor}
        attachedFiles={[]}
        onRemoveFile={() => {}}
      />
    ),
    [tags, onRemoveTag, textColor]
  );

  const handleDrawingChange = useCallback(
    (newDrawingData: string) => {
      setDrawingData(newDrawingData);
      updateDrawNodeData({
        drawingData: newDrawingData,
        currentTool,
        currentColor,
        currentStrokeWidth,
        settings: toolSettings
      });
    },
    [
      updateDrawNodeData,
      currentTool,
      currentColor,
      currentStrokeWidth,
      toolSettings
    ]
  );

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const currentDrawing = await getDrawing(id);
          if (currentDrawing && currentDrawing !== drawingData) {
            setDrawingData(currentDrawing);
            if (artboardRef.current) {
              artboardRef.current.loadContent(currentDrawing);
            }
          }
        } catch (error) {
          console.error('Error syncing drawing:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, drawingData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <div
      className={styles.drawNode}
      style={customStyles}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
      data-toolbar-background-color={backgroundColor}
      data-toolbar-text-color={textColor}
    >
      {isSaving && (
        <div className={styles.saveIndicator}>Saving changes...</div>
      )}
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
            handleClose(data.id, () => {}, title, { drawingData }, canvasId)
          }
        />
      </div>
      <DrawNodeTopbar
        download={() => artboardRef.current?.download()}
        clear={() => {
          if (artboardRef.current) {
            artboardRef.current.clear();
            updateDrawNodeData({
              drawingData:
                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==',
              currentTool,
              currentColor,
              currentStrokeWidth,
              settings: toolSettings
            });
          }
        }}
        backgroundColor={backgroundColor}
        textColor={textColor}
        tools={tools.map((tool) => ({ name: tool.tool.name, icon: tool.icon }))}
        toolSettings={toolSettings}
        onToolSettingChange={handleToolSettingChange}
        currentToolIndex={currentToolIndex}
        currentColor={currentColor}
        currentStrokeWidth={currentStrokeWidth}
        onColorChange={handleColorChange}
        onStrokeWidthChange={handleStrokeWidthChange}
        nodeId={id}
      />
      <div className={styles.drawContent}>
        <DrawNodeSidebar
          tools={tools}
          currentToolIndex={currentToolIndex}
          textColor={textColor}
          onToolChange={handleToolChange}
        />
        <div className={styles.mainContent}>
          <div className={`${styles.artboardContainer} nodrag nowheel`}>
            <ResizableArtboardMask
              initialWidth={nodeWidth * 0.8}
              initialHeight={nodeHeight * 0.6}
            >
              <Artboard
                ref={artboardRef}
                tool={tools[currentToolIndex].tool}
                width={nodeWidth * 0.8}
                height={nodeHeight * 0.6}
                color={currentTool === 'Eraser' ? '#FFFFFF' : currentColor}
                strokeWidth={currentStrokeWidth}
                opacity={toolSettings[currentToolIndex]?.opacity ?? 100}
                onContentChange={handleDrawingChange}
                content={drawingData}
              />
            </ResizableArtboardMask>
          </div>
        </div>
      </div>
      {tags.length > 0 && memoizedTagFileContainer}
      <div className={styles.footer}>
        <DeleteButton onClick={() => setIsDeleteModalOpen(true)} />
        <ChangeColorButton onClick={toggleColorPicker} />
        <AddTagButton onClick={() => setIsTagModalOpen(true)} />
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
      <NodeDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default React.memo(DrawNodeEdit);
