import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { MODES } from '../constants';
import { AppMode } from '../types';
import { addItem } from '../store/slices/librarySlice';
import { aiRouterService } from '../services/aiRouterService';
import { getIcon } from '../components/Icons';
import { useConfig } from '../context/ConfigContext';
import { useFormPersistence } from '../hooks/useFormPersistence';
import { 
  Wand2, 
  Copy, 
  Download, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Save,
  ArrowLeft,
  Info,
  FileText,
  FileCode,
  Type,
  Play,
  Volume2,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Coins,
  Trash2,
  Mic2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModulePageProps {
  mode?: AppMode;
}

interface ToolTheme {
  banner: string;
  badge: string;
  chipActive: string;
  chipIdle: string;
  primaryButton: string;
  progress: string;
}

const WRITING_MODES = new Set<AppMode>([
  AppMode.STORY,
  AppMode.CHAPTER,
  AppMode.CONTINUATION,
  AppMode.EXPANDER,
  AppMode.SCRIPT_WRITER,
  AppMode.SHORTS_SCRIPT,
  AppMode.REWRITE,
  AppMode.EMAIL,
  AppMode.PRODUCT_DESC,
]);

const SOCIAL_MARKETING_MODES = new Set<AppMode>([
  AppMode.HOOKS,
  AppMode.SOCIAL,
  AppMode.HASHTAG,
  AppMode.CAPTION,
  AppMode.YT_TITLE,
  AppMode.VIDEO_IDEA,
  AppMode.AD_COPY,
]);

const VISUAL_MODES = new Set<AppMode>([
  AppMode.IMAGE,
  AppMode.COVER,
  AppMode.PROMPTS,
  AppMode.CHARACTER,
]);

const getToolTheme = (mode: AppMode, isDynamic: boolean): ToolTheme => {
  if (isDynamic) {
    return {
      banner: 'from-indigo-500/20 via-fuchsia-500/10 to-blue-500/20',
      badge: 'border-indigo-300/30 bg-indigo-500/10 text-indigo-100',
      chipActive: 'border-indigo-300/60 bg-indigo-500/20 text-indigo-100',
      chipIdle: 'border-white/10 bg-black/20 text-text-muted hover:border-white/25 hover:text-white',
      primaryButton: 'from-indigo-500 to-fuchsia-500 shadow-indigo-700/30',
      progress: 'bg-indigo-400',
    };
  }

  if (WRITING_MODES.has(mode)) {
    return {
      banner: 'from-cyan-500/20 via-sky-500/10 to-blue-600/20',
      badge: 'border-cyan-300/30 bg-cyan-500/10 text-cyan-100',
      chipActive: 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100',
      chipIdle: 'border-white/10 bg-black/20 text-text-muted hover:border-white/25 hover:text-white',
      primaryButton: 'from-cyan-500 to-sky-500 shadow-cyan-700/30',
      progress: 'bg-cyan-400',
    };
  }

  if (SOCIAL_MARKETING_MODES.has(mode)) {
    return {
      banner: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
      badge: 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100',
      chipActive: 'border-emerald-300/60 bg-emerald-500/20 text-emerald-100',
      chipIdle: 'border-white/10 bg-black/20 text-text-muted hover:border-white/25 hover:text-white',
      primaryButton: 'from-emerald-500 to-teal-500 shadow-emerald-700/30',
      progress: 'bg-emerald-400',
    };
  }

  if (VISUAL_MODES.has(mode)) {
    return {
      banner: 'from-rose-500/20 via-orange-500/10 to-amber-500/20',
      badge: 'border-rose-300/30 bg-rose-500/10 text-rose-100',
      chipActive: 'border-rose-300/60 bg-rose-500/20 text-rose-100',
      chipIdle: 'border-white/10 bg-black/20 text-text-muted hover:border-white/25 hover:text-white',
      primaryButton: 'from-rose-500 to-orange-500 shadow-rose-700/30',
      progress: 'bg-rose-400',
    };
  }

  return {
    banner: 'from-violet-500/20 via-purple-500/10 to-indigo-500/20',
    badge: 'border-violet-300/30 bg-violet-500/10 text-violet-100',
    chipActive: 'border-violet-300/60 bg-violet-500/20 text-violet-100',
    chipIdle: 'border-white/10 bg-black/20 text-text-muted hover:border-white/25 hover:text-white',
    primaryButton: 'from-violet-500 to-indigo-500 shadow-violet-700/30',
    progress: 'bg-violet-400',
  };
};

const ModulePage: React.FC<ModulePageProps> = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug, mode: urlMode } = useParams();
  const { user: currentUser, token } = useSelector((state: RootState) => state.auth);
  const { plugins } = useConfig();
  const dispatch = useDispatch();
  
  // Find dynamic tool if slug is present
  const dynamicTool = plugins.find(p => p.slug === slug);
  
  const activeMode = mode || (urlMode?.toUpperCase() as AppMode) || (dynamicTool ? AppMode.REWRITE : AppMode.STORY);
  const staticConfig = MODES.find(m => m.id === activeMode) || MODES[0];

  // Merge static config with dynamic tool data if available
  const config = dynamicTool ? {
    id: dynamicTool.slug,
    title: dynamicTool.name,
    description: dynamicTool.description,
    iconName: dynamicTool.icon || 'Zap',
    color: 'from-indigo-500 to-purple-600',
    placeholder: 'Enter your topic or content here...',
    buttonText: 'Generate Content',
    creditsCost: dynamicTool.credits_cost || 5,
    promptTemplate: dynamicTool.prompt_template,
    aiModel: dynamicTool.ai_model,
    maxTokens: dynamicTool.max_tokens
  } : {
    ...staticConfig,
    creditsCost: 5, // Default for static tools
    promptTemplate: '',
    aiModel: 'gemini-3-flash-preview',
    maxTokens: 4000
  };

  const [inputText, setInputText, clearInputText] = useFormPersistence<string>(
    `form_input_${config.id}_${currentUser?.id || 'anonymous'}`,
    location.state?.initialPrompt || location.state?.prefillPrompt || ''
  );
  const [output, setOutput] = useState('');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [isSmartMode, setIsSmartMode] = useState(true);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dynamic Form State
  const [formFields, setFormFields, clearFormFields] = useFormPersistence<Record<string, string>>(
    `form_fields_${config.id}_${currentUser?.id || 'anonymous'}`,
    {}
  );

  const handleClearForm = () => {
    clearInputText();
    clearFormFields();
    toast.success("Form cleared!");
  };

  // Options
  const [length, setLength] = useState('Medium');
  const [tone, setTone] = useState('Professional');
  const [style, setStyle] = useState('Engaging');
  const theme = getToolTheme(activeMode, Boolean(dynamicTool));

  const lengthOptions = ['Short', 'Medium', 'Long'];
  const toneOptions = ['Professional', 'Creative', 'Friendly', 'Witty', 'Persuasive'];
  const styleOptions = ['Engaging', 'Simplified', 'Detailed', 'Storytelling'];

  const outputRef = useRef<HTMLDivElement>(null);
  const canConvertToVoice =
    output &&
    [AppMode.SCRIPT_WRITER, AppMode.REWRITE, AppMode.SHORTS_SCRIPT].includes(activeMode);

  // Tool-specific field configurations
  const getFieldConfig = () => {
    if (dynamicTool) {
      // Extract variables from prompt template e.g. {topic}, {audience}
      const vars = dynamicTool.prompt_template.match(/\{([^}]+)\}/g);
      if (vars) {
        return vars.map(v => {
          const name = v.replace(/[{}]/g, '');
          return {
            id: name,
            label: name.charAt(0).toUpperCase() + name.slice(1),
            placeholder: `Enter ${name}...`,
            isTextArea: name.toLowerCase().includes('content') || name.toLowerCase().includes('detail')
          };
        });
      }
      return [{ id: 'input', label: 'Input', placeholder: 'Enter your prompt...', isTextArea: true }];
    }

    switch (activeMode) {
      case AppMode.EMAIL:
        return [
          { id: 'recipient', label: 'Recipient', placeholder: 'e.g. Hiring Manager, Client, Team' },
          { id: 'subject', label: 'Email Subject', placeholder: 'e.g. Application for Designer Role' },
          { id: 'purpose', label: 'Email Purpose', placeholder: 'e.g. Follow up, Introduction, Pitch' },
          { id: 'details', label: 'Message Details', placeholder: 'Key points to include...', isTextArea: true }
        ];
      case AppMode.AD_COPY:
        return [
          { id: 'product', label: 'Product/Service Name', placeholder: 'e.g. NeoToons AI' },
          { id: 'audience', label: 'Target Audience', placeholder: 'e.g. Content Creators, Small Business Owners' },
          { id: 'platform', label: 'Ad Platform', placeholder: 'e.g. Facebook, Google, Instagram' },
          { id: 'benefits', label: 'Key Benefits', placeholder: 'What makes it special?', isTextArea: true }
        ];
      case AppMode.COVER:
        return [
          { id: 'title', label: 'Book Title', placeholder: 'e.g. The Neon Chronicles' },
          { id: 'genre', label: 'Genre', placeholder: 'e.g. Cyberpunk, Fantasy, Romance' },
          { id: 'elements', label: 'Key Visual Elements', placeholder: 'e.g. A futuristic city, a glowing sword', isTextArea: true }
        ];
      case AppMode.PRODUCT_DESC:
        return [
          { id: 'productName', label: 'Product Name', placeholder: 'e.g. UltraLight Backpack' },
          { id: 'features', label: 'Key Features', placeholder: 'e.g. Waterproof, 10 pockets, ergonomic', isTextArea: true }
        ];
      case AppMode.STORY:
        return [
          { id: 'genre', label: 'Genre', placeholder: 'e.g. Sci-Fi, Mystery, Horror' },
          { id: 'setting', label: 'Setting', placeholder: 'e.g. A space station in 2077' },
          { id: 'characters', label: 'Main Characters', placeholder: 'e.g. A rogue AI and a detective' },
          { id: 'plot', label: 'Plot Idea', placeholder: 'What happens?', isTextArea: true }
        ];
      default:
        return null;
    }
  };

  const fieldConfig = getFieldConfig();
  const canGenerate = fieldConfig
    ? fieldConfig.some((field) => Boolean(formFields[field.id]?.trim()))
    : Boolean(inputText.trim());

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + Math.random() * 5 : prev));
      }, 400);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  useEffect(() => {
    if (location.state?.prefillPrompt) {
      setInputText(location.state.prefillPrompt);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleFieldChange = (id: string, value: string) => {
    setFormFields(prev => ({ ...prev, [id]: value }));
  };

  const saveItem = async (mode: AppMode, title: string, content: string) => {
    dispatch(addItem({
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || 'anonymous',
      title,
      content,
      type: mode,
      createdAt: new Date().toISOString()
    }));
  };

  useEffect(() => {
    const fetchActiveModels = async () => {
      try {
        const response = await fetch('/api/ai-models/active', {
          credentials: 'include'
        });
        if (response.ok) {
          const models = await response.json();
          setAvailableModels(models);
        }
      } catch (err) {
        console.error("Failed to fetch active AI models:", err);
      }
    };
    fetchActiveModels();
  }, []);

  const handleGenerate = async () => {
    if (currentUser && currentUser.credits < config.creditsCost) {
      toast.error(`Insufficient credits. This tool requires ${config.creditsCost} credits.`);
      return;
    }

    let finalPrompt = "";
    
    if (dynamicTool) {
      let template = dynamicTool.prompt_template;
      fieldConfig?.forEach(f => {
        template = template.replace(`{${f.id}}`, formFields[f.id] || '');
      });
      finalPrompt = template;
    } else if (fieldConfig) {
      const isMissingFields = fieldConfig.some(f => !formFields[f.id]?.trim());
      if (isMissingFields) {
        toast.error("Please fill in all required fields.");
        return;
      }
      finalPrompt = `
        Tool: ${config.title}
        ${fieldConfig.map(f => `${f.label}: ${formFields[f.id]}`).join('\n')}
        Options: Length: ${length}, Tone: ${tone}, Style: ${style}
      `;
    } else {
      if (!inputText.trim()) {
        toast.error("Please provide some input first.");
        return;
      }
      finalPrompt = `
        Tool: ${config.title}
        Input: ${inputText}
        Options: Length: ${length}, Tone: ${tone}, Style: ${style}
      `;
    }

    setIsLoading(true);
    setError(null);
    setIsSaved(false);
    setIsCopied(false);
    setOutput('');

    try {
      const result = await aiRouterService.generateContent(
        finalPrompt, 
        currentUser?.id || 'anonymous',
        {
          modelId: isSmartMode ? 'auto' : selectedModel,
          taskType: isSmartMode ? 'smart' : (config.id === 'coding' ? 'coding' : config.id === 'creative' ? 'creative' : 'fast'),
          toolSlug: config.id
        }
      );
      
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setOutput(result.text);
      
      // Deduct credits (Handled by aiRouterService now)
      // if (currentUser) {
      //   await userService.deductCredits(currentUser.id, config.creditsCost);
      // }

      toast.success("Content generated successfully!");
      
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message);
      toast.error("Generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    const title = inputText.slice(0, 40) + (inputText.length > 40 ? '...' : '');
    saveItem(activeMode, title, output);
    setIsSaved(true);
    toast.success("Saved to library!");
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePublish = async () => {
    const title = inputText.slice(0, 40) + (inputText.length > 40 ? '...' : '');
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content: output,
          mode: activeMode,
          visibility: 'public',
          isAIExpanded: true
        })
      });
      
      if (response.ok) {
        toast.success("Published to community!");
        navigate('/workspace/feed');
      } else {
        toast.error("Failed to publish");
      }
    } catch (err) {
      toast.error("An error occurred while publishing");
    }
  };

  const handleDownload = (format: 'txt' | 'pdf' | 'docx' | 'md') => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    const safeTitle = config.title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
    
    a.href = url;
    a.download = `neotoons_${safeTitle}_${date}_${time}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  };

  const handleConvertToVoice = () => {
    if (!output) {
      toast.error('Generate a script first.');
      return;
    }
    navigate('/workspace/voice-engine', {
      state: {
        prefillText: output,
        autoOptimize: true,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className={cn('relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br p-6 lg:p-7', theme.banner)}>
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-14 -bottom-14 h-40 w-40 rounded-full bg-black/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("w-14 h-14 rounded-2xl bg-linear-to-br flex items-center justify-center text-white shadow-xl shadow-accent/20", config.color)}>
            {getIcon(config.iconName, "w-7 h-7")}
          </div>
          <div>
            <p className={cn('mb-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest', theme.badge)}>
              {dynamicTool ? 'Custom Tool' : 'Core Tool'}
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              {config.title}
              <div className="group relative">
                <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-card border border-border rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  This tool uses advanced AI to generate high-quality {config.title.toLowerCase()} based on your specific requirements.
                </div>
              </div>
            </h1>
            <p className="text-sm text-text-muted">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleClearForm}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-all text-xs font-bold uppercase tracking-widest"
            title="Clear Form"
          >
            <Trash2 className="w-4 h-4" />
            Clear Form
          </button>
          <button 
            onClick={() => navigate('/workspace')}
            className="p-2.5 rounded-xl hover:bg-white/5 text-text-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent/20 to-transparent"></div>
        
        <div className="space-y-6">
          {fieldConfig ? (
            <div className="grid grid-cols-1 gap-6">
              {fieldConfig.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">{field.label}</label>
                  {field.isTextArea ? (
                    <textarea
                      value={formFields[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-32 bg-bg border border-border rounded-2xl p-4 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden resize-none custom-scrollbar"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formFields[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Your Creative Input</label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={config.placeholder}
                  className="w-full h-48 bg-bg border border-border rounded-2xl p-6 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden resize-none custom-scrollbar"
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border">
                  {inputText.length} characters
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">AI Model Selection</label>
            <div className="flex items-center gap-4 bg-bg border border-border rounded-xl p-2">
              <button
                onClick={() => setIsSmartMode(true)}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                  isSmartMode ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:text-white"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Smart Mode
              </button>
              <button
                onClick={() => setIsSmartMode(false)}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                  !isSmartMode ? "bg-card border border-border text-white" : "text-text-muted hover:text-white"
                )}
              >
                <Wand2 className="w-3.5 h-3.5" />
                Manual
              </button>
            </div>
          </div>

          {!isSmartMode && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Select Model</label>
              {availableModels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setSelectedModel(model.id)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs transition',
                        selectedModel === model.id ? theme.chipActive : theme.chipIdle
                      )}
                    >
                      {model.name} ({model.type.charAt(0).toUpperCase() + model.type.slice(1)})
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-muted">
                  No manual models available right now.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Length</p>
              <div className="flex flex-wrap gap-2">
                {lengthOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLength(option)}
                    className={cn('rounded-lg border px-3 py-1.5 text-xs transition', length === option ? theme.chipActive : theme.chipIdle)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Tone</p>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTone(option)}
                    className={cn('rounded-lg border px-3 py-1.5 text-xs transition', tone === option ? theme.chipActive : theme.chipIdle)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Style</p>
              <div className="flex flex-wrap gap-2">
                {styleOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStyle(option)}
                    className={cn('rounded-lg border px-3 py-1.5 text-xs transition', style === option ? theme.chipActive : theme.chipIdle)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Cost: {config.creditsCost} Credits</span>
              </div>
              {currentUser && (
                <div className="flex items-center gap-1.5 text-text-muted">
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-xs font-bold uppercase tracking-widest">Balance: {currentUser.credits}</span>
                </div>
              )}
            </div>
            {isSmartMode && (
              <div className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                Optimized for quality & cost
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !canGenerate}
            className={cn(
              'w-full py-4 rounded-2xl bg-linear-to-r text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed',
              theme.primaryButton,
              isLoading && "animate-pulse"
            )}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6" />
                {config.buttonText}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
              <span>AI is thinking...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-card border border-border rounded-full overflow-hidden">
              <motion.div 
                className={cn('h-full', theme.progress)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output Area */}
      <div ref={outputRef} className="space-y-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {output && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-6">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest ml-1">Generated Result</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleGenerate}
                  className="p-2.5 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all"
                  title="Regenerate"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    isSaved ? "text-emerald-400 bg-emerald-400/10" : "hover:bg-white/5 text-text-muted hover:text-white"
                  )}
                  title="Save to Library"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button 
                  onClick={handlePublish}
                  className="p-2.5 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all"
                  title="Publish to Feed"
                >
                  <Globe className="w-5 h-5" />
                </button>
                {canConvertToVoice && (
                  <button
                    onClick={handleConvertToVoice}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-cyan-400/10 text-cyan-200 hover:text-cyan-100 transition-all"
                    title="Convert to Voice"
                  >
                    <Mic2 className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Convert to Voice</span>
                  </button>
                )}
                <div className="h-6 w-px bg-border mx-1"></div>
                <div className="relative group">
                  <button className="p-2.5 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-32 bg-card border border-border rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50 overflow-hidden">
                    <button onClick={() => handleDownload('pdf')} className="w-full px-4 py-2 text-xs text-left hover:bg-white/5 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> PDF
                    </button>
                    <button onClick={() => handleDownload('docx')} className="w-full px-4 py-2 text-xs text-left hover:bg-white/5 flex items-center gap-2">
                      <FileCode className="w-3 h-3" /> DOCX
                    </button>
                    <button onClick={() => handleDownload('txt')} className="w-full px-4 py-2 text-xs text-left hover:bg-white/5 flex items-center gap-2">
                      <Type className="w-3 h-3" /> TXT
                    </button>
                    <button onClick={() => handleDownload('md')} className="w-full px-4 py-2 text-xs text-left hover:bg-white/5 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Markdown
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all",
                    isCopied ? "text-emerald-400 bg-emerald-400/10" : "hover:bg-white/5 text-text-muted hover:text-white"
                  )}
                  title="Copy to Clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Copied!</span>
                    </>
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-[#C4C4D4] leading-relaxed text-base">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Special Feature Placeholders */}
      {(activeMode === AppMode.IMAGE || activeMode === AppMode.AUDIOBOOK) && output && (
        <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-4">
            {activeMode === AppMode.IMAGE ? <ImageIcon className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-bold text-white">
            {activeMode === AppMode.IMAGE ? 'Image Generation Ready' : 'Audio Narration Ready'}
          </h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            {activeMode === AppMode.IMAGE 
              ? 'Your scene description has been processed. Click below to generate the visual asset.' 
              : 'Your script is ready for professional narration. Click play to preview the AI voice.'}
          </p>
          <button className="btn-primary py-3 px-8 flex items-center gap-2 mx-auto">
            {activeMode === AppMode.IMAGE ? <Sparkles className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {activeMode === AppMode.IMAGE ? 'Generate Image' : 'Start Narration'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ModulePage;
