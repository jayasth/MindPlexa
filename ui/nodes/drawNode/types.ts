export interface ToolSetting {
  name: string;
  color: string;
  strokeWidth: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}
