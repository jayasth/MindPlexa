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
import { useInitializeTools } from './toolInitialization';
import { useHistory } from './drawNodeHistory';
import ResizableArtboardMask from './components/ResizableArtboardMask';
import {
  updateNodeSpecificData,
  getNodeSpecificData
} from '@/utils/canvas/nodeSpecificDataService';
import { saveDrawing, removeDrawing } from '@/utils/canvas/drawNodeService';

interface DrawNodeEditProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    backgroundColor?: string;
    textColor?: string;
    drawingData?: string;
    tags?: string[];
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
  const [drawingData, setDrawingData] = useState<string>(
    data.drawingData || ''
  );
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
  const [tools] = useState(useInitializeTools());
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [currentTool, setCurrentTool] = useState(tools[0].tool.name);
  const [currentColor, setCurrentColor] = useState(tools[0].defaultColor);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(
    tools[0].defaultStrokeWidth
  );
  const [toolSettings, setToolSettings] = useState(() =>
    tools.map((tool) => ({
      name: tool.tool.name,
      color: tool.defaultColor,
      strokeWidth: tool.defaultStrokeWidth,
      opacity: 100
    }))
  );

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
  const { bringNodeToFront } = useNodeStore();

  useEffect(() => {
    bringNodeToFront(data.id);
  }, [data.id, bringNodeToFront]);

  const updateDrawNodeData = debounce(
    async (newData: Partial<Record<string, unknown>>) => {
      try {
        await updateNode(data.id, { data: { ...data, ...newData } }, canvasId);
        await updateNodeSpecificData(id, 'draw', {
          current_tool: newData.currentTool,
          current_color: newData.currentColor,
          current_stroke_width: newData.currentStrokeWidth,
          settings: newData.settings
        });
      } catch (error) {
        console.error('Error updating draw node:', error);
      }
    },
    500
  );

  const saveSettings = useCallback(
    async (settingsToSave: typeof toolSettings) => {
      const updatedData = {
        current_tool: currentTool,
        current_color: currentColor,
        current_stroke_width: currentStrokeWidth,
        settings: settingsToSave
      };
      await updateNodeSpecificData(id, 'draw', updatedData);
    },
    [id, currentTool, currentColor, currentStrokeWidth]
  );

  useEffect(() => {
    const loadDrawNodeData = async () => {
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
        } else {
          const defaultSettings = tools.map((tool) => ({
            name: tool.tool.name,
            color: tool.defaultColor,
            strokeWidth: tool.defaultStrokeWidth,
            opacity: 100
          }));
          setToolSettings(defaultSettings);
          await saveSettings(defaultSettings);
        }
      } else {
        const initialSettings = tools.map((tool) => ({
          name: tool.tool.name,
          color: tool.defaultColor,
          strokeWidth: tool.defaultStrokeWidth,
          opacity: 100
        }));
        setToolSettings(initialSettings);
        await saveSettings(initialSettings);
      }
    };
    loadDrawNodeData();
  }, [id, tools, saveSettings]);

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
      return newSettings;
    });
    saveSettings(toolSettings);
  };

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
    attachedFiles,
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

  const customStyles: CSSProperties = useMemo(
    () => ({
      width: nodeWidth,
      height: nodeHeight,
      backgroundColor,
      color: textColor
    }),
    [nodeWidth, nodeHeight, backgroundColor, textColor]
  );

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleteModalOpen(false);
    await removeDrawing(data.id); // Add this line to remove the drawing
    handleDeleteNode(data.id, canvasId);
  }, [data.id, canvasId]);

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
      setDrawingData(newDrawingData);
      try {
        const result = await saveDrawing(id, newDrawingData);
        if (result?.drawingFileUrl) {
          await updateNodeSpecificData(id, 'draw', {
            drawing_file_url: result.drawingFileUrl,
            currentTool,
            currentColor,
            currentStrokeWidth,
            settings: toolSettings
          });
        }
      } catch (error) {
        console.error('Error updating drawing:', error);
      }
      if (artboardRef.current?.canvas) {
        history.pushState(artboardRef.current.canvas);
      }
    },
    [id, currentTool, currentColor, currentStrokeWidth, toolSettings, history]
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
            handleClose(data.id, () => {}, title, { drawingData }, canvasId)
          }
        />
      </div>
      <DrawNodeTopbar
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        download={() => artboardRef.current?.download()}
        clear={async () => {
          clear();
          if (artboardRef.current) {
            artboardRef.current.clear();
          }
          await saveDrawing(
            id,
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=='
          );
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
          tools={tools.map((tool) => ({
            tool: { name: tool.tool.name },
            icon: tool.icon
          }))}
          currentToolIndex={currentToolIndex}
          textColor={textColor}
          currentTool={currentTool}
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

export default React.memo(DrawNodeEdit);
