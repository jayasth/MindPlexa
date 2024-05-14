import { useStore } from '@/app/store/useCanvasStore';

export const handleTitleChange = (
  id: string,
  title: string,
  onChangeTitle: (title: string) => void
) => {
  const { updateNode } = useStore.getState();
  onChangeTitle(title);
  updateNode(id, { data: { title } });
};

export const handleSave = (id: string, onSave: () => void) => {
  const { toggleEditMode } = useStore.getState();
  onSave();
  toggleEditMode(id);
};

export const handleClose = (id: string) => {
  const { toggleEditMode } = useStore.getState();
  toggleEditMode(id);
};

export const handleDelete = (id: string, onDelete: () => void) => {
  const { toggleEditMode } = useStore.getState();
  if (window.confirm('Are you sure you want to delete this node?')) {
    onDelete();
    toggleEditMode(id);
  }
};

export const handleChangeColor = (
  id: string,
  backgroundColor: string,
  onChangeColor: (color: string) => void
) => {
  const newColor = prompt('Enter new background color (e.g., #FFFFFF)');
  if (newColor) {
    onChangeColor(newColor);
    const { updateNode } = useStore.getState();
    updateNode(id, { style: { backgroundColor: newColor } });
    return newColor;
  }
  return backgroundColor;
};

export const handleAddTag = (
  id: string,
  tags: string[],
  onAddTag: (tag: string) => void
) => {
  const newTag = prompt('Enter new tag');
  if (newTag) {
    onAddTag(newTag);
    const updatedTags = [...tags, newTag];
    const { updateNode } = useStore.getState();
    updateNode(id, { data: { tags: updatedTags } });
    return updatedTags;
  }
  return tags;
};

export const handleAttachFile = (
  id: string,
  onAttachFile: (file: File) => void
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onAttachFile(file);
      const { updateNode } = useStore.getState();
      updateNode(id, { data: { attachedFile: file } });
      return file;
    }
    return null;
  };
};

export const handleNodeResize = (
  id: string,
  newWidth: number,
  newHeight: number,
  onResize: (width: number, height: number) => void
) => {
  const { updateNode } = useStore.getState();
  onResize(newWidth, newHeight);
  updateNode(id, { width: newWidth, height: newHeight });
};
