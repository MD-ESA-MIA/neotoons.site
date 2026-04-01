import { useState, useCallback } from 'react';
import { AIRequest } from '../ai/prompts/systemPrompt';

interface GenerationMetadata {
  requestId: string;
  intent: string;
  platform: string;
  tone: string;
  complexity: 'low' | 'medium' | 'high';
  provider: string;
  generationTime: number;
}

interface UseAIGenerationResult {
  content: string | null;
  loading: boolean;
  error: string | null;
  metadata: GenerationMetadata | null;
  generate: (request: AIRequest) => Promise<void>;
  reset: () => void;
  isRetrying: boolean;
}

/**
 * React hook for AI content generation
 * Handles loading, error states, and request caching
 */
export function useAIGeneration(): UseAIGenerationResult {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const generate = useCallback(async (request: AIRequest) => {
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorMessage = 'Generation failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          }
        } catch (jsonErr) {
          console.error('Failed to parse error response:', jsonErr);
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        result = await response.json();
      } catch (jsonErr) {
        throw new Error('Failed to parse response: ' + (jsonErr as any).message);
      }

      if (result.success) {
        setContent(result.data.content);
        setMetadata({
          requestId: result.metadata.requestId,
          intent: result.metadata.intent,
          platform: result.metadata.platform,
          tone: result.metadata.tone,
          complexity: result.metadata.complexity,
          provider: result.metadata.provider,
          generationTime: result.metadata.generationTime,
        });
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('AI Generation Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent(null);
    setError(null);
    setMetadata(null);
    setIsRetrying(false);
  }, []);

  return {
    content,
    loading,
    error,
    metadata,
    generate,
    reset,
    isRetrying,
  };
}

/**
 * Hook for batch generation of multiple content pieces
 */
interface UseBatchAIGenerationResult {
  results: Array<{ content: string; provider: string; generationTime: number }>;
  loading: boolean;
  error: string | null;
  successCount: number;
  failureCount: number;
  generateBatch: (requests: AIRequest[]) => Promise<void>;
  reset: () => void;
}

export function useBatchAIGeneration(): UseBatchAIGenerationResult {
  const [results, setResults] = useState<
    Array<{ content: string; provider: string; generationTime: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);

  const generateBatch = useCallback(async (requests: AIRequest[]) => {
    if (requests.length === 0) {
      setError('No requests provided');
      return;
    }

    if (requests.length > 10) {
      setError('Maximum 10 requests allowed per batch');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/ai/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        let errorMessage = 'Batch generation failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          }
        } catch (jsonErr) {
          console.error('Failed to parse error response:', jsonErr);
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        result = await response.json();
      } catch (jsonErr) {
        throw new Error('Failed to parse response: ' + (jsonErr as any).message);
      }

      if (result.success || result.results.length > 0) {
        setResults(result.results);
        setSuccessCount(result.summary.successful);
        setFailureCount(result.summary.failed);

        if (result.errors.length > 0) {
          console.warn('Some batch requests failed:', result.errors);
        }
      } else {
        throw new Error(result.error || 'Batch generation failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('Batch Generation Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setSuccessCount(0);
    setFailureCount(0);
  }, []);

  return {
    results,
    loading,
    error,
    successCount,
    failureCount,
    generateBatch,
    reset,
  };
}

/**
 * Hook for AI service health monitoring
 */
interface ProviderHealth {
  [key: string]: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}

interface UseAIHealthResult {
  health: ProviderHealth | null;
  status: 'all-healthy' | 'degraded' | 'unavailable' | 'checking';
  loading: boolean;
  checkHealth: () => Promise<void>;
}

export function useAIHealth(): UseAIHealthResult {
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [status, setStatus] = useState<'all-healthy' | 'degraded' | 'unavailable' | 'checking'>(
    'checking'
  );
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setStatus('checking');

    try {
      const response = await fetch('/api/ai/health');
      
      if (!response.ok) {
        setStatus('unavailable');
        return;
      }

      let result;
      try {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          setStatus('unavailable');
          return;
        }
        result = await response.json();
      } catch (jsonErr) {
        console.error('Failed to parse health response:', jsonErr);
        setStatus('unavailable');
        return;
      }

      if (result.success) {
        setHealth(result.health.providers);
        setStatus(result.status);
      } else {
        setStatus('unavailable');
      }
    } catch (error) {
      console.error('Failed to check AI health:', error);
      setStatus('unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-check on mount
  import.meta.hot?.on('vite:beforeFullReload', () => {
    checkHealth();
  });

  return {
    health,
    status,
    loading,
    checkHealth,
  };
}

interface UseVoiceEngineResult {
  voiceText: string | null;
  loading: boolean;
  error: string | null;
  optimize: (input: {
    text: string;
    tone?: AIRequest['tone'];
    context?: string;
    maxLength?: number;
  }) => Promise<void>;
  reset: () => void;
}

export function useVoiceEngine(): UseVoiceEngineResult {
  const [voiceText, setVoiceText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(
    async (input: {
      text: string;
      tone?: AIRequest['tone'];
      context?: string;
      maxLength?: number;
    }) => {
      setLoading(true);
      setError(null);
      setVoiceText(null);

      try {
        const response = await fetch('/api/ai/voice-optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Voice optimization failed');
        }

        setVoiceText(result.data.voiceText);
      } catch (err: any) {
        const errorMessage = err.message || 'Unknown error occurred';
        setError(errorMessage);
        console.error('Voice Engine Error:', errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setVoiceText(null);
    setError(null);
  }, []);

  return {
    voiceText,
    loading,
    error,
    optimize,
    reset,
  };
}
