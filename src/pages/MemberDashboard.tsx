import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Zap, 
  BookOpen, 
  Share2, 
  Youtube, 
  Library, 
  Target,
  ArrowUpRight,
  Search,
  Filter,
  ArrowRight,
  Copy,
  Check,
  Briefcase,
  Activity as ActivityIcon
} from 'lucide-react';
import { RootState } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Task, Activity } from '../types';

const MemberDashboard: React.FC = () => {
  const { user: currentUser, token } = useSelector((state: RootState) => state.auth);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activitiesLoading, setActivitiesLoading] = React.useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchActivities();
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      // Fetch tasks from all workspaces the user is a member of
      const wsRes = await fetch('/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (wsRes.ok) {
        const workspaces = await wsRes.json();
        const allTasks: Task[] = [];
        for (const ws of workspaces) {
          const taskRes = await fetch(`/api/workspaces/${ws.id}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (taskRes.ok) {
            const wsTasks = await taskRes.json();
            allTasks.push(...wsTasks.filter((t: Task) => t.assignedTo === currentUser?.id));
          }
        }
        setTasks(allTasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.slice(0, 5)); // Only show last 5
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const stats = [
    { label: 'Credits Left', value: currentUser?.credits || 0, icon: Zap, color: 'text-primary' },
    { label: 'Generations', value: currentUser?.generationCount || 0, icon: Sparkles, color: 'text-success' },
    { label: 'Active Tasks', value: tasks.filter(t => t.status !== 'completed').length, icon: Briefcase, color: 'text-accent' },
    { label: 'Plan', value: (currentUser?.plan || 'free').toUpperCase(), icon: Target, color: 'text-warning' },
  ];

  const quickActions = [
    { label: 'New Story', icon: BookOpen, path: '/workspace/story', color: 'primary' },
    { label: 'Social Post', icon: Share2, path: '/workspace/social', color: 'warning' },
    { label: 'Video Script', icon: Youtube, path: '/workspace/script', color: 'accent' },
    { label: 'Ad Copy', icon: Target, path: '/workspace/ad-copy', color: 'success' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-display">
            Welcome back, <span className="text-primary">{currentUser?.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-body max-w-xl">
            Your creative workspace is ready. What would you like to build today?
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search tasks or tools..."
              className="pl-12 pr-6 py-3.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all w-72"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="feature-card-enhanced hover:border-primary/50 transition-all duration-300 hover-lift"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
                <stat.icon className={`w-6 h-6 ${stat.color} group-hover:text-white transition-colors duration-300`} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1 group-hover:text-text-primary transition-colors duration-300">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary group-hover:text-white transition-colors duration-300">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content: Assigned Tasks */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-heading flex items-center gap-4 group-hover:text-white transition-colors duration-300">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-purple-500 to-indigo-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              Assigned Tasks
            </h2>
            <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-300">View All</button>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-surface border border-border rounded-lg animate-pulse" />
              ))
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 bg-surface/50 border border-border rounded-xl flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary/50">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-text-secondary font-medium">No pending tasks. You're all caught up!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="feature-card-enhanced hover:border-primary/50 transition-all duration-300 hover-lift"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="text-heading group-hover:text-white transition-colors duration-300">{task.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300">
                            <Clock className="w-4 h-4" />
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            task.priority === 'high' ? 'bg-danger/10 text-danger border-danger/20' :
                            task.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 
                            'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      task.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                      task.status === 'in-progress' ? 'bg-warning/10 text-warning border-warning/20' : 
                      'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-heading flex items-center gap-4 group-hover:text-white transition-colors duration-300">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-purple-500 to-indigo-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Quick Tools
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="feature-card-enhanced hover:border-primary/50 transition-all duration-300 hover-lift text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center mb-4 mx-auto">
                    <action.icon className={`w-6 h-6 text-${action.color} group-hover:text-white transition-colors duration-300`} />
                  </div>
                  <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors duration-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-heading flex items-center gap-4 group-hover:text-white transition-colors duration-300">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-purple-500 to-indigo-500 flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-white" />
              </div>
              Activity
            </h2>
            <div className="feature-card-enhanced overflow-hidden">
              {activitiesLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-surface animate-pulse rounded-lg" />
                ))
              ) : activities.length === 0 ? (
                <div className="p-8 text-center text-sm text-text-secondary italic group-hover:text-text-primary transition-colors duration-300">
                  No recent activity found.
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <ActivityIcon className="w-4 h-4 text-text-secondary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary group-hover:text-white transition-colors duration-300">{activity.type}</p>
                        <p className="text-xs text-text-secondary truncate mt-1 group-hover:text-text-primary transition-colors duration-300">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-text-secondary/60" />
                          <p className="text-xs text-text-secondary/60 font-medium group-hover:text-text-primary transition-colors duration-300">
                            {new Date(activity.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full py-3 bg-surface border border-border text-text-secondary hover:text-text-primary rounded-lg text-sm font-medium transition-all duration-300 hover:border-primary/50 hover:bg-surface/50">
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
