import { useStore } from '@/app/store/useCanvasStore';
import Papa from 'papaparse';

export const handleTitleChange = (
  id: string,
  title: string,
  onChangeTitle: (title: string) => void
) => {
  const { updateNode } = useStore.getState();
  onChangeTitle(title);
  updateNode(id, { data: { title } });
};

export const addColumn = (content: any, setContent: (content: any) => void) => {
  setContent((prevContent: any) => {
    const newColumn = {
      headerName: 'New Column',
      field: `col${prevContent.columns.length + 1}`
    };
    return {
      ...prevContent,
      columns: [...prevContent.columns, newColumn]
    };
  });
};

export const addRow = (content: any, setContent: (content: any) => void) => {
  setContent((prevContent: any) => {
    const newRow = prevContent.columns.reduce((row: any, col: any) => {
      row[col.field] = '';
      return row;
    }, {});
    return {
      ...prevContent,
      rows: [...prevContent.rows, newRow]
    };
  });
};

export const importTableData = (
  event: any,
  setContent: (content: any) => void
) => {
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target !== null) {
      const importedData = Papa.parse(e.target.result as string, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data;
      const columns = Object.keys(importedData[0]).map((key) => ({
        headerName: key,
        field: key
      }));
      setContent({ columns, rows: importedData });
    }
  };
  if (event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
};

export const exportTableData = (content: any) => {
  const dataStr = Papa.unparse(content.rows);
  const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = 'tableData.csv';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
