import React from 'react';
import UserList from '../../components/dashboard/users/UserList';

export default function Users() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">
          Manage users, their roles, and organization access
        </p>
      </div>
      <UserList />
    </div>
  );
}