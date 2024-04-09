import DashboardLayout from './_components/DashboardLayout';

const DashboardLayoutWrapper = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardLayoutWrapper;
