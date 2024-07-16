import { useNodeStore, useEdgeStore } from '@/app/store';
import { v4 as uuidv4 } from 'uuid';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { createClient } from '@/utils/supabase/supabaseClient';
import {
  removeAttachment,
  getAttachments
} from '@/utils/canvas/attachmentService';
import { duplicateNode } from '@/utils/canvas/nodeService';

const supabase = createClient();

export const getContrastYIQ = (color: string) => {
  let r,
    g,
    b,
    a = 1;

  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    if (hex.length === 8) {
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
  } else if (color.startsWith('rgb')) {
    const rgba = color.match(/\d+(\.\d+)?/g);
    if (rgba) {
      r = parseInt(rgba[0]);
      g = parseInt(rgba[1]);
      b = parseInt(rgba[2]);
      if (rgba[3]) {
        a = parseFloat(rgba[3]);
      }
    }
  }

  r = Math.round(r * a + 255 * (1 - a));
  g = Math.round(g * a + 255 * (1 - a));
  b = Math.round(b * a + 255 * (1 - a));

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#575757' : '#F4F4F4';
};

export const colorCombinations = [
  { background: '#333A2F', text: '#EBEDDF', name: 'Tea green & moss' },
  { background: '#832B00', text: '#F7E5DA', name: 'Clay & beige' },
  {
    background: '#0033E7',
    text: '#E2E2E2',
    name: 'Electric blue & dusty gray'
  },
  {
    background: '#330066',
    text: '#7093FF',
    name: 'Royal purple & periwinkle'
  },
  { background: '#6497D6', text: '#F8F2EB', name: 'Stone blue & sand' },
  { background: '#333333', text: '#AEFFDE', name: 'Neons on black' },
  { background: '#FCE77D', text: '#F96167', name: 'Yellow & red' },
  { background: '#F9D342', text: '#292826', name: 'Yellow & black' },
  { background: '#4831D4', text: '#CCF381', name: 'Blue & green' },
  { background: '#F0A07C', text: '#4A274F', name: 'Orange & purple' },
  { background: '#8BD8BD', text: '#243665', name: 'Blue & turquoise' },
  { background: '#EC8B5E', text: '#141A46', name: 'Orange & blue' },
  { background: '#8AAAE5', text: '#FFFFFF', name: 'Blue & white' },
  { background: '#FFE67C', text: '#295F2D', name: 'Yellow & green' },
  { background: '#F4A950', text: '#161B21', name: 'Orange & black' },
  { background: '#080A52', text: '#ED2188', name: 'Blue & pink' },
  {
    background: '#262223',
    text: '#DDC6B6',
    name: 'Charcoal grey & taupe'
  },
  { background: '#AA96DA', text: '#C5FAD5', name: 'Light purple & mint' },
  {
    background: '#234E70',
    text: '#FBF8BE',
    name: 'Royal blue & pale yellow'
  },
  { background: '#B88746', text: '#191919', name: 'Gold & black' },
  { background: '#533549', text: '#F6B042', name: 'Eggplant & yellow' },
  {
    background: '#99F443',
    text: '#EC449B',
    name: 'Neon green & fuchsia'
  },
  {
    background: '#EE4E34',
    text: '#FCEDDA',
    name: 'Peach & burnt orange'
  },
  { background: '#DBB98F', text: '#96351E', name: 'Beige & rust' },
  {
    background: '#FBF7F4',
    text: '#53A57D',
    name: 'Linen white & jungle green'
  },
  {
    background: '#FF69B4',
    text: '#00FFFF',
    name: 'Cyan & bubblegum pink'
  },
  { background: '#635E87', text: '#CFCAA8', name: 'Purple & sage' },
  {
    background: '#3A6B35',
    text: '#E3B448',
    name: 'Earthy green & mustard'
  },
  { background: '#FFA781', text: '#FB0E2D', name: 'Peach & maroon' },
  {
    background: '#ADEFD1FF',
    text: '#00203FFF',
    name: 'Mint & sailor blue'
  },
  {
    background: '#FCF6F5FF',
    text: '#89ABE3FF',
    name: 'Cream & sky blue'
  },
  {
    background: '#FAD0C9FF',
    text: '#6E6E6DFF',
    name: 'Pink salt & charcoal gray'
  },
  {
    background: '#D7C49EFF',
    text: '#343148FF',
    name: 'Soybean & eclipse'
  },
  { background: '#3C1A5B', text: '#FFF748', name: 'Purple & yellow' },
  { background: '#0B4251', text: '#87BBD7', name: 'Teal & sky blue' },
  { background: '#050505', text: '#616161', name: 'Black & silver' }
];

export const handleChangeColorWithCombination = (
  id: string,
  backgroundColor: string,
  textColor: string,
  onChangeColor: (color: string) => void,
  canvasId: string
) => {
  const { updateNode } = useNodeStore.getState();
  onChangeColor(backgroundColor);
  updateNode(id, { data: { backgroundColor, textColor } }, canvasId);
};

