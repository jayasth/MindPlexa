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
  console.log('TableFunctions: Adding column');
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
  console.log('TableFunctions: Adding row');
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

export const toggleBold = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Toggling bold');
  setContent((prevContent: any) => ({
    ...prevContent,
    isBold: !prevContent.isBold
  }));
};

export const toggleItalic = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Toggling italic');
  setContent((prevContent: any) => ({
    ...prevContent,
    isItalic: !prevContent.isItalic
  }));
};

export const toggleUnderline = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Toggling underline');
  setContent((prevContent: any) => ({
    ...prevContent,
    isUnderline: !prevContent.isUnderline
  }));
};

export const alignLeft = (content: any, setContent: (content: any) => void) => {
  console.log('TableFunctions: Aligning left');
  setContent((prevContent: any) => ({
    ...prevContent,
    alignment: 'left'
  }));
};

export const alignCenter = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Aligning center');
  setContent((prevContent: any) => ({
    ...prevContent,
    alignment: 'center'
  }));
};

export const alignRight = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Aligning right');
  setContent((prevContent: any) => ({
    ...prevContent,
    alignment: 'right'
  }));
};

export const sortTable = (content: any, setContent: (content: any) => void) => {
  console.log('TableFunctions: Sorting table');
  setContent((prevContent: any) => {
    const sortedRows = [...prevContent.rows].sort((a, b) => {
      // Assuming sorting by the first column for simplicity
      const firstColumn = prevContent.columns[0].field;
      if (a[firstColumn] < b[firstColumn]) return -1;
      if (a[firstColumn] > b[firstColumn]) return 1;
      return 0;
    });
    return {
      ...prevContent,
      rows: sortedRows
    };
  });
};

export const filterTable = (
  content: any,
  setContent: (content: any) => void,
  filterFn: (row: any) => boolean
) => {
  console.log('TableFunctions: Filtering table');
  setContent((prevContent: any) => {
    const filteredRows = prevContent.rows.filter(filterFn);
    return {
      ...prevContent,
      rows: filteredRows
    };
  });
};
