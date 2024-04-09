import Link from 'next/link';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            {/* Add more navigation items */}
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
