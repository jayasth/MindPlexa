// src/components/layout.tsx
import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { useUser } from "../utils/useUser";
import { supabase } from "../utils/supabaseClient";
import { FiMenu, FiX } from "react-icons/fi";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <img
                  src="/assets/icons/logo.svg"
                  alt="Logo"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </span>
                  </Link>
                  {/* Add more authenticated links */}
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <span className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                      Sign Up
                    </span>
                  </Link>
                  <Link href="/login">
                    <span className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                      Log In
                    </span>
                  </Link>
                </>
              )}
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
              >
                {isOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <span className="text-gray-500 hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium">
                    Dashboard
                  </span>
                </Link>
                {/* Add more authenticated links */}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <span className="text-gray-500 hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium">
                    Sign Up
                  </span>
                </Link>
                <Link href="/login">
                  <span className="text-gray-500 hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium">
                    Log In
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
