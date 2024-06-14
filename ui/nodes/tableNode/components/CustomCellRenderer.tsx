import React, { useState } from 'react';
import CellContextMenu from '@/ui/nodes/tableNode/components/CellContextMenu';

interface CustomCellRendererProps {
  params: any;
}

const CustomCellRenderer: React.FC<CustomCellRendererProps> = ({ params }) => {
  const [cellContextMenuPosition, setCellContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [cellContextMenuParams, setCellContextMenuParams] = useState<any>(null);

  const handleCellContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCellContextMenuPosition({ x: event.clientX, y: event.clientY });
    setCellContextMenuParams(params);
  };

  const handleCellContextMenuClose = () => {
    setCellContextMenuPosition(null);
    setCellContextMenuParams(null);
  };

  return (
    <div onContextMenu={handleCellContextMenu}>
      {params.value}
      {cellContextMenuPosition && cellContextMenuParams && (
        <CellContextMenu
          id="cell-context-menu"
          position={cellContextMenuPosition}
          params={cellContextMenuParams}
          onClose={handleCellContextMenuClose}
          setContent={params.context.setContent}
          content={params.context.content}
          gridRef={params.context.gridRef}
        />
      )}
    </div>
  );
};

export default CustomCellRenderer;
