import React, { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-alabaster text-sonic-silver font-body">
      <Head>
        <title>MindPlexa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-alabaster shadow">
        <div className="container mx-auto px-4 py-4">
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" passHref>
                  <span className="text-cadet-blue hover:text-dark-cadet-blue">
                    Home
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
