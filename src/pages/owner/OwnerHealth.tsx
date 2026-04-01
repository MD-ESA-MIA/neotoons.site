import React from 'react';
import { CheckCircle2, XCircle, Activity, ShieldCheck, RefreshCw } from 'lucide-react';
import RetryPanel from '../../components/ui/RetryPanel';
import { adminService } from '../../services/adminService';

type HealthStatus = 'ok' | 'fail' | 'pending';

interface HealthItem {
  key: string;
  label: string;
  status: HealthStatus;
  detail: string;
}

const OwnerHealth: React.FC = () => {
  const [items, setItems] = React.useState<HealthItem[]>([
    { key: 'users', label: 'Users API', status: 'pending', detail: 'Checking...' },
    { key: 'dashboard', label: 'Dashboard API', status: 'pending', detail: 'Checking...' },
    { key: 'activity', label: 'Activity API', status: 'pending', detail: 'Checking...' },
    { key: 'auth', label: 'Auth Session', status: 'pending', detail: 'Checking...' },
  ]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const runChecks = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const [users, dashboard, activity, status] = await Promise.allSettled([
      adminService.getUsers(),
      adminService.getStats(),
      adminService.getActivity(),
      adminService.getSystemStatus(),
    ]);

    const next: HealthItem[] = [
      {
        key: 'users',
        label: 'Users API',
        status: users.status === 'fulfilled' ? 'ok' : 'fail',
        detail: users.status === 'fulfilled' ? `Returned ${users.value.length} users` : 'Request failed',
      },
      {
        key: 'dashboard',
        label: 'Dashboard API',
        status: dashboard.status === 'fulfilled' ? 'ok' : 'fail',
        detail: dashboard.status === 'fulfilled' ? 'Metrics payload loaded' : 'Request failed',
      },
      {
        key: 'activity',
        label: 'Activity API',
        status: activity.status === 'fulfilled' ? 'ok' : 'fail',
        detail: activity.status === 'fulfilled' ? `Returned ${activity.value.length} records` : 'Request failed',
      },
      {
        key: 'auth',
        label: 'Auth Session',
        status: status.status === 'fulfilled' ? 'ok' : 'fail',
        detail:
          status.status === 'fulfilled'
            ? status.value?.message || 'Session valid'
            : 'Owner session missing/expired',
      },
    ];

    if (next.every((item) => item.status === 'fail')) {
      setError('All owner health checks failed. Login again and retry.');
    }

    setItems(next);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    runChecks();
  }, [runChecks]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Owner Health</h1>
          <p className="mt-1 text-sm text-white/50">Quick diagnostics for owner APIs and session validity.</p>
        </div>
        <button
          type="button"
          onClick={runChecks}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Checking...' : 'Run Check'}
        </button>
      </div>

      {error && <RetryPanel title="Owner Health Failed" message={error} onRetry={runChecks} isRetrying={loading} />}

      <div className="rounded-2xl border border-white/10 bg-card/50 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">System Health</p>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                {item.status === 'ok' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {item.status === 'fail' && <XCircle className="h-5 w-5 text-rose-400" />}
                {item.status === 'pending' && <Activity className="h-5 w-5 text-amber-300" />}
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-white/50">{item.detail}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  item.status === 'ok'
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : item.status === 'fail'
                      ? 'bg-rose-500/15 text-rose-200'
                      : 'bg-amber-500/15 text-amber-200'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-xs text-cyan-100">
        <p className="inline-flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Session-secured owner APIs are active.
        </p>
      </div>
    </div>
  );
};

export default OwnerHealth;
