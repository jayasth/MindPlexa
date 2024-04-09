import React from 'react';
import { FunctionComponent } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout: FunctionComponent<LayoutProps> = ({ children }) => {
  return (
    <div className="workspace-layout">
      <header className="workspace-header">
        <h1>Workspace</h1>
      </header>
      <main className="workspace-main">{children}</main>
      <footer className="workspace-footer">
        © 2024 MindPlexa. All rights reserved.
      </footer>
    </div>
  );
};

export default WorkspaceLayout;
