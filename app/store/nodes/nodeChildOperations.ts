import { v4 as uuidv4 } from 'uuid';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { XYPosition } from 'reactflow';

export const addChildNode = async (
  set,
  get,
  parentNode,
  position,
  type,
  canvasId
) => {
  try {
    const { addNode, setNodes } = get();
    const newNode = {
      id: uuidv4(),
      type: type,
      data: { label: 'New Node', parentId: parentNode.id },
      position,
      style: {
        backgroundColor: '#F4F4F4',
        textColor: '#575757',
        isEditing: false,
        isTemporary: false,
        viewWidth: nodeDimensions[type].width,
        viewHeight: nodeDimensions[type].height,
        editWidth: nodeDimensions[type].editWidth,
        editHeight: nodeDimensions[type].editHeight,
        mobileEditWidth: nodeDimensions[type].mobileEditWidth,
        mobileEditHeight: nodeDimensions[type].mobileEditHeight
      }
    };
    await addNode(newNode, canvasId);
    setNodes((nodes) => [
      ...nodes.filter((node) => node.type !== 'selection_menu')
    ]);
    console.log('nodeChildOperations: Child node added', newNode);
  } catch (error) {
    console.error('nodeChildOperations: Error adding child node', error);
  }
};

export const createChildNodeFromDrag = async (
  set,
  get,
  parentNode,
  position,
  nodeType,
  canvasId
) => {
  try {
    const { addNode, setNodes, removeNode } = get();
    const dummyElement = document.createElement('div');
    dummyElement.style.width = '1000px';
    dummyElement.style.height = '800px';
    const childNodePosition = getChildNodePosition(
      { clientX: position.x, clientY: position.y } as MouseEvent,
      parentNode,
      dummyElement,
      (pos) => pos
    );
    if (!childNodePosition) {
      console.error(
        'nodeChildOperations: Failed to calculate child node position.'
      );
      return;
    }
    const newNode = {
      id: `selection_menu-${uuidv4()}`,
      type: 'selection_menu',
      position: childNodePosition,
      data: {
        onSelect: async (
          selectedNodeType: string,
          selectedPosition: XYPosition
        ) => {
          try {
            const createdNode = {
              id: uuidv4(),
              type: selectedNodeType,
              position: selectedPosition,
              data: {
                label: 'New Node',
                parentId: parentNode.id,
                backgroundColor: '#F4F4F4',
                textColor: '#575757',
                isEditing: false,
                isTemporary: false,
                viewWidth: nodeDimensions[selectedNodeType].width,
                viewHeight: nodeDimensions[selectedNodeType].height,
                editWidth: nodeDimensions[selectedNodeType].editWidth,
                editHeight: nodeDimensions[selectedNodeType].editHeight,
                mobileEditWidth:
                  nodeDimensions[selectedNodeType].mobileEditWidth,
                mobileEditHeight:
                  nodeDimensions[selectedNodeType].mobileEditHeight
              }
            };
            await addNode(createdNode, canvasId);
            await removeNode(newNode.id, canvasId);
            setNodes((nodes) => nodes.filter((node) => node.id !== newNode.id));
            console.log(
              'nodeChildOperations: Child node created from drag',
              createdNode
            );
          } catch (error) {
            console.error(
              'nodeChildOperations: Error creating child node from drag',
              error
            );
          }
        },
        onClose: () => {
          try {
            removeNode(newNode.id, canvasId);
            setNodes((nodes) => nodes.filter((node) => node.id !== newNode.id));
            console.log('nodeChildOperations: Selection menu closed', newNode);
          } catch (error) {
            console.error(
              'nodeChildOperations: Error closing selection menu',
              error
            );
          }
        },
        parentNode: parentNode,
        isTemporary: true
      },
      viewWidth: nodeDimensions['selection_menu'].width,
      viewHeight: nodeDimensions['selection_menu'].height
    };
    await addNode(newNode, canvasId);
    setNodes((nodes) => [
      ...nodes.filter((node) => node.type !== 'selection_menu'),
      newNode
    ]);
    console.log('nodeChildOperations: Selection menu node added', newNode);
  } catch (error) {
    console.error(
      'nodeChildOperations: Error adding selection menu node',
      error
    );
  }
};