export const handleTitleChange = (
  id: string,
  title: string,
  onChangeTitle: (title: string) => void,
  canvasId: string
) => {
  const { updateNode } = useNodeStore.getState();
  onChangeTitle(title);
  updateNode(id, { data: { title } }, canvasId);
};

export const handleSave = (
  id: string,
  onSave: () => void,
  nodeData: any,
  canvasId: string
) => {
  const { updateNode, toggleEditMode } = useNodeStore.getState();
  onSave();
  updateNode(id, nodeData, canvasId);
  toggleEditMode(id);
};

export const handleClose = (
  nodeId: string,
  onClose: () => void,
  title: string,
  content: any,
  canvasId: string
) => {
  const { updateNode, toggleEditMode } = useNodeStore.getState();
  updateNode(nodeId, { data: { title, content } }, canvasId);
  onClose();
  toggleEditMode(nodeId);
};

export const handleDelete = async (id: string, canvasId: string) => {
  try {
    const attachments = await getAttachments(id);

    for (const attachment of attachments) {
      if (attachment.storage_path) {
        await removeAttachment(attachment.id);
      }
    }

    const { removeNode } = useNodeStore.getState();
    const { setEdges } = useEdgeStore.getState();
    await removeNode(id, canvasId);
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id)
    );
  } catch (error) {
    console.error('Error deleting node:', error);
  }
};

export const handleAddTag = (
  id: string,
  tags: string[],
  onAddTag: (tag: string) => void,
  canvasId: string
) => {
  const { updateNode } = useNodeStore.getState();
  updateNode(id, { data: { tags } }, canvasId);
  tags.forEach((tag) => onAddTag(tag));
};

export const handleDuplicate = async (id: string, canvasId: string) => {
  const { nodes, addNode, setSelectedNodes } = useNodeStore.getState();
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

    let newPosition = {
      x: nodeToDuplicate.position.x + (nodeWidth || 0) / 2 - 50,
      y: nodeToDuplicate.position.y + (nodeHeight || 0) + 50
    };

    let attempts = 0;
    const maxAttempts = 100;
    const padding = 20;

    while (
      nodes.some((node) => {
        const nodeSize =
          nodeDimensions[node.type as keyof typeof nodeDimensions];
        const width = 'width' in nodeSize ? nodeSize.width : nodeSize.viewWidth;
        const height =
          'height' in nodeSize ? nodeSize.height : nodeSize.viewHeight;
        return (
          Math.abs(node.position.x - newPosition.x) < width + padding &&
          Math.abs(node.position.y - newPosition.y) < height + padding
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
    const newId = `${nodeToDuplicate.type}-${uuidv4()}`;
    newData.id = newId;

    if (newData.type === 'text') {
      newData.content = `Copy of ${newData.content}`;
    } else if (newData.type === 'image') {
      newData.url = newData.url;
    } else if (newData.type === 'video') {
      newData.url = newData.url;
    } else if (newData.type === 'file') {
      newData.fileName = `Copy of ${newData.fileName}`;
    }

    if (nodeToDuplicate.data.attachedFiles) {
      newData.attachedFiles = [...nodeToDuplicate.data.attachedFiles];
    }

    if (newData.title) {
      newData.title = `${newData.title} copy`;
    }

    // Insert the duplicated node into the database
    try {
      console.log(
        'CommonNodeFunctions: Duplicating node with nodeId:',
        id,
        'and canvasId:',
        canvasId
      );
      const { success, newNode, error } = await duplicateNode(id, canvasId);
      if (!success) throw error;

      // Add the duplicated node to the state
      const newNodeData = {
        ...nodeToDuplicate,
        id: newNode.id,
        position: newPosition,
        data: { ...newData, canvasId } // Add canvasId to the node data
      };
      addNode(newNodeData, canvasId);
      setSelectedNodes([newNodeData.id]);

      // Insert the node-canvas link
      const { error: linkError } = await supabase
        .from('node_canvas_link')
        .insert({ node_id: newNode.id, canvas_id: canvasId });
      if (linkError) throw linkError;

      // Duplicate tags
      const { tags } = nodeToDuplicate.data;
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await supabase.from('node_tags').insert({ node_id: newNode.id, tag });
        }
      }

      // Duplicate attachments
      const attachments = await getAttachments(id);
      for (const attachment of attachments) {
        const newAttachmentId = uuidv4();
        const newStoragePath = `node-attachments/${newNode.id}/${attachment.file_name}`;
        if (attachment.is_file && attachment.storage_path) {
          const { data, error } = await supabase.storage
            .from('node-attachments')
            .copy(attachment.storage_path, newStoragePath);
          if (error) throw error;
        }
        await supabase.from('node_attachments').insert({
          ...attachment,
          id: newAttachmentId,
          node_id: newNode.id,
          storage_path: newStoragePath
        });
      }
    } catch (error) {
      console.error('Error duplicating node:', error);
    }
  }
};
