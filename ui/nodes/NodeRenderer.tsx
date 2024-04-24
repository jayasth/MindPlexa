import React from 'react';
import { NodeProps } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/canvasEditorReducer';
import NoteNode from './NoteNode';
import TaskNode from './TaskNode';
import CustomNode from './CustomNode';
import CodeNode from './CodeNode';
import DrawNode from './DrawNode';

const NodeRenderer: React.FC<NodeProps> = ({ data, selected, id }) => {
  const node = data as BaseNode;

  const commonProps = {
    onDelete: () => console.log(`Delete ${node.type}`),
    onChangeColor: () => console.log('Change Color'),
    onResize: () => console.log('Resize Node'),
    onTag: () => console.log('Tag Node'),
    onAttach: () => console.log('Attach File'),
    selected: selected,
    id: id,
    type: node.type,
    zIndex: 0,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false
  };

  switch (node.type) {
    case 'note':
      return (
        <NoteNode
          data={node}
          onDelete={() => console.log('Delete Note')}
          onChangeColor={() => console.log('Change Color')}
          onTag={() => console.log('Tag Note')}
          onAttach={() => console.log('Attach File')}
          selected={selected}
          id={id}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    case 'task':
      return (
        <TaskNode
          data={node}
          onDelete={() => console.log('Delete Task')}
          onChangeColor={() => console.log('Change Color')}
          onResize={() => console.log('Resize Note')}
          onTag={() => console.log('Tag Task')}
          onAttach={() => console.log('Attach File')}
          selected={selected}
          id={id}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
          onToggleComplete={() => {}}
        />
      );
    case 'custom':
      return (
        <CustomNode
          data={node}
          onDelete={() => console.log('Delete Custom')}
          onChangeColor={() => console.log('Change Color')}
          onResize={() => console.log('Resize Note')}
          onTag={() => console.log('Tag Custom')}
          onAttach={() => console.log('Attach File')}
          selected={selected}
          id={id}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    case 'code':
      return (
        <CodeNode
          data={node}
          onDelete={() => console.log('Delete Code')}
          onChangeColor={() => console.log('Change Color')}
          onResize={() => console.log('Resize Note')}
          onTag={() => console.log('Tag Code')}
          onAttach={() => console.log('Attach File')}
          selected={selected}
          id={id}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    case 'draw':
      return (
        <DrawNode
          data={node}
          onDelete={() => console.log('Delete Draw Node')}
          onChangeColor={() => console.log('Change Color')}
          onResize={() => console.log('Resize Note')}
          onTag={() => console.log('Tag Draw')}
          onAttach={() => console.log('Attach File')}
          selected={selected}
          id={id}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    default:
      return null; // Return null if the node type is unrecognized
  }
};

export default NodeRenderer;
