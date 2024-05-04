export const nodeDimensions = {
  note: { width: 300, height: 400 },
  task: { width: 300, height: 400 },
  custom: { width: 300, height: 400 },
  code: { width: 300, height: 400 },
  draw: { width: 300, height: 400 },
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
