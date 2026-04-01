import React, { useEffect, useState } from 'react';
import {
  createUser,
  exportData,
  getUsers,
  saveMessage,
  type PortableDatabaseDump,
} from '../services/db';

const DbUsageExample: React.FC = () => {
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [dumpPreview, setDumpPreview] = useState<string>('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data.map((item) => ({ id: item.id, name: item.name, email: item.email })));
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, []);

  const createDemoUser = async () => {
    const user = await createUser({
      email: `demo-${Date.now()}@example.com`,
      name: 'Demo User',
      role: 'user',
      status: 'active',
    });

    setUsers((prev) => [{ id: user.id, name: user.name, email: user.email }, ...prev]);
  };

  const saveDemoMessage = async () => {
    await saveMessage({
      name: 'Website Visitor',
      email: 'visitor@example.com',
      subject: 'Hello from DB layer',
      message: 'This message was saved via the provider-agnostic database service.',
      status: 'new',
    });
  };

  const handleExport = async () => {
    const dump: PortableDatabaseDump = await exportData();
    setDumpPreview(JSON.stringify(dump, null, 2));
  };

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
      <h3 className="text-lg font-semibold text-white">Database Service Example</h3>
      <p className="text-sm text-white/70">
        This component only uses generic methods from the shared DB layer.
      </p>

      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 rounded-lg bg-indigo-500 text-white" onClick={createDemoUser}>
          createUser()
        </button>
        <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white" onClick={saveDemoMessage}>
          saveMessage()
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-700 text-white" onClick={handleExport}>
          exportData()
        </button>
      </div>

      <div>
        <p className="text-sm text-white/70 mb-2">Users ({users.length})</p>
        <ul className="text-sm text-white/90 space-y-1">
          {users.map((user) => (
            <li key={user.id}>{user.name} - {user.email}</li>
          ))}
        </ul>
      </div>

      {dumpPreview && (
        <pre className="text-xs text-white/80 bg-black/30 p-3 rounded-lg overflow-auto max-h-64">
          {dumpPreview}
        </pre>
      )}
    </div>
  );
};

export default DbUsageExample;
