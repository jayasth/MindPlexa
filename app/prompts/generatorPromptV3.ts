export interface IntentAnalysis {
  primary:
    | 'analysis'
    | 'planning'
    | 'learning'
    | 'tracking'
    | 'brainstorming'
    | 'documentation'
    | 'decision';
  timeframe: 'short' | 'medium' | 'long';
  complexity: 'simple' | 'detailed' | 'comprehensive';
  audience: 'self' | 'team' | 'public';
}

export interface NodeRecommendation {
  type: 'note' | 'task' | 'calendar' | 'table' | 'draw';
  purpose: string;
  data: {
    title: string;
    description: string;
    backgroundColor?: string;
    tags?: string[];
    nodeSpecificData?: {
      tasks?: Array<{ text: string; status: string }>;
      events?: Array<{ date: string; title: string }>;
      tableColumns?: string[];
      tableData?: any[];
    };
  };
}

export const promptTemplateV3 = (userInput: string) => {
  return `Analyze the following input and create an optimized project structure with appropriate node types:

"${userInput}"

First, analyze the intent and provide a structured response with:
1. Primary purpose (analysis/planning/learning/tracking/brainstorming/documentation/decision)
2. Optimal node types for this purpose
3. Logical structure and relationships

Return response as JSON:
{
  "analysis": {
    "intent": IntentAnalysis,
    "suggestedLayout": "mindmap" | "workflow" | "concept-map" | "grid" | "hierarchical",
    "layoutReasoning": string
  },
  "nodes": Array<NodeRecommendation>,
  "relationships": Array<{source: string, target: string}>
}

Consider these node type purposes:
- Note: Concepts, descriptions, explanations
- Task: Action items, todos, milestones
- Calendar: Timelines, schedules, deadlines
- Table: Data organization, comparisons, metrics
- Draw: Sketches, diagrams, visual explanations

Ensure each node serves a clear purpose within the overall structure.`;
};
