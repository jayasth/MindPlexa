// src/components/layout.tsx

import React, { ReactNode } from "react";
import Link from "next/link";
import { useUser } from "../utils/useUser";
import { supabase } from "../utils/supabaseClient";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/dashboard">
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  Dashboard
                </span>
              </Link>
            </li>
            <li>
              <Link href="/agents/IdeaMapper">
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  IdeaMapper
                </span>
              </Link>
            </li>
            <li>
              <Link href="/agents/BrainstormBuddy">
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  BrainstormBuddy
                </span>
              </Link>
            </li>
            <li>
              <Link href="/agents/IdeaVault">
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  IdeaVault
                </span>
              </Link>
            </li>
            <li>
              <Link href="/profile">
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  Profile
                </span>
              </Link>
            </li>
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
