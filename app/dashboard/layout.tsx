import React from 'react';
import Sidebar from './_components/Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-16 md:ml-60 p-4">{children}</div>
    </div>
  );
};

export default DashboardLayout;
