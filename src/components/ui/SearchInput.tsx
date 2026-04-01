import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg border border-border rounded-xl py-2 pl-10 pr-10 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/5 text-text-muted"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
