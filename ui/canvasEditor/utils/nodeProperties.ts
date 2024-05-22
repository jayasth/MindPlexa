interface BaseNodeDimension {
  width: number;
  height: number;
}

interface EditableNodeDimension extends BaseNodeDimension {
  editWidth: number;
  editHeight: number;
  mobileEditWidth: number;
  mobileEditHeight: number;
}

type NodeDimensionTypes = {
  [K in 'note' | 'task' | 'table' | 'calendar' | 'draw']: EditableNodeDimension;
} & {
  [K in 'selectionMenu']: BaseNodeDimension;
};

export const nodeDimensions: NodeDimensionTypes = {
  note: {
    width: 150,
    height: 60,
    editWidth: 600, // Increased width for desktop
    editHeight: 450,
    mobileEditWidth: 300, // Specific width for mobile
    mobileEditHeight: 450
  },
  task: {
    width: 150,
    height: 60,
    editWidth: 600, // Increased width for desktop
    editHeight: 450,
    mobileEditWidth: 300, // Specific width for mobile
    mobileEditHeight: 450
  },
  table: {
    width: 150,
    height: 60,
    editWidth: 600, // Increased width for desktop
    editHeight: 450,
    mobileEditWidth: 300, // Specific width for mobile
    mobileEditHeight: 450
  },
  calendar: {
    width: 150,
    height: 60,
    editWidth: 600, // Increased width for desktop
    editHeight: 450,
    mobileEditWidth: 300, // Specific width for mobile
    mobileEditHeight: 450
  },
  draw: {
    width: 150,
    height: 60,
    editWidth: 600, // Increased width for desktop
    editHeight: 450,
    mobileEditWidth: 300, // Specific width for mobile
    mobileEditHeight: 450
  },
  selectionMenu: { width: 200, height: 50 }
};

export const getNodeSpecificProperties = (
  nodeType: string,
  isEditing: boolean
) => {
  const dimensions = nodeDimensions[nodeType];
  if (!dimensions) {
    console.warn(`Unknown node type: ${nodeType}`);
    return { width: 100, height: 100, draggable: true, connectable: true }; // Default properties
  }

  const baseProperties = {
    draggable: true,
    connectable: true
  };

  if ('editWidth' in dimensions && 'editHeight' in dimensions) {
    const isMobile = window.innerWidth <= 768; // Adjust the breakpoint as needed
    return {
      ...baseProperties,
      width: isEditing
        ? isMobile
          ? dimensions.mobileEditWidth
          : dimensions.editWidth
        : dimensions.width,
      height: isEditing
        ? isMobile
          ? dimensions.mobileEditHeight
          : dimensions.editHeight
        : dimensions.height,
      isEditing: isEditing
    };
  } else {
    return {
      ...baseProperties,
      width: dimensions.width,
      height: dimensions.height,
      isEditing: isEditing
    };
  }
};
