// src/components/layout.tsx

import React, { ReactNode, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { FiMenu } from "react-icons/fi";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      } else {
        setSession(data.session);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          setSession(session);
        }
        if (event === "SIGNED_OUT") {
          setSession(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    }
    router.push("/");
  };

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
              <span className="text-cadet-blue hover:text-dark-cadet-blue cursor-pointer">
                MindPlexa
              </span>
            </Link>
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-cadet-blue hover:text-dark-cadet-blue focus:outline-none"
              >
                <FiMenu size={24} />
              </button>
            </div>
            <ul className={`sm:flex space-x-4 ${isOpen ? "block" : "hidden"}`}>
              {session ? (
                <>
                  <li>
                    <Link href="/agents/IdeaMapper" passHref>
                      <span className="text-cadet-blue hover:text-dark-cadet-blue cursor-pointer">
                        Idea Mapper
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/agents/BrainstormBuddy" passHref>
                      <span className="text-cadet-blue hover:text-dark-cadet-blue cursor-pointer">
                        Brainstorm Buddy
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/agents/IdeaVault" passHref>
                      <span className="text-cadet-blue hover:text-dark-cadet-blue cursor-pointer">
                        Idea Vault
                      </span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-cadet-blue hover:text-dark-cadet-blue focus:outline-none"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/signup" passHref>
                      <span className="text-cadet-blue hover:text-dark-cadet-blue cursor-pointer">
                        Signup
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" passHref>
                      <span className="text-cadet-blue hover:text-dark-cadet-blue cursor-pointer">
                        Login
                      </span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
      <footer className="bg-light-alabaster py-4">
        <div className="container mx-auto text-center text-subtle-text">
          &copy; {new Date().getFullYear()} MindPlexa. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
