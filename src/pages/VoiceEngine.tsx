import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AudioLines,
  Copy,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Mic2,
  Clock3,
  Type,
  Play,
  Download,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useVoiceEngine } from '../hooks/useAIGeneration';
import { AIRequest } from '../ai/prompts/systemPrompt';
import { useLocation } from 'react-router-dom';

type VoiceToneUI = 'normal' | 'energetic' | 'emotional' | 'motivational' | 'casual';
type VoiceStyleUI = 'default' | 'youtube' | 'story' | 'formal';
type VoiceGenderUI = 'male' | 'female';

interface VoiceEngineRouteState {
  prefillText?: string;
  autoOptimize?: boolean;
}

interface VoiceHistoryItem {
  id: string;
  createdAt: string;
  originalText: string;
  optimizedVoice: string;
  lang: string;
  gender?: VoiceGenderUI;
  style: VoiceStyleUI;
  speed: number;
}

interface VoiceAnalytics {
  totalGenerations: number;
  mostUsedLanguage: string;
  avgTextLength: number;
}

const TONE_OPTIONS: Array<{ label: string; value: VoiceToneUI }> = [
  { label: '🎭 Normal', value: 'normal' },
  { label: '🔥 Energetic', value: 'energetic' },
  { label: '😢 Emotional', value: 'emotional' },
  { label: '📢 Motivational', value: 'motivational' },
  { label: '😎 Casual', value: 'casual' },
];

const LENGTH_OPTIONS: Array<{ label: string; maxLength?: number }> = [
  { label: 'Auto', maxLength: undefined },
  { label: 'Short', maxLength: 280 },
  { label: 'Medium', maxLength: 700 },
  { label: 'Long', maxLength: 1400 },
];

