import React, { useState } from 'react';
import { Edge, Node } from 'reactflow';
import { parseMermaidCode } from './mermaidGeneratorUtilsV3';
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
import styles from './AIGeneratorModalV3.module.css';
import { applyLayout } from '@/ui/ai/generator/aiPositioningUtilsV3';
import { createBulkNodes } from '@/utils/canvas/nodeService';
import { createEdgeBetweenNodes } from '@/utils/canvas/edgeService';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';
import { FaQuestionCircle } from 'react-icons/fa';
import { BsLightbulb } from 'react-icons/bs';
import { useToast } from '@/ui/Toasts/use-toast';
import {
  IntentAnalysis,
  NodeRecommendation
} from '@/app/prompts/generatorPromptV3';

interface AIGeneratorModalV3Props {
  isOpen: boolean;
  onClose: () => void;
}

type LayoutType =
  | 'mindmap'
  | 'workflow'
  | 'concept-map'
  | 'grid'
  | 'hierarchical';

const layoutOptions: { value: LayoutType; label: string }[] = [
  { value: 'mindmap', label: 'Mind Map' },
  { value: 'workflow', label: 'Workflow Diagram' },
  { value: 'concept-map', label: 'Concept Map' },
  { value: 'grid', label: 'Grid Layout' },
  { value: 'hierarchical', label: 'Hierarchical Tree' }
];

