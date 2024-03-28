// src/components/Layout.tsx
import React, { ReactNode } from "react";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/agents/IdeaMapper">IdeaMapper</Link>
            </li>
            <li>
              <Link href="/agents/BrainstormBuddy">BrainstormBuddy</Link>
            </li>
            <li>
              <Link href="/agents/IdeaVault">IdeaVault</Link>
            </li>
            <li>
              <Link href="/profile">Profile</Link>
            </li>
          </ul>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
