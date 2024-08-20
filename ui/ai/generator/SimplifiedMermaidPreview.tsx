import React from 'react';
import styles from './SimplifiedMermaidPreview.module.css';

interface SimplifiedMermaidPreviewProps {
  code: string;
}

export const SimplifiedMermaidPreview: React.FC<
  SimplifiedMermaidPreviewProps
> = ({ code }) => {
  const simplifyMermaidCode = (code: string) => {
    return code
      .split('\n')
      .filter((line) => line.trim() !== '' && !line.includes('::'))
      .map((line) => line.replace(/\[.*?\]/, '[]'))
      .join('\n');
  };

  return (
    <div className={styles.simplifiedPreview}>
      <h4 className={styles.previewTitle}>Simplified Structure</h4>
      <pre className={styles.codePreview}>{simplifyMermaidCode(code)}</pre>
    </div>
  );
};
