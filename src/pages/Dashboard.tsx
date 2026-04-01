import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import OwnerDashboard from './OwnerDashboard';
import TeamAdminDashboard from './TeamAdminDashboard';
import MemberDashboard from './MemberDashboard';

const Dashboard: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  if (!currentUser) return null;

  if (currentUser.role === 'owner') {
    return <OwnerDashboard />;
  }

  if (currentUser.role === 'admin') {
    return <TeamAdminDashboard />;
  }

  return <MemberDashboard />;
};

export default Dashboard;
