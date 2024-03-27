import React, { ReactNode, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-alabaster text-sonic-silver font-body">
      <Head>
        <title>MindPlexa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-alabaster shadow">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" passHref>
              <span className="text-cadet-blue hover:text-dark-cadet-blue">
                MindPlexa
              </span>
            </Link>
            <div className="sm:hidden">
              <button type="button" onClick={() => setIsOpen(!isOpen)}>
                <FiMenu />
              </button>
            </div>
            <ul className={`space-x-4 ${isOpen ? "block" : "hidden"} sm:flex`}>
              <li>
                <Link href="/agents/IdeaMapper" passHref>
                  <span className="text-cadet-blue hover:text-dark-cadet-blue">
                    Idea Mapper
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/agents/BrainstormBuddy" passHref>
                  <span className="text-cadet-blue hover:text-dark-cadet-blue">
                    Brainstorm Buddy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/agents/IdeaVault" passHref>
                  <span className="text-cadet-blue hover:text-dark-cadet-blue">
                    Idea Vault
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/signup" passHref>
                  <span className="text-cadet-blue hover:text-dark-cadet-blue">
                    Signup
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/login" passHref>
                  <span className="text-cadet-blue hover:text-dark-cadet-blue">
                    Login
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
      <footer className="bg-light-alabaster mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-subtle-text">
          <p>
            &copy; {new Date().getFullYear()} MindPlexa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
