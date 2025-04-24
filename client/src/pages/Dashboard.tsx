import React from 'react';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-6">Welcome to your PaySurity dashboard.</p>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;