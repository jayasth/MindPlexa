import { useStore } from '@/app/store/useCanvasStore';
import {
  handleTitleChange,
  handleContentChange,
  handleSave,
  handleClose,
  handleDelete,
  handleChangeColor,
  handleAddTag,
  handleAttachFile
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';

export const useTitleChange = (
  nodeId: string,
  onChangeTitle: (title: string) => void
) => {
  return (title: string) => {
    handleTitleChange(nodeId, title, onChangeTitle);
  };
};

export const useContentChange = (
  nodeId: string,
  onChangeContent: (content: string) => void
) => {
  return (content: string) => {
    handleContentChange(nodeId, content, onChangeContent);
  };
};

export const useSave = (nodeId: string, onSave: () => void) => {
  return () => {
    handleSave(nodeId, onSave);
  };
};

export const useClose = (nodeId: string) => {
  return () => {
    handleClose(nodeId);
  };
};

export const useDelete = (nodeId: string, onDelete: () => void) => {
  return () => {
    handleDelete(nodeId, onDelete);
  };
};

export const useChangeColor = (nodeId: string) => {
  return (color: string) => {
    handleChangeColor(nodeId, color, (newColor) => {});
  };
};

export const useAddTag = (
  nodeId: string,
  tags: string[],
  onAddTag: (tag: string) => void
) => {
  return () => {
    handleAddTag(nodeId, tags, (newTag) => {
      onAddTag(newTag);
    });
  };
};

export const useAttachFile = (
  nodeId: string,
  onAttachFile: (file: File) => void
) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      handleAttachFile(nodeId, onAttachFile)(event);
    }
  };
};
