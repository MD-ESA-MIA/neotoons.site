import React from 'react';
import { 
  ShieldAlert, 
  History, 
  MapPin, 
  Monitor, 
  LogOut, 
  Fingerprint, 
  Lock, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const loginHistory = [
  { id: '1', user: 'Alex Thompson', ip: '192.168.1.45', location: 'San Francisco, US', device: 'Chrome on macOS', time: 'Just now', status: 'success' },
  { id: '2', user: 'Sarah Jenkins', ip: '172.16.0.12', location: 'London, UK', device: 'Safari on iPhone', time: '45 mins ago', status: 'success' },
  { id: '3', user: 'Unknown', ip: '45.78.12.90', location: 'Moscow, RU', device: 'Firefox on Linux', time: '2 hours ago', status: 'failed' },
  { id: '4', user: 'Michael Chen', ip: '10.0.0.5', location: 'Tokyo, JP', device: 'Edge on Windows', time: '5 hours ago', status: 'success' },
];

const SecurityCenter: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Security Center</h1>
          <p className="text-white/40">Monitor platform security, track suspicious activity, and manage sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20 hover:bg-rose-500/20 transition-all">
            Force Global Logout
          </button>
          <button className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all">
            Security Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Sessions', value: '1,242', icon: Monitor, color: 'indigo' },
              { label: 'Failed Logins (24h)', value: '14', icon: AlertTriangle, color: 'rose' },
              { label: '2FA Adoption', value: '68%', icon: Fingerprint, color: 'emerald' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4">
                <div className={`w-10 h-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Login History */}
          <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Login History</h3>
              <button className="text-xs font-bold text-indigo-400 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-white/20 uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4">User / IP</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Device</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loginHistory.map((log) => (
                    <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-white">{log.user}</p>
                          <p className="text-[10px] text-white/40 font-mono">{log.ip}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-white/20" />
                          <span className="text-xs text-white/60">{log.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-3 h-3 text-white/20" />
                          <span className="text-xs text-white/60">{log.device}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-white/40">{log.time}</span>
                      </td>
                      <td className="px-6 py-4">
                        {log.status === 'success' ? (
                          <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="space-y-8">
          <div className="bg-[#0A0A0B] border border-white/5 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-white">Security Controls</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Auth', desc: 'Enforce 2FA for all admin accounts.', enabled: true },
                { label: 'IP Whitelisting', desc: 'Restrict owner access to specific IPs.', enabled: false },
                { label: 'Session Timeout', desc: 'Auto-logout after 30 mins of inactivity.', enabled: true },
                { label: 'Rate Limiting', desc: 'Prevent brute-force attacks on login.', enabled: true },
              ].map((control) => (
                <div key={control.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{control.label}</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">{control.desc}</p>
                  </div>
                  <button className={`w-10 h-5 rounded-full relative transition-all ${control.enabled ? 'bg-indigo-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${control.enabled ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold">Threat Detection</h3>
            </div>
            <p className="text-xs text-rose-500/60 leading-relaxed">
              Our AI-powered threat detection system has identified 3 suspicious login attempts in the last hour.
            </p>
            <button className="w-full py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all">
              Review Threats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;
