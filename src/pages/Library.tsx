import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { LibraryItem, AppMode } from '../types';
import LibCard from '../components/ui/LibCard';
import SearchInput from '../components/ui/SearchInput';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { deleteItem } from '../store/slices/librarySlice';
import { Library as LibraryIcon, Filter, Trash2, Download, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const Library: React.FC = () => {
  const { items: library } = useSelector((state: RootState) => state.library || { items: [] });
  const dispatch = useDispatch();
  const location = useLocation();
  
  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteItem(id));
      toast.success("Item removed from library");
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<AppMode | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (location.state?.selectedId) {
      const item = library.find(i => i.id === location.state.selectedId);
      if (item) setSelectedItem(item);
    }
  }, [location.state, library]);

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMode === 'all' || item.type === filterMode;
    return matchesSearch && matchesFilter;
  });

  const handleCopy = async () => {
    if (selectedItem) {
      await navigator.clipboard.writeText(selectedItem.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (selectedItem) {
      const blob = new Blob([selectedItem.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
      const safeTitle = selectedItem.title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
      
      a.href = url;
      a.download = `neotoons_${safeTitle}_${date}_${time}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Search your library..." 
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as AppMode | 'all')}
            className="p-2 rounded-xl bg-white/5 border border-border text-text-muted hover:text-text-primary focus:outline-none focus:border-accent/50 text-xs font-bold uppercase tracking-widest"
          >
            <option value="all">All Types</option>
            {Object.values(AppMode).map(mode => (
              <option key={mode} value={mode}>{mode.replace('_', ' ')}</option>
            ))}
          </select>
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
            {filteredLibrary.length} Items
          </div>
        </div>
      </div>

      {filteredLibrary.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLibrary.map((item) => (
            <LibCard 
              key={item.id} 
              item={item} 
              onDelete={deleteItem}
              onClick={setSelectedItem}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12">
          <EmptyState 
            icon={LibraryIcon}
            title={searchQuery ? "No results found" : "Your library is empty"}
            description={searchQuery ? "Try adjusting your search terms." : "Generated content will appear here once you save it."}
          />
        </div>
      )}

      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-1 rounded">
                  {selectedItem.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-text-muted">
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isCopied ? "text-emerald-400 bg-emerald-400/10" : "hover:bg-white/5 text-text-muted hover:text-text-primary"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Copied!</span>
                    </>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    handleDeleteItem(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Library;
