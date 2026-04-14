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

  const [activeTab, setActiveTab] = useState<'workouts' | 'classes'>('workouts');

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
        <div className="flex bg-surface/20 p-1 rounded-2xl mb-4 mt-2">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'workouts' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted hover:text-white'}`}
            onClick={() => setActiveTab('workouts')}
          >
            Programs
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'classes' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted hover:text-white'}`}
            onClick={() => setActiveTab('classes')}
          >
            Classes
          </button>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'workouts' ? "Search programs..." : "Search classes..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/20 border-0 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-ink-muted focus:ring-1 focus:ring-brand outline-none transition-all"
            />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-surface/20 text-white flex items-center justify-center shrink-0">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-2">
        {activeTab === 'workouts' ? (
          isLoading ? (
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
          )
        ) : (
          <div className="px-6 space-y-4 pt-4">
            {/* Mocked Classes View */}
            {[
              { id: 1, name: 'HIIT Burnout', trainer: 'Marcus', time: '18:00', duration: '45m', spots: 3, price: '$15' },
              { id: 2, name: 'Yoga Flow', trainer: 'Sarah', time: '19:00', duration: '60m', spots: 12, price: 'Free' },
              { id: 3, name: 'Strength Foundations', trainer: 'David', time: '20:30', duration: '60m', spots: 0, price: '$20' }
            ].map(cls => (
              <div key={cls.id} className="card p-4 flex items-center justify-between bg-surface/20 border-white/5">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{cls.name}</h3>
                  <p className="text-ink-muted text-sm mb-2">{cls.time} • {cls.duration} • Coach {cls.trainer}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${cls.spots > 0 ? 'bg-brand/10 text-brand' : 'bg-surface/30 text-ink-muted'}`}>
                    {cls.spots > 0 ? `${cls.spots} spots left` : 'Fully Booked'}
                  </span>
                </div>
                <button className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${cls.spots > 0 ? 'bg-white text-ink-strong hover:bg-ink-faint shadow-md active:scale-95' : 'bg-surface/30 text-ink-muted'}`} disabled={cls.spots === 0}>
                  {cls.price === 'Free' ? 'Join' : `Pay ${cls.price}`}
                </button>
              </div>
            ))}
          </div>
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
