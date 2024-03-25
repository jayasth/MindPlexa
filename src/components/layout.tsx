import React from "react";
import Head from "next/head";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>MindPlexa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-alabaster py-4 px-6 flex justify-between items-center">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Clickable logo/text to go back to the homepage */}
          <Link href="/" passHref>
            <div className="text-sonic-silver font-heading text-2xl">
              MindPlexa
            </div>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
      <footer className="bg-light-alabaster py-8 px-6 border-t border-cadet-blue">
        <div className="text-center text-sonic-silver text-sm mt-8">
          <p>
            &copy; {new Date().getFullYear()} MindPlexa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
