import { produce } from 'immer';
import type { NodeState } from './useNodeStore';
import { updateNode as updateNodeInDB } from '@/utils/canvas/nodeService';

export const setNodes = (set, updater) => {
  set(
    produce((state: NodeState) => {
      const updatedNodes =
        typeof updater === 'function' ? updater(state.nodes) : updater;
      state.nodeInternals.clear();
      updatedNodes.forEach((node) => state.nodeInternals.set(node.id, node));
      console.log('nodeStateManagement: Nodes set', updatedNodes);
      state.nodes = updatedNodes;
    })
  );
};

export const setInitialState = (set, get, nodes) => {
  if (get().nodes.length > 0) return;
  console.log('nodeStateManagement: Setting initial state', nodes);
  set(
    produce((state: NodeState) => {
      state.nodes = nodes;
      state.nodeInternals = new Map(nodes.map((node) => [node.id, node]));
    })
  );
};

export const toggleEditMode = (set, nodeId) => {
  set(
    produce((state: NodeState) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (node && node.type !== 'selection_menu') {
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            isEditing: !node.data?.isEditing
          }
        };
        state.nodeInternals.set(nodeId, updatedNode);
        state.nodes = state.nodes.map((n) =>
          n.id === nodeId ? updatedNode : n
        );

        // Update only the is_editing field in the nodes table
        updateNodeInDB(
          nodeId,
          { is_editing: updatedNode.data.isEditing },
          {},
          node.type as
            | 'note'
            | 'task'
            | 'table'
            | 'calendar'
            | 'draw'
            | 'selection_menu'
        );
      }
    })
  );
};

export const setSelectedNodes = (set, selectedIds) => {
  set(
    produce((state: NodeState) => {
      const updatedNodes = state.nodes.map((node) => ({
        ...node,
        selected: selectedIds.includes(node.id)
      }));
      updatedNodes.forEach((node) => state.nodeInternals.set(node.id, node));
      console.log('nodeStateManagement: Nodes selected', updatedNodes);
      state.nodes = updatedNodes;
    })
  );
};
