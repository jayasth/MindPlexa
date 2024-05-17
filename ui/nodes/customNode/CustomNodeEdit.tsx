import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './CustomNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton
} from '@/ui/nodes/CommonNodeComponents';
import {
  handleTitleChange,
  handleSave,
  handleClose,
  handleDelete,
  handleChangeColor,
  handleAddTag,
  handleAttachFile
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';

interface CustomNodeEditProps extends NodeProps {
  data: {
    id: string;
    formFields?: { type: string; label: string; value: any }[];
    title?: string;
  };
  width: number;
  height: number;
  selected: boolean;
  onNodeResizeStop: (
    nodeId: string,
    newSize: { width: number; height: number },
    newPosition: { x: number; y: number }
  ) => void;
  position: { x: number; y: number };
}

const CustomNodeEdit: React.FC<CustomNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Custom Node');
  const [formFields, setFormFields] = useState(data.formFields || []);
  const [backgroundColor, setBackgroundColor] = useState('#f8f8f8');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);

  const updateNode = useStore((state) => state.updateNode);

  useEffect(() => {
    updateNode(data.id, { data: { title, formFields, tags, attachedFiles } });
  }, [title, formFields, tags, attachedFiles, updateNode, data.id]);

  const onChangeTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleFormFieldChange = (
    index: number,
    newField: { type: string; label: string; value: any }
  ) => {
    const updatedFields = formFields.map((field, i) =>
      i === index ? newField : field
    );
    setFormFields(updatedFields);
    updateNode(data.id, { data: { ...data, formFields: updatedFields } });
  };

  const addFormField = (type: string) => {
    setFormFields([...formFields, { type, label: '', value: '' }]);
  };

  const onChangeColor = (newColor: string) => {
    setBackgroundColor(newColor);
  };

  const onAddTag = (newTag: string) => {
    setTags([...tags, newTag]);
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles(files);
  };

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  const handleResize = (event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  return (
    <div
      className={styles.customNode}
      style={{ width: nodeWidth, height: nodeHeight, backgroundColor }}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={200}
        onResize={handleResize}
      />
      <div className={styles.header}>
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className={styles.titleInput}
        />
        <CloseButton
          onClick={() =>
            handleClose(data.id, () => {}, title, JSON.stringify(formFields))
          }
        />
      </div>
      <div className={styles.formBuilder}>
        {formFields.map((field, index) => (
          <div key={index} className={styles.formField}>
            <select
              value={field.type}
              onChange={(e) =>
                handleFormFieldChange(index, { ...field, type: e.target.value })
              }
            >
              <option value="text">Text</option>
              <option value="dropdown">Dropdown</option>
              <option value="checkbox">Checkbox</option>
            </select>
            <input
              type="text"
              value={field.label}
              onChange={(e) =>
                handleFormFieldChange(index, {
                  ...field,
                  label: e.target.value
                })
              }
              placeholder="Label"
            />
            <input
              type="text"
              value={field.value}
              onChange={(e) =>
                handleFormFieldChange(index, {
                  ...field,
                  value: e.target.value
                })
              }
              placeholder="Value"
            />
          </div>
        ))}
        <button
          onClick={() => addFormField('text')}
          className={styles.addFormFieldButton}
        >
          Add Field
        </button>
      </div>
      <div className={styles.footer}>
        <SaveButton
          onClick={() =>
            handleSave(data.id, () => {}, {
              title,
              formFields,
              tags,
              attachedFiles
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton
          onClick={() =>
            handleChangeColor(data.id, backgroundColor, onChangeColor)
          }
        />
        <AddTagButton onClick={() => handleAddTag(data.id, tags, onAddTag)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFiles)(e)}
        />
      </div>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      {attachedFiles.length > 0 && (
        <div className={styles.attachedFile}>
          Attached files: {attachedFiles.map((file) => file.name).join(', ')}
        </div>
      )}
      <Handle
        type="target"
        position={Position.Top}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleTop}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default CustomNodeEdit;
