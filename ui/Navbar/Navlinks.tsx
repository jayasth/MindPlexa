'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import Logo from '@/ui/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/authSettings';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: {
    id: string;
    email?: string;
    // Add other relevant user properties
  } | null;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = useRouter();
  const pathname = usePathname();
  const redirectMethod = getRedirectMethod();

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="ml-6 space-x-2 lg:block">
          <Link href="/" className={s.link}>
            MindPlexa
            <span className={s.betaBadge}>Beta</span>
          </Link>
          {user && (
            <Link href="/workspace" className={s.link}>
              Workspace
            </Link>
          )}
        </nav>
      </div>
      <div className="flex justify-end space-x-8">
        {user ? (
          <form
            onSubmit={(e) =>
              handleRequest(
                e,
                SignOut,
                redirectMethod === 'client' ? router : null
              )
            }
          >
            <input type="hidden" name="pathName" value={pathname} />
            <button type="submit" className={s.link}>
              Sign out
            </button>
          </form>
        ) : (
          <>
            <Link href="/signin" className={s.link}>
              Sign In
            </Link>
            <Link href="/signin/signup" className={s.link}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
