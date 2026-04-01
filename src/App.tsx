import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import AppInitializer from './AppInitializer';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Library from './pages/Library';
import ModulePage from './pages/ModulePage';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import BillingSuccess from './pages/BillingSuccess';
import BillingCancel from './pages/BillingCancel';
import API from './pages/API';
import About from './pages/About';
import Contact from './pages/Contact';
import ProtectedAPIRoute from './utils/ProtectedAPIRoute';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Careers from './pages/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ForgotPassword from './pages/ForgotPassword';
import CustomPageViewer from './pages/CustomPageViewer';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import CommunityLibrary from './pages/CommunityLibrary';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Members from './pages/Members';
import StoryBattle from './pages/StoryBattle';
import VoiceEngine from './pages/VoiceEngine';
import VoiceShare from './pages/VoiceShare';
import HelpCenter from './pages/HelpCenter';
import Documentation from './pages/Documentation';
import Community from './pages/Community';
import Status from './pages/Status';
import OwnerLayout from './components/owner/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import UserManagement from './pages/owner/UserManagement';
import AdminManagement from './pages/owner/AdminManagement';
import Revenue from './pages/owner/Revenue';
import AIToolsManager from './pages/owner/AIToolsManager';
import AnalyticsDashboard from './pages/owner/AnalyticsDashboard';
import PageManager from './pages/owner/PageManager';
import ContentManager from './pages/owner/ContentManager';
import FeatureControl from './pages/owner/FeatureControl';
import SecurityCenter from './pages/owner/SecurityCenter';
import SystemSettings from './pages/owner/SystemSettings';
import SystemDiagnostics from './pages/owner/SystemDiagnostics';
import AISystemBot from './pages/owner/AISystemBot';
import AIAnalytics from './pages/owner/AIAnalytics';
import VoiceAnalytics from './pages/owner/VoiceAnalytics';
import AIModelManager from './pages/owner/AIModelManager';
import CostControlManager from './pages/owner/CostControlManager';
import ActivityLog from './pages/owner/ActivityLog';
import SubAdmins from './pages/owner/SubAdmins';
import NotificationsManager from './pages/owner/NotificationsManager';
import APIKeys from './pages/owner/APIKeys';
import Integrations from './pages/owner/Integrations';
import OwnerHealth from './pages/owner/OwnerHealth';
import ErrorBoundary from './components/ErrorBoundary';
import { AppMode } from './types';
import { Toaster } from 'react-hot-toast';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <AuthProvider>
          <AppInitializer>
            <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/billing/success" element={<BillingSuccess />} />
                <Route path="/billing/cancel" element={<BillingCancel />} />
                <Route path="/api" element={
                  <ProtectedAPIRoute>
                    <API />
                  </ProtectedAPIRoute>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/community" element={<Community />} />
                <Route path="/status" element={<Status />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/voice/:id" element={<VoiceShare />} />
                <Route path="/p/:slug" element={<CustomPageViewer />} />
                
                {/* Workspace Routes */}
                <Route path="/workspace" element={<WorkspaceLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="feed" element={<Feed />} />
                  <Route path="members" element={<Members />} />
                  <Route path="profile/:userId" element={<Profile />} />
                  <Route path="profile/edit" element={<EditProfile />} />
                  <Route path="community" element={<CommunityLibrary />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="messages/:userId" element={<Messages />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="battles" element={<StoryBattle />} />
                  
                  <Route path="story" element={<ModulePage mode={AppMode.STORY} />} />
                  <Route path="hooks" element={<ModulePage mode={AppMode.HOOKS} />} />
                  <Route path="script" element={<ModulePage mode={AppMode.REWRITE} />} />
                  <Route path="voiceover" element={<ModulePage mode={AppMode.VOICEOVER} />} />
                  <Route path="voice-engine" element={<VoiceEngine />} />
                  <Route path="prompts" element={<ModulePage mode={AppMode.PROMPTS} />} />
                  <Route path="social" element={<ModulePage mode={AppMode.SOCIAL} />} />
                  <Route path="character" element={<ModulePage mode={AppMode.CHARACTER} />} />
                  <Route path="ebook" element={<ModulePage mode={AppMode.EBOOK} />} />
                  <Route path="continuation" element={<ModulePage mode={AppMode.CONTINUATION} />} />
                  <Route path="expander" element={<ModulePage mode={AppMode.EXPANDER} />} />
                  <Route path="chapter" element={<ModulePage mode={AppMode.CHAPTER} />} />
                  <Route path="script-writer" element={<ModulePage mode={AppMode.SCRIPT_WRITER} />} />
                  <Route path="hashtag" element={<ModulePage mode={AppMode.HASHTAG} />} />
                  <Route path="caption" element={<ModulePage mode={AppMode.CAPTION} />} />
                  <Route path="yt-title" element={<ModulePage mode={AppMode.YT_TITLE} />} />
                  <Route path="video-idea" element={<ModulePage mode={AppMode.VIDEO_IDEA} />} />
                  <Route path="shorts-script" element={<ModulePage mode={AppMode.SHORTS_SCRIPT} />} />
                  <Route path="cover" element={<ModulePage mode={AppMode.COVER} />} />
                  <Route path="audiobook" element={<ModulePage mode={AppMode.AUDIOBOOK} />} />
                  <Route path="ad-copy" element={<ModulePage mode={AppMode.AD_COPY} />} />
                  <Route path="email" element={<ModulePage mode={AppMode.EMAIL} />} />
                  <Route path="product-desc" element={<ModulePage mode={AppMode.PRODUCT_DESC} />} />
                  <Route path="improver" element={<ModulePage mode={AppMode.IMPROVER} />} />
                  <Route path="chat" element={<ModulePage mode={AppMode.CHAT} />} />
                  <Route path="image" element={<ModulePage mode={AppMode.IMAGE} />} />
                  <Route path="tool/:slug" element={<ModulePage />} />
                  <Route path="library" element={<Library />} />
                  <Route path="admin" element={<Admin />} />
                  
                  {/* Fallback for workspace */}
                  <Route path="*" element={<Navigate to="/workspace" replace />} />
                </Route>
  
                {/* Owner Routes */}
                <Route path="/owner" element={<OwnerLayout />}>
                  <Route index element={<OwnerDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="team-admins" element={<AdminManagement />} />
                  <Route path="pages" element={<PageManager />} />
                  <Route path="sub-admins" element={<SubAdmins />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route path="revenue" element={<Revenue />} />
                  <Route path="cms" element={<ContentManager />} />
                  <Route path="ai-analytics" element={<AIAnalytics />} />
                  <Route path="voice-analytics" element={<VoiceAnalytics />} />
                  <Route path="ai-models" element={<AIModelManager />} />
                  <Route path="cost-control" element={<CostControlManager />} />
                  <Route path="ai-tools" element={<AIToolsManager />} />
                  <Route path="features" element={<FeatureControl />} />
                  <Route path="notifications" element={<NotificationsManager />} />
                  <Route path="security" element={<SecurityCenter />} />
                  <Route path="settings" element={<SystemSettings />} />
                  <Route path="diagnostics" element={<SystemDiagnostics />} />
                  <Route path="ai-bot" element={<AISystemBot />} />
                  <Route path="logs" element={<ActivityLog />} />
                  <Route path="api-keys" element={<APIKeys />} />
                  <Route path="integrations" element={<Integrations />} />
                  <Route path="health" element={<OwnerHealth />} />
                </Route>
  
                {/* Global Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AppInitializer>
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
