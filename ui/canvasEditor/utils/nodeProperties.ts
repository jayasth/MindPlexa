interface BaseNodeDimension {
  width: number;
  height: number;
}

interface EditableNodeDimension extends BaseNodeDimension {
  editWidth: number;
  editHeight: number;
}

type NodeDimensionTypes = {
  [K in 'note' | 'task' | 'custom' | 'code' | 'draw']: EditableNodeDimension;
} & {
  [K in 'selectionMenu']: BaseNodeDimension;
};

export const nodeDimensions: NodeDimensionTypes = {
  note: { width: 150, height: 60, editWidth: 300, editHeight: 450 },
  task: { width: 200, height: 150, editWidth: 300, editHeight: 200 },
  custom: { width: 200, height: 150, editWidth: 300, editHeight: 200 },
  code: { width: 200, height: 150, editWidth: 300, editHeight: 200 },
  draw: { width: 200, height: 150, editWidth: 300, editHeight: 200 },
  selectionMenu: { width: 200, height: 100 }
};

export const getNodeSpecificProperties = (
  nodeType: string,
  isEditing: boolean
) => {
  const dimensions = nodeDimensions[nodeType];
  const baseProperties = {
    draggable: true,
    connectable: true
  };

  switch (nodeType) {
    case 'note':
    case 'task':
    case 'custom':
    case 'code':
    case 'draw':
      return {
        ...baseProperties,
        width:
          isEditing && 'editWidth' in dimensions
            ? dimensions.editWidth
            : dimensions.width,
        height:
          isEditing && 'editHeight' in dimensions
            ? dimensions.editHeight
            : dimensions.height,
        isEditing: isEditing
      };
    case 'selectionMenu':
      return {
        ...baseProperties,
        width: dimensions.width,
        height: dimensions.height
      };
    default:
      throw new Error('Invalid node type');
  }
};
