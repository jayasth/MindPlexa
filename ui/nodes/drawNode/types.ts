export interface ToolSetting {
  name: string;
  color: string;
  strokeWidth: number;
  opacity?: number;
  blendMode?: string;
}
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}
