import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Download, Play } from 'lucide-react';

interface VoiceHistoryItem {
  id: string;
  createdAt: string;
  originalText: string;
  optimizedVoice: string;
  lang: string;
  style: 'default' | 'youtube' | 'story' | 'formal';
  speed: number;
}

const VoiceShare: React.FC = () => {
  const { id } = useParams();
  const [item, setItem] = useState<VoiceHistoryItem | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;
      setLoadingItem(true);
      setError(null);
      try {
        const response = await fetch(`/api/ai/voice-history/${id}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Share item not found');
        }
        setItem(result.data);
      } catch (loadError: any) {
        setError(loadError.message || 'Failed to load shared voice item');
      } finally {
        setLoadingItem(false);
      }
    };

    loadItem();
  }, [id]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const generateAudio = async () => {
    if (!item) return;
    setLoadingAudio(true);
    try {
      const response = await fetch('/api/ai/voice-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: item.optimizedVoice,
          lang: item.lang,
          style: item.style,
          speed: item.speed,
          filename: `voice-${item.id}`,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to render shared audio');
      }

      const blob = await response.blob();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(URL.createObjectURL(blob));
    } catch (audioError: any) {
      setError(audioError.message || 'Failed to generate shared audio');
    } finally {
      setLoadingAudio(false);
    }
  };

  const downloadAudio = async () => {
    if (!item) return;
    try {
      const response = await fetch('/api/ai/voice-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: item.optimizedVoice,
          lang: item.lang,
          style: item.style,
          speed: item.speed,
          filename: `voice-${item.id}`,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to download shared audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-${item.id}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (downloadError: any) {
      setError(downloadError.message || 'Failed to download shared audio');
    }
  };

  if (loadingItem) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted">
        Loading shared voice...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-rose-300/20 bg-rose-500/10 p-6 text-rose-200">
          <p className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5" />
            {error || 'Shared voice item not found'}
          </p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-white underline">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
          <p className="text-xs uppercase tracking-widest text-text-muted">Shared Voice</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Voice Sample #{item.id}</h1>
          <p className="mt-2 text-sm text-text-muted">
            {new Date(item.createdAt).toLocaleString()} • {item.lang} • {item.style} • {item.speed.toFixed(1)}x
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
          <p className="text-xs uppercase tracking-widest text-text-muted">Optimized Script</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-100 leading-7">{item.optimizedVoice}</pre>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateAudio}
              disabled={loadingAudio}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {loadingAudio ? 'Generating...' : 'Play Audio'}
            </button>
            <button
              type="button"
              onClick={downloadAudio}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Download MP3
            </button>
          </div>

          {audioUrl && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <audio controls src={audioUrl} className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-rose-300">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceShare;
