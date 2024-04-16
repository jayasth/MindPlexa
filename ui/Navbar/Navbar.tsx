import { createClient } from '@/utils/supabase/supabaseServer';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';
import Link from 'next/link';

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <nav className={s.root}>
      <Link href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </Link>
      <div className="max-w-6xl px-6 mx-auto">
        <Navlinks user={user} />
      </div>
    </nav>
  );
}
