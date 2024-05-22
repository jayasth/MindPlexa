import { useStore } from '@/app/store/useCanvasStore';
import { nanoid } from 'nanoid';
import { nodeDimensions } from './nodeProperties';

export const getContrastYIQ = (color: string) => {
  let r, g, b;

  if (color.startsWith('#')) {
    // Hex color
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    // RGB color
    const rgb = color.match(/\d+/g);
    if (rgb) {
      r = parseInt(rgb[0]);
      g = parseInt(rgb[1]);
      b = parseInt(rgb[2]);
    }
  }

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#575757' : '#F4F4F4';
};

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
  color: string,
  onChangeColor: (color: string) => void
) => {
  const { updateNode } = useStore.getState();
  const textColor = getContrastYIQ(color);
  onChangeColor(color);
  updateNode(id, { data: { backgroundColor: color, textColor } });
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
  const { nodes, addNode, setSelectedNodes } = useStore.getState();
  const nodeToDuplicate = nodes.find((node) => node.id === id);
  if (nodeToDuplicate) {
    const nodeDimension =
      nodeDimensions[nodeToDuplicate.type as keyof typeof nodeDimensions];
    const isEditing = nodeToDuplicate.data.isEditing;
    const nodeWidth =
      isEditing && 'editWidth' in nodeDimension
        ? nodeDimension.editWidth
        : nodeToDuplicate.width;
    const nodeHeight =
      isEditing && 'editHeight' in nodeDimension
        ? nodeDimension.editHeight
        : nodeToDuplicate.height;

    // Calculate a new position near the original node
    let newPosition = {
      x: nodeToDuplicate.position.x + (nodeWidth || 0) / 2 - 50,
      y: nodeToDuplicate.position.y + (nodeHeight || 0) + 50
    };

    // Ensure the new position does not overlap with existing nodes
    let attempts = 0;
    const maxAttempts = 100;
    const padding = 20; // Additional padding to avoid overlap

    while (
      nodes.some((node) => {
        const nodeSize =
          nodeDimensions[node.type as keyof typeof nodeDimensions];
        return (
          Math.abs(node.position.x - newPosition.x) <
            nodeSize.width + padding &&
          Math.abs(node.position.y - newPosition.y) < nodeSize.height + padding
        );
      }) &&
      attempts < maxAttempts
    ) {
      newPosition = {
        x: newPosition.x + padding,
        y: newPosition.y + padding
      };
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.error(
        'Failed to find optimal position for duplicate node: Canvas might be too crowded.'
      );
      return;
    }

    const newData = JSON.parse(JSON.stringify(nodeToDuplicate.data));

    const newId = `${nodeToDuplicate.type}-${nanoid()}`;
    newData.id = newId;

    const newNode = {
      ...nodeToDuplicate,
      id: newId,
      position: newPosition,
      data: newData
    };
    addNode(newNode);
    setSelectedNodes([newNode.id]);
  }
};
