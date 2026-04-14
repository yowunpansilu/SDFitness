import { useState } from 'react';
import { useWorkoutTemplates } from '../../hooks/queries/useWorkoutQueries';
import { WorkoutTrack } from '../../components/workouts/WorkoutTrack';
import { ActiveWorkout } from '../../components/workouts/ActiveWorkout';
import { Search, Filter, Loader2 } from 'lucide-react';
import type { WorkoutTemplate } from '../../hooks/queries/useWorkoutQueries';

export function WorkoutsPage() {
  const { data: templates, isLoading, error } = useWorkoutTemplates();
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <p className="text-red-400 mb-4">Error loading workouts. Please check your connection.</p>
        <button onClick={() => window.location.reload()} className="btn-brand">Retry</button>
      </div>
    );
  }

  const filteredTemplates = templates?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const recommended = filteredTemplates.slice(0, 3);
  const trending = filteredTemplates.slice(3);

  return (
    <div className="pb-32 page-animate-in">
      {/* Header Sticky Search */}
      <header className="px-6 py-4 sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="font-headline text-3xl font-bold text-white mb-4">Workouts</h1>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search programs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-faint border-0 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-ink-muted focus:ring-2 focus:ring-brand"
            />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-ink-medium text-white flex items-center justify-center shrink-0">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Main Tracks */}
      <div className="pt-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand" size={40} />
          </div>
        ) : (
          <>
            <WorkoutTrack 
              title="Recommended for You" 
              workouts={recommended.map(t => ({
                id: t._id,
                title: t.name,
                duration: t.duration,
                intensity: t.difficulty === 'advanced' ? 'High' : t.difficulty === 'intermediate' ? 'Medium' : 'Low',
                difficulty: t.difficulty === 'advanced' ? 3 : t.difficulty === 'intermediate' ? 2 : 1,
                type: t.category,
                image: t.image || 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=600&auto=format&fit=crop'
              }))} 
              isLoading={isLoading} 
              onWorkoutClick={(w) => {
                const template = templates?.find(t => t._id === w.id);
                if (template) setActiveWorkout(template);
              }}
            />
            <div className="h-8" />
            <WorkoutTrack 
              title="New & Trending" 
              workouts={trending.map(t => ({
                id: t._id,
                title: t.name,
                duration: t.duration,
                intensity: t.difficulty === 'advanced' ? 'High' : t.difficulty === 'intermediate' ? 'Medium' : 'Low',
                difficulty: t.difficulty === 'advanced' ? 3 : t.difficulty === 'intermediate' ? 2 : 1,
                type: t.category,
                image: t.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
              }))} 
              isLoading={isLoading} 
              onWorkoutClick={(w) => {
                const template = templates?.find(t => t._id === w.id);
                if (template) setActiveWorkout(template);
              }}
            />
          </>
        )}
        <div className="h-4" />
      </div>

      {activeWorkout && (
        <ActiveWorkout 
          workout={activeWorkout} 
          onClose={() => setActiveWorkout(null)} 
        />
      )}
    </div>
  );
}
