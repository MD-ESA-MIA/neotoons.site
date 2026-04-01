import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Copy, Globe2, Languages, Type, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface VoiceAnalyticsResponse {
  totalGenerations: number;
  mostUsedLanguage: string;
  avgTextLength: number;
  languageCounts: Record<string, number>;
  styleCounts: Record<string, number>;
}

interface VoiceHistoryItem {
  id: string;
  createdAt: string;
  originalText: string;
  optimizedVoice: string;
  lang: string;
  style: 'default' | 'youtube' | 'story' | 'formal';
  speed: number;
}

const VoiceAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<VoiceAnalyticsResponse | null>(null);
  const [history, setHistory] = useState<VoiceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          fetch('/api/ai/voice-analytics'),
          fetch('/api/ai/voice-history?limit=30'),
        ]);

        const analyticsJson = await analyticsRes.json();
        const historyJson = await historyRes.json();

        if (analyticsRes.ok && analyticsJson.success) {
          setAnalytics(analyticsJson.data);
        }

        if (historyRes.ok && historyJson.success) {
          setHistory(historyJson.data || []);
        }
      } catch (error) {
        console.error('Failed to load voice analytics:', error);
        toast.error('Failed to load voice analytics data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const languageChartData = useMemo(() => {
    if (!analytics) return [];
    return Object.entries(analytics.languageCounts)
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count);
  }, [analytics]);

  const styleChartData = useMemo(() => {
    if (!analytics) return [];
    return Object.entries(analytics.styleCounts)
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => b.count - a.count);
  }, [analytics]);

  const topStyle = useMemo(() => {
    if (!analytics) return 'n/a';
    return (
      Object.entries(analytics.styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'n/a'
    );
  }, [analytics]);

  const copyShareLink = async (id: string) => {
    const shareUrl = `${window.location.origin}/voice/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied.');
    } catch (_error) {
      toast.error('Failed to copy share link.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Voice Engine Analytics</h1>
        <p className="text-text-muted mt-1">
          Central dashboard for generation volume, language usage, style usage, and share-ready history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Generations',
            value: analytics?.totalGenerations ?? 0,
            icon: BarChart3,
            tint: 'text-cyan-300',
            bg: 'bg-cyan-500/10',
          },
          {
            label: 'Most Used Language',
            value: analytics?.mostUsedLanguage ?? 'n/a',
            icon: Languages,
            tint: 'text-indigo-300',
            bg: 'bg-indigo-500/10',
          },
          {
            label: 'Avg Text Length',
            value: `${analytics?.avgTextLength ?? 0} chars`,
            icon: Type,
            tint: 'text-emerald-300',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Top Voice Style',
            value: topStyle,
            icon: Zap,
            tint: 'text-amber-300',
            bg: 'bg-amber-500/10',
          },
        ].map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2 ${metric.bg}`}>
                <metric.icon className={`w-5 h-5 ${metric.tint}`} />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">Metric</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-text-muted uppercase tracking-wide">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 h-[320px]">
          <p className="text-sm font-semibold text-white mb-4">Language Distribution</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={languageChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
              <XAxis dataKey="lang" tick={{ fill: '#b7b7c5', fontSize: 12 }} />
              <YAxis tick={{ fill: '#b7b7c5', fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 h-[320px]">
          <p className="text-sm font-semibold text-white mb-4">Voice Style Distribution</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={styleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
              <XAxis dataKey="style" tick={{ fill: '#b7b7c5', fontSize: 12 }} />
              <YAxis tick={{ fill: '#b7b7c5', fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Recent Voice History</p>
          <span className="text-xs text-text-muted">{history.length} items</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-sm text-text-muted">Loading analytics...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-sm text-text-muted">No voice history available yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((item) => (
              <div key={item.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white line-clamp-2">{item.originalText}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(item.createdAt).toLocaleString()} • {item.lang} • {item.style} • {item.speed.toFixed(1)}x
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/voice/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => copyShareLink(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAnalytics;
