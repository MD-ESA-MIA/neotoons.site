import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Layout, 
  CheckSquare, 
  Clock, 
  UserPlus, 
  MoreVertical, 
  ChevronRight,
  Search,
  Calendar,
  MessageCircle,
  Settings,
  Briefcase,
  Filter,
  ArrowUpDown,
  Activity as ActivityIcon
} from 'lucide-react';
import { RootState } from '../store';
import { Workspace, Task, User, Activity } from '../types';
import toast from 'react-hot-toast';

const TeamAdminDashboard: React.FC = () => {
  const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const fetchWorkspaces = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const fetchActivities = async () => {
    try {
      // Admins can see all activities (or we could filter by workspace members)
      const res = await fetch('/api/activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleInviteMember = async (workspaceId: string, email: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        toast.success('Member invited successfully');
        fetchWorkspaces();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to invite member');
      }
    } catch (error) {
      toast.error('Error inviting member');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newTaskTitle.trim()) return;

    const taskData = {
      title: newTaskTitle,
      description: newTaskDesc,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      assignedTo: newTaskAssignedTo || activeWorkspace.members[0] || currentUser?.id || ''
    };

    try {
      const response = await fetch(`/api/workspaces/${activeWorkspace.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        toast.success('Task created successfully');
        fetchTasks(activeWorkspace.id);
        fetchActivities(); // Refresh activities
        setShowCreateTask(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setNewTaskAssignedTo('');
      }
    } catch (error) {
      toast.error('Error creating task');
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    fetchActivities();
  }, [token]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchTasks(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newWorkspaceName, description: newWorkspaceDesc })
      });
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(prev => [...prev, data]);
        setShowCreateWorkspace(false);
        setNewWorkspaceName('');
        setNewWorkspaceDesc('');
        toast.success('Workspace created!');
        fetchActivities(); // Refresh activities
      }
    } catch (error) {
      toast.error('Failed to create workspace');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
        toast.success('Task updated');
        fetchActivities(); // Refresh activities
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      const assigneeMatch = filterAssignedTo === 'all' || task.assignedTo === filterAssignedTo;
      return statusMatch && assigneeMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Layout className="w-8 h-8 text-accent" />
            Team Management
          </h1>
          <p className="text-text-muted">Manage your workspaces, team members, and project tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateWorkspace(true)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Workspaces */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest px-2">Your Workspaces</h3>
          <div className="space-y-2">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                  activeWorkspace?.id === ws.id 
                    ? 'bg-accent/10 border-accent/20 text-accent' 
                    : 'bg-card border-border text-text-muted hover:border-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    activeWorkspace?.id === ws.id ? 'bg-accent text-white' : 'bg-white/5 text-text-muted'
                  }`}>
                    {ws.name[0]}
                  </div>
                  <MoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-bold truncate">{ws.name}</p>
                <p className="text-[10px] opacity-60">{ws.members.length} members</p>
              </button>
            ))}
            {workspaces.length === 0 && !loading && (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-xs text-text-muted">No workspaces yet.</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="pt-6 space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest px-2 flex items-center justify-between">
              Recent Activity
              <ActivityIcon className="w-3 h-3" />
            </h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {activitiesLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="p-3 h-12 bg-white/5 animate-pulse" />
                ))
              ) : activities.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-text-muted">
                  No activity yet.
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="p-3 hover:bg-white/5 transition-colors">
                    <p className="text-[11px] font-bold text-white truncate">{activity.userName}</p>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{activity.type}</p>
                    <p className="text-[9px] text-text-muted mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Workspace Details */}
        <div className="lg:col-span-9 space-y-8">
          {activeWorkspace ? (
            <motion.div
              key={activeWorkspace.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Workspace Header */}
              <div className="bg-card border border-border p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{activeWorkspace.name}</h2>
                        <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">Active</span>
                      </div>
                      <p className="text-sm text-text-muted max-w-xl">{activeWorkspace.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white/5 hover:bg-white/10 text-text-muted rounded-xl border border-white/10 transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {activeWorkspace.members.slice(0, 3).map((m, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                            {m[0]}
                          </div>
                        ))}
                        {activeWorkspace.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-card bg-white/5 flex items-center justify-center text-[10px] font-bold text-text-muted">
                            +{activeWorkspace.members.length - 3}
                          </div>
                        )}
                      </div>
                      <button className="text-xs text-accent font-bold hover:underline flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />
                        Invite
                      </button>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-bold">{tasks.filter(t => t.status === 'completed').length}</span>
                      Tasks Completed
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-bold">{tasks.filter(t => t.status === 'todo').length}</span>
                      Pending Tasks
                    </div>
                  </div>
                </div>
              </div>

                {/* Tasks Section */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-accent" />
                      Project Tasks
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Filters */}
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                        <Filter className="w-3.5 h-3.5 text-text-muted" />
                        <select 
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Status</option>
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <div className="w-px h-3 bg-white/10 mx-1"></div>
                        <select 
                          value={filterAssignedTo}
                          onChange={(e) => setFilterAssignedTo(e.target.value)}
                          className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Assignees</option>
                          {activeWorkspace.members.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sort */}
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="createdAt">Newest First</option>
                          <option value="dueDate">Due Date</option>
                          <option value="priority">Priority</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => setShowCreateTask(true)}
                        className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {filteredAndSortedTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleUpdateTaskStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              task.status === 'completed' 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-white/10 hover:border-accent/50'
                            }`}
                          >
                            {task.status === 'completed' && <CheckSquare className="w-4 h-4" />}
                          </button>
                          <div>
                            <p className={`text-sm font-bold transition-all ${task.status === 'completed' ? 'text-text-muted line-through' : 'text-white'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                                task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  task.priority === 'high' ? 'bg-rose-500' :
                                  task.priority === 'medium' ? 'bg-orange-500' :
                                  'bg-blue-500'
                                }`} />
                                {task.priority}
                              </span>
                              <span className="text-[10px] text-text-muted flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-white/5 text-text-muted'
                              }`}>
                                {task.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                              {task.assignedTo.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-medium text-text-muted">{task.assignedTo}</span>
                          </div>
                          <button className="p-2 hover:bg-white/10 text-text-muted rounded-lg transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredAndSortedTasks.length === 0 && (
                      <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-sm text-text-muted">No tasks match your filters.</p>
                      </div>
                    )}
                  </div>
                </div>
            </motion.div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-card border border-border rounded-3xl">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Select a Workspace</h3>
                <p className="text-sm text-text-muted max-w-xs">Choose a workspace from the sidebar to manage your team and tasks.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateWorkspace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateWorkspace(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6">Create Workspace</h2>
              <form onSubmit={handleCreateWorkspace} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Workspace Name</label>
                  <input 
                    type="text"
                    required
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g. Creative Team"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Description</label>
                  <textarea 
                    value={newWorkspaceDesc}
                    onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                    placeholder="What is this workspace for?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreateWorkspace(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/20"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateTask(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6">Add New Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Task Title</label>
                  <input 
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Design Landing Page"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Description</label>
                  <textarea 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Details about the task..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Priority</label>
                    <select 
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Due Date</label>
                    <input 
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Assign To</label>
                  <select 
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                  >
                    <option value="">Select Member</option>
                    {activeWorkspace?.members.map((member) => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateTask(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/20"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamAdminDashboard;
