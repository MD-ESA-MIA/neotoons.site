import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface RetryPanelProps {
  title?: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const RetryPanel: React.FC<RetryPanelProps> = ({
  title = 'Request Failed',
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-rose-500/20 p-1.5 text-rose-200">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-rose-100">{title}</p>
          <p className="mt-1 text-xs text-rose-200/90">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetryPanel;