const AIGeneratorModalV3: React.FC<AIGeneratorModalV3Props> = ({
  isOpen,
  onClose
}) => {
  const [projectConcept, setProjectConcept] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [selectedModel, setSelectedModel] = useState(
    'claude-3-5-sonnet-20240620'
  );
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('mindmap');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setNodes, nodes: existingNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();
  const [followUpCount, setFollowUpCount] = useState(0);
  const MAX_FOLLOW_UP = 2;
  const [responseType, setResponseType] = useState<
    'flowchart' | 'followUp' | 'advice' | 'noIntegration' | null
  >(null);
  const [responseContent, setResponseContent] = useState<string>('');
  const [isResponseReady, setIsResponseReady] = useState(false);
  const { toast } = useToast();
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysis | null>(
    null
  );
  const [nodeRecommendations, setNodeRecommendations] = useState<
    NodeRecommendation[]
  >([]);

  const resetState = () => {
    setFollowUpAnswer('');
    setFollowUpCount(0);
    setResponseType(null);
    setResponseContent('');
    setIsResponseReady(false);
    setErrorMessage(null);
  };

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newProjectConcept = e.target.value;
    if (newProjectConcept !== projectConcept) {
      setProjectConcept(newProjectConcept);
      resetState();
    }
  };

  const handleGenerateCanvas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: projectConcept,
          version: 'v3',
          model: selectedModel,
          layout: selectedLayout,
          followUpQuestion: followUpAnswer
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.analysis?.intent) {
        setIntentAnalysis(data.analysis.intent);
      }

      if (data.nodes) {
        setNodeRecommendations(data.nodes);
        const { nodes, edges } = await parseMermaidCode(
          data.nodes,
          data.relationships
        );

        if (existingNodes.length > 0) {
          setGeneratedNodes(nodes);
          setGeneratedEdges(edges);
          setShowConfirmModal(true);
        } else {
          handleConfirmIntegration(nodes, edges);
        }
      }

      console.log('AIGeneratorModalV1 Response data:', data);

      setResponseType(data.responseType);
      setResponseContent(data.content);

      if (data.responseType === 'advice') {
        setErrorMessage(null);
      } else if (data.responseType === 'followUp') {
        setFollowUpCount((prevCount) => prevCount + 1);
        setFollowUpAnswer('');
      }

      if (followUpCount >= MAX_FOLLOW_UP) {
        setResponseType('advice');
        setResponseContent(
          "I'm sorry, but I couldn't gather enough information to create a detailed project plan. Here's some general advice for project planning: " +
            data.content
        );
      }

      setIsResponseReady(true);
    } catch (error) {
      console.error('Error generating layout:', error);
      setErrorMessage(
        `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Please try again.'}`
      );
    }

    setIsLoading(false);
  };

  const handleConfirmIntegration = async (
    newNodes: Node[],
    newEdges: Edge[]
  ) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const scaleFactor = 0.8; // Adjust this value as needed
    const optimizedNodes = applyLayout(
      newNodes,
      newEdges,
      canvasSize,
      selectedLayout,
      scaleFactor
    );

    try {
      // Generate new UUIDs for each node
      const nodesWithNewIds = optimizedNodes.map((node) => ({
        ...node,
        id: uuidv4()
      }));

      // Create a mapping of old IDs to new IDs
      const idMapping = optimizedNodes.reduce((acc, node, index) => {
        acc[node.id] = nodesWithNewIds[index].id;
        return acc;
      }, {});

      // Update edge source and target with new IDs
      const updatedEdges = newEdges.map((edge) => ({
        ...edge,
        id: uuidv4(), // Generate a new UUID for each edge
        source: idMapping[edge.source],
        target: idMapping[edge.target]
      }));

      const { data: createdNodes, error } = await createBulkNodes(
        canvasId,
        nodesWithNewIds.map((node) => ({
          id: node.id,
          type:
            (node.type as Database['public']['Enums']['node_type']) || 'note',
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

        // Create edges in the database and update the state
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
                id: createdEdge.id // Use the ID returned from the database
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
    setResponseType('noIntegration');
    setIsResponseReady(true);
  };

  const renderNodeSpecificData = (node: NodeRecommendation) => {
    switch (node.type) {
      case 'task':
        return (
          <div className={styles.taskList}>
            {node.data.tasks?.map((task, index) => (
              <div key={index} className={styles.taskItem}>
                <span className={styles.taskStatus}>{task.status}</span>
                <span className={styles.taskText}>{task.text}</span>
              </div>
            ))}
          </div>
        );
      case 'calendar':
        return (
          <div className={styles.eventList}>
            {node.data.events?.map((event, index) => (
              <div key={index} className={styles.eventItem}>
                <span className={styles.eventDate}>{event.date}</span>
                <span className={styles.eventTitle}>{event.title}</span>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className={styles.tableData}>
            {node.data.columns && node.data.rows && (
              <table>
                <thead>
                  <tr>
                    {node.data.columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {node.data.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderGeneratedContent = () => {
    if (!nodeRecommendations.length) return null;

    return (
      <div className={styles.generatedContentContainer}>
        <h3 className={styles.sectionTitle}>Generated Project Structure</h3>
        <div className={styles.generatedContent}>
          {nodeRecommendations.map((node, index) => (
            <div key={index} className={styles.nodeContent}>
              <div className={styles.nodeHeader}>
                <h4 className={styles.nodeTitle}>{node.data.title}</h4>
                <span className={styles.nodeType}>{node.type}</span>
              </div>
              <p className={styles.nodeDescription}>{node.data.description}</p>
              <div className={styles.nodeSpecificData}>
                {renderNodeSpecificData(node)}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={copyGeneratedOutput} className={styles.copyButton}>
          Copy Content
        </Button>
      </div>
    );
  };

  const copyGeneratedOutput = () => {
    const content = responseContent
      .split('\n')
      .filter((line) => line.includes('::'))
      .map((line) => {
        const [title, description] = line.split('::');
        return `${title.trim()}\n${description.trim()}\n\n`;
      })
      .join('');

    navigator.clipboard.writeText(content);
    toast({
      title: 'Content Copied',
      description: 'The generated content has been copied to your clipboard.'
    });
    onClose();
  };

  const renderResponse = () => {
    if (!isResponseReady) return null;

    switch (responseType) {
      case 'followUp':
        return (
          <div className={styles.followUpContainer}>
            <FaQuestionCircle className={styles.icon} />
            <p className={styles.followUpQuestion}>{responseContent}</p>
            <textarea
              className={styles.textarea}
              placeholder="Your answer to the follow-up question"
              value={followUpAnswer}
              onChange={(e) => setFollowUpAnswer(e.target.value)}
            />
          </div>
        );
      case 'advice':
        return (
          <div className={styles.adviceContainer}>
            <BsLightbulb className={styles.icon} />
            <p className={styles.advice}>{responseContent}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderIntentAnalysis = () => {
    if (!intentAnalysis) return null;

    return (
      <div className={styles.intentDisplay}>
        <h3 className={styles.intentTitle}>Project Analysis</h3>
        <div className={styles.intentInfo}>
          <div className={styles.intentItem}>
            <span className={styles.intentLabel}>Primary Purpose</span>
            <span>{intentAnalysis.primary}</span>
          </div>
          <div className={styles.intentItem}>
            <span className={styles.intentLabel}>Timeframe</span>
            <span>{intentAnalysis.timeframe}</span>
          </div>
          <div className={styles.intentItem}>
            <span className={styles.intentLabel}>Complexity</span>
            <span>{intentAnalysis.complexity}</span>
          </div>
          <div className={styles.intentItem}>
            <span className={styles.intentLabel}>Audience</span>
            <span>{intentAnalysis.audience}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showConfirmModal}
        onClose={onClose}
        title="AI Project Architect V3"
      >
        <div className={styles.content}>
          <form onSubmit={handleGenerateCanvas}>
            <textarea
              className={styles.textarea}
              placeholder="Describe your project idea or goal and let AI analyze and create an optimized structure"
              value={projectConcept}
              onChange={handleProjectConceptChange}
            />
            {renderIntentAnalysis()}
            {renderResponse()}
            {renderGeneratedContent()}
            <div className={styles.actionContainer}>
              <div className={styles.dropdownContainer}>
                <Dropdown
                  value={selectedModel}
                  onChange={(value) => setSelectedModel(value)}
                  variant="slim"
                  className={styles.dropdown}
                  disabled={responseType === 'followUp'}
                >
                  <option value="claude-3-5-sonnet-20240620">
                    Claude 3.5 Sonnet
                  </option>
                  <option value="gpt-4o">GPT-4o</option>
                </Dropdown>
                <Dropdown
                  value={selectedLayout}
                  onChange={(value) => setSelectedLayout(value as LayoutType)}
                  variant="slim"
                  className={styles.dropdown}
                  disabled={responseType === 'followUp'}
                >
                  {layoutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Dropdown>
              </div>
              <Button
                type="submit"
                disabled={
                  uiIsLoading ||
                  (!projectConcept.trim() && !followUpAnswer.trim())
                }
                loading={uiIsLoading}
                variant="submit"
                className={styles.generateButton}
              >
                {uiIsLoading
                  ? 'Generating...'
                  : responseType === 'followUp'
                    ? 'Submit Answer'
                    : 'Generate'}
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
            handleConfirmIntegration(generatedNodes, generatedEdges)
          }
          onCancel={handleCancelIntegration}
        />
      )}
    </>
  );
};

export default AIGeneratorModalV3;
