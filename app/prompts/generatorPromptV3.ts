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

type TableCellValue = string | number | boolean | null;

export interface NodeRecommendation {
  id: string;
  type: 'note' | 'task' | 'calendar' | 'table' | 'draw';
  data: {
    title: string;
    description: string;
    backgroundColor?: string;
    tags?: string[];
    content?: string;
    tasks?: Array<{ text: string; status: 'todo' }>;
    events?: Array<{ title: string; date: string }>;
    columns?: string[];
    rows?: TableCellValue[][];
  };
}

export const promptTemplateV3 = (
  userInput: string,
  layoutType: string = 'mindmap'
) => {
  return `Analyze this project concept and create an optimized structure with appropriate node types:

"${userInput}"

First, analyze the intent and requirements. Then, create a structured layout using the most suitable node types for each component.

Available node types:
- note: For information, descriptions, explanations
- task: For actionable items with status tracking
- calendar: For time-sensitive events and deadlines
- table: For structured data, comparisons, metrics
- draw: For sketches, diagrams, visual explanations

Provide your response in this JSON format:
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
      "id": "string",
      "type": "note" | "task" | "calendar" | "table" | "draw",
      "data": {
        "title": "string (max 50 chars)",
        "description": "string (max 200 chars)",
        "backgroundColor": "string (optional)",
        "tags": ["string"] (optional),
        // Type-specific data
        "content": "string (for note)",
        "tasks": [{"text": "string", "status": "todo"}] (for task),
        "events": [{"title": "string", "date": "string"}] (for calendar),
        "columns": ["string"] (for table),
        "rows": [[any]] (for table)
      }
    }
  ],
  "relationships": [
    {
      "source": "string (nodeId)",
      "target": "string (nodeId)"
    }
  ]
}

Guidelines:
1. Choose node types based on content purpose, not just for variety
2. Use clear, concise titles and descriptions
3. Add relevant tags to group related nodes
4. Create logical connections between nodes
5. Use background colors to visually group related nodes
6. Ensure all node IDs are unique
7. Create 3-7 main nodes with 2-5 subnodes each
8. Layout should be ${layoutType}

The response must be valid JSON and include all required fields.`;
};
