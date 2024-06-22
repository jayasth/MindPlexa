export interface CommonNodeData {
  id: string;
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  tags?: string[];
  attachedFiles?: string[];
  isEditing?: boolean;
  isTemporary?: boolean;
  parentNodeId?: string | null;
  zIndex?: number;
}

export interface NoteNodeData extends CommonNodeData {
  content?: string;
}

export interface TaskNodeData extends CommonNodeData {
  tasks?: { id: string; text: string; completed: boolean }[];
}

export interface TableNodeData extends CommonNodeData {
  columns?: {
    headerName: string;
    field: string;
    editable: boolean;
    type?: string;
    defaultValue?: any;
  }[];
  rows?: { [key: string]: any }[];
}

export interface CalendarNodeData extends CommonNodeData {
  events?: { start: Date; end: Date; title?: string; description?: string }[];
  view?: string;
}

export interface DrawNodeData extends CommonNodeData {
  drawingData?: string;
}
