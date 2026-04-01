import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIGuideAssistant from '../AIGuideAssistant';
import OnboardingTour from '../OnboardingTour';
import { motion } from 'motion/react';

const WorkspaceLayout: React.FC = () => {
  const { user: currentUser, loading: isLoading } = useSelector((state: RootState) => state.auth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bg relative overflow-hidden antialiased">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full animate-pulse-glow"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar relative">
          <div className="glow-bg top-0 right-0 opacity-10"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <AIGuideAssistant />
      <OnboardingTour />
    </div>
  );
};

export default WorkspaceLayout;
