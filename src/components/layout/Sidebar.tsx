import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { Icons, getIcon } from '../Icons';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Badge from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronRight, 
  MessageCircle, 
  Bell, 
  Users, 
  LayoutDashboard, 
  Library, 
  Settings, 
  LogOut,
  UserCircle,
  Zap,
  BookOpen,
  Maximize,
  FileText,
  Video,
  Feather,
  Share2,
  Hash,
  MessageSquare,
  Mic2,
  Headphones
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  label: string;
  path: string;
  icon: string | React.ElementType;
}

interface NavCategory {
  label: string;
  icon: string | React.ElementType;
  items: NavItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Writing Tools', 'Social Media Tools', 'Audio Tools']);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleCategory = (label: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedCategories([label]);
      return;
    }
    setExpandedCategories(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const categories: NavCategory[] = [
    {
      label: 'Writing Tools',
      icon: Feather,
      items: [
        { label: 'Story Generator', path: '/workspace/story', icon: BookOpen },
        { label: 'Story Expander', path: '/workspace/expander', icon: Maximize },
        { label: 'Chapter Generator', path: '/workspace/chapter', icon: FileText },
        { label: 'Script Writer', path: '/workspace/script-writer', icon: Video },
        { label: 'Script Rewriter', path: '/workspace/script', icon: Feather },
      ]
    },
    {
      label: 'Social Media Tools',
      icon: Share2,
      items: [
        { label: 'Viral Hooks', path: '/workspace/hooks', icon: Zap },
        { label: 'Social Posts', path: '/workspace/social', icon: Share2 },
        { label: 'Hashtag Generator', path: '/workspace/hashtag', icon: Hash },
        { label: 'Caption Generator', path: '/workspace/caption', icon: MessageSquare },
      ]
    },
    {
      label: 'Audio Tools',
      icon: Headphones,
      items: [
        { label: 'Text to Voice', path: '/workspace/voice-engine', icon: Mic2 },
      ]
    }
  ];

  const renderIcon = (icon: string | React.ElementType, className: string) => {
    if (typeof icon === 'string') {
      return getIcon(icon, className);
    }
    const IconComponent = icon;
    return <IconComponent className={className} />;
  };

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
          N
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
              <span className="text-[10px] text-accent-light font-medium uppercase tracking-tighter">AI Workspace</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {/* Main Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Main</h3>
          )}
          <NavLink
            to="/workspace"
            end
            onMouseEnter={() => setHoveredItem('Dashboard')}
            onMouseLeave={() => setHoveredItem(null)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
              isActive 
                ? "bg-accent/10 text-white" 
                : "text-text-muted hover:text-white hover:bg-white/5",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LayoutDashboard className={cn(
              "w-5 h-5 shrink-0 transition-all duration-300",
              location.pathname === '/workspace' ? "text-accent-light" : "group-hover:text-accent-light",
              location.pathname === '/workspace' && "drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
            )} />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
            {location.pathname === '/workspace' && (
              <motion.div layoutId="active-pill-ws" className="absolute left-0 w-1 h-6 bg-accent rounded-r-full" />
            )}
          </NavLink>
        </div>

        {/* Tools Section */}
        <div className="space-y-4">
          {!isCollapsed && (
            <h3 className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">AI Tools</h3>
          )}
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat.label)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <div className="flex items-center gap-2">
                  {renderIcon(cat.icon, "w-3.5 h-3.5 shrink-0")}
                  {!isCollapsed && <span>{cat.label}</span>}
                </div>
                {!isCollapsed && (expandedCategories.includes(cat.label) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
              </button>
              
              <AnimatePresence initial={false}>
                {!isCollapsed && expandedCategories.includes(cat.label) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1"
                  >
                    {cat.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-4 py-2 rounded-xl transition-all group ml-2",
                          isActive 
                            ? "bg-accent/10 text-white" 
                            : "text-text-muted hover:text-white hover:bg-white/5"
                        )}
                      >
                        {renderIcon(item.icon, "w-4 h-4 shrink-0")}
                        <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Library Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Storage</h3>
          )}
          <NavLink
            to="/workspace/library"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
              isActive 
                ? "bg-cyan/10 text-white" 
                : "text-text-muted hover:text-white hover:bg-white/5",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Library className={cn(
              "w-5 h-5 shrink-0 transition-all duration-300",
              location.pathname === '/workspace/library' ? "text-cyan" : "group-hover:text-cyan"
            )} />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">My Library</span>}
          </NavLink>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5",
          isCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent-light shrink-0 overflow-hidden">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="w-5 h-5" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{currentUser?.name}</span>
              <Badge variant={currentUser?.plan === 'studio' ? 'gold' : currentUser?.plan === 'pro' ? 'accent' : 'muted'} className="text-[8px] px-1.5 py-0 w-fit">
                {currentUser?.plan}
              </Badge>
            </div>
          )}
        </div>

        <button 
          onClick={() => dispatch(logout())}
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

export default Sidebar;
