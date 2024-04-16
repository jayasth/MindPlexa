import Link from 'next/link';
import Logo from '@/ui/icons/Logo';

export default function Footer() {
  return (
    <footer className="w-full bg-myGray-600 px-6 py-6">
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <div className="col-span-1 lg:col-span-2">
          <Link
            href="/"
            className="flex items-center flex-initial font-secondary md:mr-24"
          >
            <span className="mr-2 border rounded-full border-myGray-700">
              <Logo />
            </span>
            <span>MindPlexa</span>
          </Link>
        </div>
        <span className="mt-4 lg:mt-0">
          &copy; {new Date().getFullYear()} MindPlexa, Inc. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
