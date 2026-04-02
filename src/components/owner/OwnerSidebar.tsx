import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  FileText, 
  Bell, 
  ShieldAlert, 
  Settings, 
  History, 
  Key, 
  Plug,
  Activity,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Flag,
  Zap,
  BarChart3,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  group?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/owner', icon: LayoutDashboard, group: 'Main' },
  { label: 'Users', path: '/owner/users', icon: Users, group: 'Management' },
  { label: 'Team Admins', path: '/owner/team-admins', icon: ShieldCheck, group: 'Management' },
  { label: 'Sub-Admins', path: '/owner/sub-admins', icon: ShieldCheck, group: 'Management' },
  { label: 'Pages', path: '/owner/pages', icon: FileText, group: 'Content' },
  { label: 'CMS Manager', path: '/owner/cms', icon: LayoutDashboard, group: 'Content' },
  { label: 'Feature Control', path: '/owner/features', icon: Flag, group: 'System' },
  { label: 'AI Tools', path: '/owner/ai-tools', icon: Zap, group: 'AI' },
  { label: 'AI Analytics', path: '/owner/ai-analytics', icon: BarChart3, group: 'AI' },
  { label: 'Voice Analytics', path: '/owner/voice-analytics', icon: BarChart3, group: 'AI' },
  { label: 'Notifications', path: '/owner/notifications', icon: Bell, group: 'System' },
  { label: 'Security Center', path: '/owner/security', icon: ShieldAlert, group: 'System' },
  { label: 'System Settings', path: '/owner/settings', icon: Settings, group: 'System' },
  { label: 'System Diagnostics', path: '/owner/diagnostics', icon: Activity, group: 'System' },
  { label: 'AI System Bot', path: '/owner/ai-bot', icon: Bot, group: 'AI' },
  { label: 'Logs', path: '/owner/logs', icon: History, group: 'System' },
  { label: 'API Keys', path: '/owner/api-keys', icon: Key, group: 'System' },
  { label: 'Integrations', path: '/owner/integrations', icon: Plug, group: 'System' },
  { label: 'Owner Health', path: '/owner/health', icon: Activity, group: 'System' },
];

const OwnerSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout: clerkLogout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await clerkLogout();
    } catch (_error) {
      // Continue local logout even if Clerk call fails
    } finally {
      dispatch(logout());
      localStorage.removeItem('neotoons_user');
      localStorage.removeItem('neotoons_clerk_token');
      navigate('/login');
    }
  };

  const groups = Array.from(new Set(navItems.map(item => item.group)));

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className="h-screen sticky top-0 bg-card/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-40 overflow-hidden transition-all duration-300"
    >
      {/* Logo Section */}
      <div className="p-6 shrink-0 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-accent/20">
          O
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-bold text-sm tracking-widest text-white uppercase">NEOTOONS</span>
              <span className="text-[10px] text-accent-light font-medium uppercase tracking-tighter">Owner Panel</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {groups.map((group) => (
          <div key={group} className="space-y-1">
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2"
              >
                {group}
              </motion.h3>
            )}
            {navItems.filter(item => item.group === group).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.path} className="relative">
                  <NavLink
                    to={item.path}
                    end={item.path === '/owner'}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                      isActive
                        ? "bg-accent/10 text-white"
                        : "text-text-muted hover:text-white hover:bg-white/5",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0 transition-all duration-300",
                      isActive ? "text-accent-light" : "group-hover:text-accent-light",
                      isActive && "drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                    )} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    )}
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                      />
                    )}
                  </NavLink>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isCollapsed && hoveredItem === item.label && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 20 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute left-full top-1/2 -translate-y-1/2 px-3 py-1.5 bg-card border border-white/10 rounded-lg text-xs font-medium text-white whitespace-nowrap z-50 shadow-xl pointer-events-none"
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5",
          isCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent-light shrink-0">
            <UserCircle className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Admin User</span>
              <span className="text-[10px] text-text-muted truncate">Owner</span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-medium text-sm",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default OwnerSidebar;
