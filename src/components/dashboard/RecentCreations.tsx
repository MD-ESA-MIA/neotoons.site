import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import LibCard from '../ui/LibCard';
import EmptyState from '../ui/EmptyState';
import { BookOpen, ArrowRight } from 'lucide-react';

const RecentCreations: React.FC = () => {
  const { library, deleteItem } = useLibrary();
  const navigate = useNavigate();
  const recentItems = library.slice(0, 4);

  if (library.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8">
        <EmptyState 
          icon={BookOpen}
          title="No creations yet"
          description="Start your creative journey by generating your first story or viral hook."
          action={{
            label: "Create Something",
            onClick: () => navigate('/workspace/story')
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">Recent Creations</h3>
        <Link to="/workspace/library" className="text-sm font-bold text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentItems.map((item) => (
          <LibCard 
            key={item.id} 
            item={item} 
            onDelete={deleteItem}
            onClick={(it) => navigate('/workspace/library', { state: { selectedId: it.id } })}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentCreations;
