import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;