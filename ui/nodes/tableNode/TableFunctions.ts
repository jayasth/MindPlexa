import { useStore } from '@/app/store/useCanvasStore';
import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';

export const handleTitleChange = (
  id: string,
  title: string,
  onChangeTitle: (title: string) => void
) => {
  const { updateNode } = useStore.getState();
  onChangeTitle(title);
  updateNode(id, { data: { title } });
};

export const handleChangeColor = (
  id: string,
  color: string,
  onChangeColor: (color: string) => void
) => {
  const { updateNode } = useStore.getState();
  const textColor = getContrastYIQ(color);
  onChangeColor(color);
  updateNode(id, { data: { backgroundColor: color, textColor } });
};

export const addColumn = (content: any, setContent: (content: any) => void) => {
  const newColumn = {
    headerName: 'New Column',
    field: `col${content.columns.length + 1}`
  };
  setContent({
    ...content,
    columns: [...content.columns, newColumn]
  });
};

export const addRow = (content: any, setContent: (content: any) => void) => {
  const newRow = content.columns.reduce((row: any, col: any) => {
    row[col.field] = '';
    return row;
  }, {});
  setContent({
    ...content,
    rows: [...content.rows, newRow]
  });
};

export const importTableData = (
  event: any,
  setContent: (content: any) => void
) => {
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target !== null) {
      const importedData = JSON.parse(e.target.result as string);
      setContent(importedData);
    }
  };
  if (event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
};

export const exportTableData = (content: any) => {
  const dataStr = JSON.stringify(content);
  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = 'tableData.json';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
