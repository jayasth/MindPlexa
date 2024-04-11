
import Sidebar from './_components/Sidebar';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex">
        <Sidebar />
        <div className="ml-16 md:ml-60 p-4">{children}</div>
      </div>
  );
}
