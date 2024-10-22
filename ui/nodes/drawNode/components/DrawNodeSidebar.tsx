import React from 'react';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import styles from './DrawNodeSidebar.module.css';

interface Tool {
  tool: {
    name: string;
  };
  icon: React.ComponentType<{ size: number }>;
}

interface DrawNodeSidebarProps {
  tools: Tool[];
  currentToolIndex: number;
  onToolChange: (index: number) => void;
  textColor: string;
}

const DrawNodeSidebar: React.FC<DrawNodeSidebarProps> = ({
  tools,
  currentToolIndex,
  onToolChange,
  textColor
}) => {
  const iconSize = 16;

  return (
    <div className={styles.sidebar}>
      {tools.map((tool, index) => (
        <Tooltip key={tool.tool.name} content={tool.tool.name}>
          <button
            className={`${styles.toolbarButton} ${
              index === currentToolIndex ? styles.selected : ''
            }`}
            onClick={() => onToolChange(index)}
            style={{ color: textColor }}
          >
            <tool.icon size={iconSize} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default DrawNodeSidebar;
