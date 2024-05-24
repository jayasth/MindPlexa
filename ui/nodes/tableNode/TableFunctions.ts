import { useStore } from '@/app/store/useCanvasStore';

export const addRow = (id: string) => {
  const { updateNode, nodes } = useStore.getState();
  const node = nodes.find((n) => n.id === id);
  if (node) {
    const tableData = node.data.tableData || [];
    const newRow = new Array(tableData[0]?.length || 1).fill('');
    updateNode(id, {
      data: { ...node.data, tableData: [...tableData, newRow] }
    });
  }
};

export const addColumn = (id: string) => {
  const { updateNode, nodes } = useStore.getState();
  const node = nodes.find((n) => n.id === id);
  if (node) {
    const tableData = node.data.tableData || [];
    const updatedTableData = tableData.map((row) => [...row, '']);
    updateNode(id, { data: { ...node.data, tableData: updatedTableData } });
  }
};

export const deleteRow = (id: string, rowIndex: number) => {
  const { updateNode, nodes } = useStore.getState();
  const node = nodes.find((n) => n.id === id);
  if (node) {
    const tableData = node.data.tableData || [];
    const updatedTableData = tableData.filter((_, index) => index !== rowIndex);
    updateNode(id, { data: { ...node.data, tableData: updatedTableData } });
  }
};

export const deleteColumn = (id: string, colIndex: number) => {
  const { updateNode, nodes } = useStore.getState();
  const node = nodes.find((n) => n.id === id);
  if (node) {
    const tableData = node.data.tableData || [];
    const updatedTableData = tableData.map((row) =>
      row.filter((_, index) => index !== colIndex)
    );
    updateNode(id, { data: { ...node.data, tableData: updatedTableData } });
  }
};
