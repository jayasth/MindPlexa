export interface ToolSetting {
  name: string;
  color: string;
  strokeWidth: number;
  opacity?: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  content: string;
  zIndex: number;
}