const STYLE_OPTIONS: Array<{ label: string; value: VoiceStyleUI }> = [
  { label: 'Default', value: 'default' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Story', value: 'story' },
  { label: 'Formal', value: 'formal' },
];

const GENDER_OPTIONS: Array<{ label: string; value: VoiceGenderUI }> = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const VoiceEngine: React.FC = () => {
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState('');
  const lang = 'en';
  const [gender, setGender] = useState<VoiceGenderUI>('male');
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyleUI>('default');
  const [speed, setSpeed] = useState(1);
  const [selectedTone, setSelectedTone] = useState<VoiceToneUI>('normal');
  const [selectedLength, setSelectedLength] = useState<number | undefined>(undefined);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [pipelineRequested, setPipelineRequested] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<VoiceHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<VoiceAnalytics | null>(null);

  const { voiceText, loading, error, optimize } = useVoiceEngine();
  const hasAppliedRouteState = useRef(false);
  const lastSavedSignature = useRef('');

  const inputStats = useMemo(() => {
    const chars = inputText.length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    return { chars, words };
  }, [inputText]);

  const outputStats = useMemo(() => {
    const chars = voiceText?.length || 0;
    const words = voiceText?.trim() ? voiceText.trim().split(/\s+/).length : 0;
    return { chars, words };
  }, [voiceText]);

  const mapVoiceToneToRequestTone = (tone: VoiceToneUI): AIRequest['tone'] => {
    if (tone === 'emotional') return 'dramatic';
    if (tone === 'motivational') return 'inspirational';
    return 'casual';
  };

  const mapToneToContextHint = (tone: VoiceToneUI): string | undefined => {
    if (tone === 'energetic') return 'Delivery style: energetic, upbeat, punchy rhythm.';
    if (tone === 'emotional') return 'Delivery style: emotional, immersive, heartfelt pacing.';
    if (tone === 'motivational') return 'Delivery style: motivational, confident, uplifting cadence.';
    if (tone === 'casual') return 'Delivery style: casual, relaxed, conversational.';
    return undefined;
  };

  const runOptimize = useCallback(
    async (textOverride?: string) => {
      const sourceText = (textOverride ?? inputText).trim();
      if (!sourceText) {
        toast.error('Add text first so I can optimize it for voice.');
        return;
      }

      const hint = mapToneToContextHint(selectedTone);
      const mergedContext = [context.trim(), hint].filter(Boolean).join(' ').trim();

      await optimize({
        text: sourceText,
        tone: mapVoiceToneToRequestTone(selectedTone),
        context: mergedContext || undefined,
        maxLength: selectedLength,
      });
    },
    [context, inputText, optimize, selectedLength, selectedTone]
  );

  const handleOptimize = async () => {
    if (!inputText.trim()) {
      toast.error('Add text first so I can optimize it for voice.');
      return;
    }

    await runOptimize();
  };

  const handleCopy = async () => {
    if (!voiceText) return;
    try {
      await navigator.clipboard.writeText(voiceText);
      toast.success('Voice-ready script copied.');
    } catch (copyError) {
      toast.error('Copy failed. Please try again.');
    }
  };

  const fetchVoiceAudioBlob = useCallback(async (): Promise<Blob> => {
    if (!voiceText) {
      throw new Error('No optimized voice text found');
    }

    return fetchVoiceAudioBlobFor(voiceText, {
      lang,
      gender,
      style: voiceStyle,
      speed,
    });
  }, [gender, lang, speed, voiceStyle, voiceText]);

  const fetchVoiceAudioBlobFor = useCallback(
    async (
      text: string,
      params: { lang: string; gender: VoiceGenderUI; style: VoiceStyleUI; speed: number }
    ): Promise<Blob> => {
      const response = await fetch('/api/ai/voice-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          lang: params.lang,
          gender: params.gender,
          speed: params.speed,
          style: params.style,
          filename: `voice-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        let message = 'Audio generation failed';
        try {
          const err = await response.json();
          message = err.error || message;
        } catch (_error) {
          // Ignore parsing error for binary response
        }
        throw new Error(message);
      }

      return response.blob();
    },
    []
  );

  const loadVoiceAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/voice-analytics');
      if (!response.ok) {
        console.error('Failed to fetch voice analytics');
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('Invalid response format for voice analytics');
        return;
      }
      
      try {
        const result = await response.json();
        if (result.success && result.data) {
          setAnalytics(result.data as VoiceAnalytics);
        }
      } catch (jsonErr) {
        console.error('Failed to parse voice analytics response:', jsonErr);
      }
    } catch (analyticsError) {
      console.error('Failed to load voice analytics:', analyticsError);
    }
  }, []);

  const generateAudioPreview = useCallback(async () => {
    if (!voiceText) return;

    setIsGeneratingPreview(true);
    try {
      const blob = await fetchVoiceAudioBlob();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const nextUrl = URL.createObjectURL(blob);
      setAudioUrl(nextUrl);
      toast.success('Audio preview ready.');
    } catch (previewError: any) {
      toast.error(previewError.message || 'Failed to generate audio preview.');
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [audioUrl, fetchVoiceAudioBlob, voiceText]);

  const downloadAudioFile = useCallback(async () => {
    if (!voiceText) return;

    setIsDownloadingAudio(true);
    try {
      const blob = await fetchVoiceAudioBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `voice-audio-${stamp}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Audio file downloaded (.mp3).');
    } catch (downloadError: any) {
      toast.error(downloadError.message || 'Failed to download audio file.');
    } finally {
      setIsDownloadingAudio(false);
    }
  }, [fetchVoiceAudioBlob, voiceText]);

  const handlePipeline = async () => {
    if (!inputText.trim()) {
      toast.error('Add a script first.');
      return;
    }
    setPipelineRequested(true);
    await runOptimize();
  };

  useEffect(() => {
    if (!voiceText || !pipelineRequested) return;
    generateAudioPreview();
    downloadAudioFile();
    setPipelineRequested(false);
  }, [downloadAudioFile, generateAudioPreview, pipelineRequested, voiceText]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (hasAppliedRouteState.current) return;
    const state = (location.state as VoiceEngineRouteState | undefined) || undefined;
    if (!state?.prefillText) return;

    setInputText(state.prefillText);
    hasAppliedRouteState.current = true;

    if (state.autoOptimize) {
      setTimeout(() => {
        runOptimize(state.prefillText);
      }, 0);
    }
  }, [location.state, runOptimize]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/ai/voice-history?limit=25');
        if (!response.ok) {
          console.error('Failed to fetch voice history');
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          console.error('Invalid response format for voice history');
          return;
        }
        
        try {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setHistoryItems(result.data);
          }
        } catch (jsonErr) {
          console.error('Failed to parse voice history response:', jsonErr);
        }
      } catch (historyError) {
        console.error('Failed to load voice history:', historyError);
      }
    };

    loadHistory();
    loadVoiceAnalytics();
  }, [loadVoiceAnalytics]);

  useEffect(() => {
    if (!voiceText || !inputText.trim()) return;

    const signature = `${inputText}::${voiceText}`;
    if (lastSavedSignature.current === signature || isSavingHistory) return;

    lastSavedSignature.current = signature;
    setIsSavingHistory(true);

    fetch('/api/ai/voice-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalText: inputText,
        optimizedVoice: voiceText,
        lang,
        gender,
        style: voiceStyle,
        speed,
      }),
    })
      .then(async (response) => {
        let result;
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType?.includes('application/json')) {
            console.error('Invalid response format for voice history save');
            return;
          }
          result = await response.json();
        } catch (jsonErr) {
          console.error('Failed to parse voice history response:', jsonErr);
          return;
        }
        
        if (response.ok && result.success && result.data) {
          setHistoryItems((prev) => [result.data, ...prev.filter((item) => item.id !== result.data.id)].slice(0, 25));
          loadVoiceAnalytics();
        }
      })
      .catch((historyError) => {
        console.error('Voice history save failed:', historyError);
      })
      .finally(() => setIsSavingHistory(false));
  }, [
    context,
    gender,
    inputText,
    isSavingHistory,
    lang,
    loadVoiceAnalytics,
    speed,
    voiceStyle,
    voiceText,
  ]);

  const copyShareLink = async (item: VoiceHistoryItem) => {
    const shareUrl = `${window.location.origin}/voice/${item.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied.');
    } catch (_error) {
      toast.error('Failed to copy share link.');
    }
  };

  const handleReplayFromHistory = useCallback(
    async (item: VoiceHistoryItem) => {
      setIsGeneratingPreview(true);
      try {
        const blob = await fetchVoiceAudioBlobFor(item.optimizedVoice, {
          lang: item.lang,
          gender: item.gender || 'female',
          style: item.style,
          speed: item.speed,
        });
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const nextUrl = URL.createObjectURL(blob);
        setAudioUrl(nextUrl);
        toast.success('History audio ready.');
      } catch (historyPreviewError: any) {
        toast.error(historyPreviewError.message || 'Failed to replay history audio.');
      } finally {
        setIsGeneratingPreview(false);
      }
    },
    [audioUrl, fetchVoiceAudioBlobFor]
  );

  const handleDownloadFromHistory = useCallback(
    async (item: VoiceHistoryItem) => {
      setIsDownloadingAudio(true);
      try {
        const blob = await fetchVoiceAudioBlobFor(item.optimizedVoice, {
          lang: item.lang,
          gender: item.gender || 'female',
          style: item.style,
          speed: item.speed,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voice-${Date.now()}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (historyDownloadError: any) {
        toast.error(historyDownloadError.message || 'Failed to download history audio.');
      } finally {
        setIsDownloadingAudio(false);
      }
    },
    [fetchVoiceAudioBlobFor]
  );

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-cyan-500/20 via-sky-600/10 to-indigo-600/20 p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-100">
              <AudioLines className="h-3.5 w-3.5" />
              Neotoons Voice Engine
            </p>
            <h1 className="text-2xl font-bold text-white md:text-4xl">Text to Voice-Ready Script, Instantly</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200 md:text-base">
              Paste any raw text and get a cleaner, natural, speech-friendly version tuned for free TTS tools.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-200">
            <p className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Natural pacing
            </p>
            <p className="mt-1 flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-cyan-300" />
              Tone-aware delivery
            </p>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">Total Generations</p>
          <p className="mt-1 text-lg font-semibold text-white">{analytics?.totalGenerations ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">Top Language</p>
          <p className="mt-1 text-lg font-semibold text-white">{analytics?.mostUsedLanguage ?? 'n/a'}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">Avg Text Length</p>
          <p className="mt-1 text-lg font-semibold text-white">{analytics?.avgTextLength ?? 0} chars</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/10 bg-card/80 p-5 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Input Text</h2>
            <p className="text-xs text-text-muted">
              {inputStats.words} words • {inputStats.chars} chars
            </p>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your script, story, or paragraph here..."
            className="h-56 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white placeholder:text-text-muted focus:border-cyan-300/40 focus:outline-none"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Tone</p>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((toneOption) => (
                  <button
                    key={toneOption.value}
                    type="button"
                    onClick={() => setSelectedTone(toneOption.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      selectedTone === toneOption.value
                        ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100'
                        : 'border-white/10 bg-black/20 text-text-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {toneOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Length</p>
              <div className="flex flex-wrap gap-2">
                {LENGTH_OPTIONS.map((lengthOption) => {
                  const isSelected = selectedLength === lengthOption.maxLength;
                  return (
                    <button
                      key={lengthOption.label}
                      type="button"
                      onClick={() => setSelectedLength(lengthOption.maxLength)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                        isSelected
                          ? 'border-sky-300/60 bg-sky-500/20 text-sky-100'
                          : 'border-white/10 bg-black/20 text-text-muted hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {lengthOption.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Language</p>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white">
                English
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Voice Style</p>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((styleOption) => (
                  <button
                    key={styleOption.value}
                    type="button"
                    onClick={() => setVoiceStyle(styleOption.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      voiceStyle === styleOption.value
                        ? 'border-indigo-300/60 bg-indigo-500/20 text-indigo-100'
                        : 'border-white/10 bg-black/20 text-text-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {styleOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Voice Gender</p>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((genderOption) => (
                  <button
                    key={genderOption.value}
                    type="button"
                    onClick={() => setGender(genderOption.value)}
                    className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                      gender === genderOption.value
                        ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-100'
                        : 'border-white/10 bg-black/20 text-text-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {genderOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-text-muted">
                <span>Speed Control</span>
                <span>{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Optional Context</p>
            <input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., for YouTube narration, warm and trustworthy"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:border-cyan-300/40 focus:outline-none"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleOptimize}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-700/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Wand2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Optimizing...' : 'Optimize Voice Script'}
            </button>

            <button
              type="button"
              disabled={loading || !inputText.trim()}
              onClick={handlePipeline}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AudioLines className="h-4 w-4" />
              Script → Voice → Audio → Download
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-200">
              <p className="inline-flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {(loading || isGeneratingPreview || isDownloadingAudio) && (
            <p className="mt-3 text-xs text-cyan-200">
              {loading
                ? 'Optimizing script...'
                : isGeneratingPreview
                  ? 'Generating audio...'
                  : 'Preparing download...'}
            </p>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-card/80 p-5 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Voice-Ready Output</h2>
            <p className="text-xs text-text-muted">
              {outputStats.words} words • {outputStats.chars} chars
            </p>
          </div>

          <div className="relative min-h-56 rounded-xl border border-white/10 bg-black/20 p-4">
            {voiceText ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-100">{voiceText}</pre>
            ) : (
              <div className="flex h-full min-h-48 items-center justify-center text-sm text-text-muted">
                Your optimized script will appear here.
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!voiceText}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              Copy Script
            </button>

            <button
              type="button"
              onClick={generateAudioPreview}
              disabled={!voiceText || isGeneratingPreview}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {isGeneratingPreview ? 'Preparing Preview...' : 'Audio Preview'}
            </button>

            <button
              type="button"
              onClick={downloadAudioFile}
              disabled={!voiceText || isDownloadingAudio}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isDownloadingAudio ? 'Rendering Audio...' : 'Download Audio'}
            </button>

            {voiceText && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Ready for TTS
              </span>
            )}

            {isSavingHistory && (
              <span className="text-xs text-cyan-200">Saving to history...</span>
            )}
          </div>

          {audioUrl && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <audio controls src={audioUrl} className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-wide text-text-muted">Speech Flow</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-200">
                <Clock3 className="h-4 w-4 text-cyan-300" />
                Natural pauses
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-wide text-text-muted">Clarity</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-200">
                <Type className="h-4 w-4 text-sky-300" />
                Cleaner phrasing
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-wide text-text-muted">Energy</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-200">
                <Sparkles className="h-4 w-4 text-indigo-300" />
                Tone aware
              </p>
            </div>
          </div>

          {historyItems.length > 0 && (
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Recent Audio History</p>
              <div className="space-y-2">
                {historyItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="line-clamp-2 text-xs text-slate-200">{item.originalText}</p>
                    <p className="mt-1 text-[11px] text-text-muted">
                      {new Date(item.createdAt).toLocaleString()} • {item.lang} • {item.gender || 'female'} • {item.style} • {item.speed.toFixed(1)}x
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleReplayFromHistory(item)}
                        className="rounded-md border border-white/15 px-2 py-1 text-xs text-white hover:bg-white/10"
                      >
                        Replay
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadFromHistory(item)}
                        className="rounded-md border border-white/15 px-2 py-1 text-xs text-white hover:bg-white/10"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => copyShareLink(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-white hover:bg-white/10"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default VoiceEngine;
