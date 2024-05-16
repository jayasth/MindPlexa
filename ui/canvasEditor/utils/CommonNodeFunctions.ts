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

export const handleSave = (id: string, onSave: () => void, nodeData: any) => {
  const { updateNode, toggleEditMode } = useStore.getState();
  onSave();
  updateNode(id, { data: nodeData });
  toggleEditMode(id);
};

export const handleClose = (id: string) => {
  const { toggleEditMode } = useStore.getState();
  toggleEditMode(id);
};

export const handleDelete = (id: string, onDelete: () => void) => {
  const { removeNode, setEdges } = useStore.getState();
  if (window.confirm('Are you sure you want to delete this node?')) {
    onDelete();
    removeNode(id);
    // Update edges to remove any that are connected to the deleted node
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id)
    );
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
  onAttachFile: (files: File[]) => void
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxFiles = 3;
    const maxFileSize = 2 * 1024 * 1024; // 2 MB in bytes
    const allowedFileTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'text/plain'
    ];

    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, maxFiles);
      const validFiles = files.filter((file) => {
        return allowedFileTypes.includes(file.type) && file.size <= maxFileSize;
      });

      if (validFiles.length > 0) {
        onAttachFile(validFiles);
        const { updateNode } = useStore.getState();
        const existingFiles =
          useStore.getState().nodes.find((n) => n.id === id)?.data
            ?.attachedFiles || [];
        updateNode(id, {
          data: { attachedFiles: [...existingFiles, ...validFiles] }
        });
        return validFiles;
      } else {
        alert(
          'Please select valid files. Only JPEG, PNG, PDF, and TXT files under 2MB.'
        );
      }
    }
    return null;
  };
};
