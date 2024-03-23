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
      <header className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Clickable logo/text to go back to the homepage */}
          <Link href="/" passHref>
            <div className="text-xl font-bold">MindPlexa</div>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} MindPlexa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
