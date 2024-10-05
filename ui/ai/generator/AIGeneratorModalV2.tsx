import React, { useState } from 'react';
import { Edge, Node } from 'reactflow';
import { parseMermaidCode } from './mermaidGeneratorUtilsV2';
import { promptTemplateV2 } from '@/app/prompts/generatorPromptV2';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from './ConfirmIntegrationModal';
import Dropdown from '@/ui/dropdown/Dropdown';
import Modal from '@/ui/Modal/Modal';
import styles from './AIGeneratorModalV2.module.css';
import { applyLayout } from './aiPositioningUtilsV2';
import { createBulkNodes } from '@/utils/canvas/nodeService';
import { createEdgeBetweenNodes } from '@/utils/canvas/edgeService';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';

interface AIGeneratorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
}

type NodeType = Database['public']['Enums']['node_type'];
type LayoutType =
  | 'mindmap'
  | 'workflow'
  | 'concept-map'
  | 'grid'
  | 'hierarchical';

interface AnalysisResult {
  suggestedLayout: LayoutType;
  // Add other properties as needed
}

const AIGeneratorModalV2: React.FC<AIGeneratorModalV2Props> = ({
  isOpen,
  onClose
}) => {
  const [projectConcept, setProjectConcept] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [selectedModel, setSelectedModel] = useState(
    'claude-3-5-sonnet-20240620'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const { setNodes, nodes: existingNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectConcept(e.target.value);
    setErrorMessage(null);
  };

  const handleGenerateCanvas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('Generating canvas with project concept:', projectConcept);
      const prompt = promptTemplateV2(projectConcept);

      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, version: 'v2', model: selectedModel })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate canvas: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AIGeneratorModalV2 Full API Response:', data);

      let parsedData;
      try {
        // First, try to parse the entire response as JSON
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (parseError) {
        console.error('Error parsing entire response as JSON:', parseError);
        // If that fails, try to extract JSON from the response
        const jsonMatch = data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            console.error('Error parsing extracted JSON:', extractError);
            throw new Error('Invalid response format');
          }
        } else {
          throw new Error('Invalid response format');
        }
      }

      if (!parsedData.analysis || !parsedData.mermaidCode) {
        console.error('Unexpected API response structure:', parsedData);
        throw new Error('Unexpected API response structure');
      }

      const { analysis, mermaidCode } = parsedData;
      setAnalysisResult(analysis);

      console.log('Selected layout:', analysis.suggestedLayout);

      const { nodes, edges, warning } = await parseMermaidCode(
        mermaidCode,
        projectConcept
      );

      if (warning) {
        setErrorMessage(warning);
      }

      const layout = analysis.suggestedLayout || 'force';

      if (existingNodes.length > 0) {
        setGeneratedNodes(nodes);
        setGeneratedEdges(edges);
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(nodes, edges, layout as LayoutType);
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
      if (error instanceof Error) {
        setErrorMessage(
          `An error occurred while generating the canvas: ${error.message}. Please try again.`
        );
      } else {
        setErrorMessage(
          'An unexpected error occurred while generating the canvas. Please try again.'
        );
      }
    }

    setIsLoading(false);
  };

  const handleConfirmIntegration = async (
    generatedNodes: Node[],
    generatedEdges: Edge[],
    layoutType: LayoutType
  ) => {
    const canvasSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const scaleFactor = 0.8; // Adjust this value as needed

    try {
      const positionedNodes = applyLayout(
        generatedNodes,
        generatedEdges,
        canvasSize,
        layoutType,
        scaleFactor
      );

      const nodesWithNewIds = positionedNodes.map((node) => ({
        ...node,
        id: uuidv4()
      }));

      const idMapping = positionedNodes.reduce((acc, node, index) => {
        acc[node.id] = nodesWithNewIds[index].id;
        return acc;
      }, {});

      const updatedEdges = generatedEdges.map((edge) => ({
        ...edge,
        source: idMapping[edge.source],
        target: idMapping[edge.target]
      }));

      const { data: createdNodes, error } = await createBulkNodes(
        canvasId,
        nodesWithNewIds.map((node) => ({
          id: node.id,
          type: (node.type as NodeType) || 'note',
          position: node.position,
          data: {
            ...node.data,
            id: node.id,
            noteData:
              node.type === 'note' ? { content: node.data.content } : undefined,
            taskData:
              node.type === 'task' ? { tasks: node.data.tasks } : undefined,
            calendarData:
              node.type === 'calendar'
                ? { events: node.data.events }
                : undefined,
            tableData:
              node.type === 'table' ? { rows: node.data.rows } : undefined,
            drawData:
              node.type === 'draw'
                ? { drawingData: node.data.drawingData }
                : undefined
          }
        }))
      );

      if (error) {
        console.error('Error creating bulk nodes:', error);
        setErrorMessage('Failed to create nodes. Please try again.');
      } else {
        setNodes((currentNodes) => [
          ...currentNodes,
          ...(createdNodes as Node[])
        ]);

        for (const edge of updatedEdges) {
          const { data: createdEdge, error: edgeError } =
            await createEdgeBetweenNodes({
              sourceNodeId: edge.source,
              targetNodeId: edge.target,
              canvasId
            });

          if (edgeError) {
            console.error('Error creating edge:', edgeError);
          } else if (createdEdge) {
            setEdges((currentEdges) => [
              ...currentEdges,
              {
                ...edge,
                id: createdEdge.id
              }
            ]);
          }
        }

        setShowConfirmModal(false);
        onClose();
      }
    } catch (error) {
      console.error('Error applying layout or creating nodes:', error);
      setErrorMessage(
        'An error occurred while creating the nodes. Please try again.'
      );
    }
  };

  const handleCancelIntegration = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showConfirmModal}
        onClose={onClose}
        title="Smart AI Project Architect"
      >
        <div className={styles.content}>
          <form onSubmit={handleGenerateCanvas}>
            <textarea
              className={styles.textarea}
              placeholder="Describe your project and let AI design an optimized project network"
              value={projectConcept}
              onChange={handleProjectConceptChange}
            />
            <div className={styles.actionContainer}>
              <Dropdown
                value={selectedModel}
                onChange={(value) => setSelectedModel(value)}
                variant="slim"
                className={styles.dropdown}
              >
                <option value="claude-3-5-sonnet-20240620">
                  Claude 3.5 Sonnet
                </option>
                <option value="gpt-4o">GPT-4o</option>
              </Dropdown>
              <Button
                type="submit"
                disabled={uiIsLoading || !projectConcept.trim()}
                loading={uiIsLoading}
                variant="submit"
                className={styles.generateButton}
              >
                {uiIsLoading ? 'Generating...' : 'Generate Network'}
              </Button>
            </div>
          </form>
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
        </div>
      </Modal>
      {showConfirmModal && (
        <ConfirmIntegrationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() =>
            handleConfirmIntegration(
              generatedNodes,
              generatedEdges,
              analysisResult?.suggestedLayout || ('force' as LayoutType)
            )
          }
          onCancel={handleCancelIntegration}
        />
      )}
    </>
  );
};

export default AIGeneratorModalV2;
