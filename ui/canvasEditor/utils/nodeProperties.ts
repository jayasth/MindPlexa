interface EditableNodeDimension {
  viewWidth: number;
  viewHeight: number;
  editWidth: number;
  editHeight: number;
  mobileEditWidth: number;
  mobileEditHeight: number;
}

type NodeDimensionTypes = {
  [K in 'note' | 'task' | 'table' | 'calendar' | 'draw']: EditableNodeDimension;
} & {
  [K in 'selection_menu']: { width: number; height: number };
};

export const nodeDimensions: NodeDimensionTypes = {
  note: {
    viewWidth: 120,
    viewHeight: 90,
    editWidth: 600,
    editHeight: 450,
    mobileEditWidth: 300,
    mobileEditHeight: 450
  },
  task: {
    viewWidth: 120,
    viewHeight: 90,
    editWidth: 600,
    editHeight: 450,
    mobileEditWidth: 300,
    mobileEditHeight: 450
  },
  table: {
    viewWidth: 160,
    viewHeight: 120,
    editWidth: 800,
    editHeight: 600,
    mobileEditWidth: 300,
    mobileEditHeight: 450
  },
  calendar: {
    viewWidth: 120,
    viewHeight: 90,
    editWidth: 600,
    editHeight: 450,
    mobileEditWidth: 300,
    mobileEditHeight: 450
  },
  draw: {
    viewWidth: 160,
    viewHeight: 120,
    editWidth: 800,
    editHeight: 600,
    mobileEditWidth: 300,
    mobileEditHeight: 450
  },
  selection_menu: { width: 200, height: 50 }
};

export const getNodeDimensions = (
  nodeType: string,
  isEditing: boolean,
  isMobile: boolean
) => {
  const dimensions = nodeDimensions[nodeType];
  if (!dimensions) {
    console.warn(`Unknown node type: ${nodeType}`);
    return { width: 100, height: 100 };
  }

  if (isEditing) {
    return {
      width: isMobile ? dimensions.mobileEditWidth : dimensions.editWidth,
      height: isMobile ? dimensions.mobileEditHeight : dimensions.editHeight
    };
  } else {
    return {
      width: dimensions.viewWidth,
      height: dimensions.viewHeight
    };
  }
};

export const getNodeSpecificProperties = (
  nodeType: string,
  isEditing: boolean
) => {
  const isMobile = window.innerWidth <= 768; // Adjust the breakpoint as needed
  const { width, height } = getNodeDimensions(nodeType, isEditing, isMobile);

  return {
    width,
    height,
    draggable: true,
    connectable: true,
    isEditing: isEditing
  };
};
