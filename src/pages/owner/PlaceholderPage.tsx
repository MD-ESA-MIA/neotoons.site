import React from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
      <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-indigo-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white capitalize">{pageName}</h1>
        <p className="text-white/40 max-w-md">
          This section is currently under development as part of the enterprise-grade architecture. 
          Check back soon for full {pageName} functionality.
        </p>
      </div>
      <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/5">
        Go Back
      </button>
    </div>
  );
};

export default PlaceholderPage;
