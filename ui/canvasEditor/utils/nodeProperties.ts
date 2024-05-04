export const nodeDimensions = {
  note: { width: 200, height: 150 },
  task: { width: 200, height: 150 },
  custom: { width: 200, height: 150 },
  code: { width: 200, height: 150 },
  draw: { width: 200, height: 150 },
  selectionMenu: { width: 150, height: 50 }
};

export const getNodeSpecificProperties = (nodeType: string) => {
  const baseProperties = {
    draggable: true,
    connectable: true,
    width: nodeDimensions[nodeType].width,
    height: nodeDimensions[nodeType].height
  };

  switch (nodeType) {
    case 'note':
      return { ...baseProperties, isEditing: false };
    case 'task':
      return {
        ...baseProperties,
        completed: false,
        isEditing: false
      };
    case 'custom':
      return { ...baseProperties, isEditing: false };
    case 'code':
      return {
        ...baseProperties,
        language: 'plaintext',
        isEditing: false
      };
    case 'draw':
      return { ...baseProperties, isEditing: false };
    case 'selectionMenu':
      return { ...baseProperties };
    default:
      throw new Error('Invalid node type');
  }
};
