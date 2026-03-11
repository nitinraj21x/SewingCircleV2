import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminPanel = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {user ? (
        <AdminDashboard />
      ) : (
        <AdminLogin />
      )}
    </div>
  );
};

export default AdminPanel;