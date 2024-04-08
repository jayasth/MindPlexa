import Link from 'next/link';
import Logo from '@/components/icons/Logo';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-800">
      <div className="flex flex-col lg:flex-row items-center justify-between py-6">
        <div className="col-span-1 lg:col-span-2">
          <Link
            href="/"
            className="flex items-center flex-initial font-secondary md:mr-24"
          >
            <span className="mr-2 border rounded-full border-zinc-700">
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
