import React from 'react';
import { FunctionComponent } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const ProjectLayout: FunctionComponent<LayoutProps> = ({ children }) => {
  return (
    <div className="project-layout">
      <header className="project-header">
        <h1>Project</h1>
      </header>
      <main className="project-main">{children}</main>
      <footer className="project-footer">
        © 2024 MindPlexa. All rights reserved.
      </footer>
    </div>
  );
};

export default ProjectLayout;
