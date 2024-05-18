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

export const handleClose = (
  nodeId: string,
  onClose: () => void,
  title: string,
  content: string
) => {
  const { updateNode, toggleEditMode } = useStore.getState();
  updateNode(nodeId, { data: { title, content } });
  onClose();
  toggleEditMode(nodeId);
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
  onChangeColor(backgroundColor);
  const { updateNode } = useStore.getState();
  updateNode(id, { data: { backgroundColor } });
};

export const handleAddTag = (
  id: string,
  tags: string[],
  onAddTag: (tag: string) => void
) => {
  const newTag = prompt('Enter new tag');
  if (newTag) {
    onAddTag(newTag);
    const { updateNode } = useStore.getState();
    updateNode(id, { data: { tags: [...tags, newTag] } });
  }
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

export const handleDuplicate = (id: string) => {
  // New duplicate functionality
  const { nodes, addNode } = useStore.getState();
  const nodeToDuplicate = nodes.find((node) => node.id === id);
  if (nodeToDuplicate) {
    const newNode = {
      ...nodeToDuplicate,
      id: `${id}-copy`,
      position: {
        x: nodeToDuplicate.position.x + 20,
        y: nodeToDuplicate.position.y + 20
      }
    };
    addNode(newNode);
  }
};
