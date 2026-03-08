export interface IntentAnalysis {
  primary:
    | 'analysis'
    | 'planning'
    | 'learning'
    | 'tracking'
    | 'brainstorming'
    | 'documentation'
    | 'decision';
  timeframe: 'short-term' | 'medium-term' | 'long-term';
  complexity: 'simple' | 'detailed' | 'comprehensive';
  audience: 'self' | 'team' | 'public';
}

export interface NodeData {
  title: string;
  description: string;
  backgroundColor?: string;
  tags?: string[];
}

export interface NoteData extends NodeData {
  content: string;
}

export interface TaskData extends NodeData {
  tasks: Array<{ text: string; status: 'todo' | 'in-progress' | 'done' }>;
}

export interface CalendarData extends NodeData {
  events: Array<{ title: string; date: string; description?: string }>;
}

export interface TableData extends NodeData {
  columns: string[];
  rows: (string | number | boolean | null)[][];
}

export interface DrawData extends NodeData {
  drawingData?: string;
}

export interface NodeRecommendation {
  id: string;
  type: 'note' | 'task' | 'calendar' | 'table' | 'draw';
  data: NoteData | TaskData | CalendarData | TableData | DrawData;
}

export const promptTemplateV3 = (
  userInput: string,
  layoutType: string = 'mindmap'
) => {
  return `As an AI assistant for MindPlexa, analyze this project concept and create an optimized structure:

"${userInput}"

First, determine the project's intent and characteristics. Then, create a structured layout using appropriate node types for each component.

Available Node Types and Their Purposes:
1. Note: For information, concepts, descriptions (content as formatted text)
2. Task: For actionable items (with todo/in-progress/done status)
3. Calendar: For scheduling, deadlines, milestones (with dates)
4. Table: For structured data, comparisons, metrics (with columns/rows)
5. Draw: For sketches, diagrams (placeholder for now)

Response Format (JSON):
{
  "analysis": {
    "intent": {
      "primary": "analysis" | "planning" | "learning" | "tracking" | "brainstorming" | "documentation" | "decision",
      "timeframe": "short-term" | "medium-term" | "long-term",
      "complexity": "simple" | "detailed" | "comprehensive",
      "audience": "self" | "team" | "public"
    }
  },
  "nodes": [
    {
      "id": "unique_string",
      "type": "note" | "task" | "calendar" | "table" | "draw",
      "data": {
        "title": "string (max 50 chars)",
        "description": "string (max 200 chars)",
        "backgroundColor": "optional hex color",
        "tags": ["optional_tags"],
        
        // Type-specific data (include only relevant field based on type)
        "content": "string for note type",
        "tasks": [{"text": "string", "status": "todo"}],
        "events": [{"title": "string", "date": "YYYY-MM-DD"}],
        "columns": ["column names for table"],
        "rows": [["table data"]]
      }
    }
  ],
  "relationships": [
    {
      "source": "parent_node_id",
      "target": "child_node_id"
    }
  ]
}

Guidelines:
1. Select node types based on the content's purpose and user's needs
2. Create 3-7 main nodes with 2-5 subnodes each
3. Use ${layoutType} layout structure
4. Group related nodes with similar background colors
5. Add relevant tags for better organization
6. Ensure logical node connections
7. Make titles and descriptions clear and actionable
8. Pre-populate type-specific data where appropriate

Generate a comprehensive but focused structure that helps users start their project effectively.`;
};
