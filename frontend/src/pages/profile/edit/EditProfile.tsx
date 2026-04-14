import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, User as UserIcon, Settings, Target } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../lib/stores/authStore';

export function EditProfile() {
  const navigate = useNavigate();
  const { user, member } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'general' | 'goals'>('general');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/profile');
    }, 1000);
  };

  return (
    <div className="pb-32 page-animate-in bg-base min-h-screen">
      <header className="px-6 py-4 pt-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ink hover:text-brand transition-colors p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-headline font-bold text-lg text-white">Edit Profile</h2>
        <div className="w-10 flex justify-end">
          <button onClick={handleSave} className="text-brand font-bold uppercase text-xs tracking-widest flex items-center gap-1">
            <Save size={16} /> Ensure
          </button>
        </div>
      </header>

      <div className="px-6 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 border-b border-white/5 pb-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-surface/20 text-white border border-white/10' : 'text-ink-muted'}`}
            onClick={() => setActiveTab('general')}
          >
            <UserIcon size={16} /> Core Info
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'goals' ? 'bg-surface/20 text-white border border-white/10' : 'text-ink-muted'}`}
            onClick={() => setActiveTab('goals')}
          >
            <Target size={16} /> Fitness Goals
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover border-2 border-brand" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center cursor-pointer shadow-brand">
                    <Settings size={14} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">First Name</label>
                  <input type="text" defaultValue={user?.firstName} className="w-full h-12 bg-surface/20 border border-white/5 focus:border-brand focus:ring-1 focus:ring-brand rounded-2xl px-4 text-white font-medium outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Last Name</label>
                  <input type="text" defaultValue={user?.lastName} className="w-full h-12 bg-surface/20 border border-white/5 focus:border-brand focus:ring-1 focus:ring-brand rounded-2xl px-4 text-white font-medium outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Email</label>
                <input type="email" defaultValue={user?.email} disabled className="w-full h-12 bg-surface/10 border border-white/5 rounded-2xl px-4 text-ink-muted font-medium outline-none opacity-70 cursor-not-allowed" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Phone Number</label>
                <input type="tel" defaultValue={user?.phone} className="w-full h-12 bg-surface/20 border border-white/5 focus:border-brand focus:ring-1 focus:ring-brand rounded-2xl px-4 text-white font-medium outline-none transition-all" />
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Height (cm)</label>
                  <input type="number" defaultValue={member?.height?.value} className="w-full h-12 bg-surface/20 border border-white/5 focus:brand rounded-2xl px-4 text-white font-medium outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Weight (kg)</label>
                  <input type="number" defaultValue={member?.currentWeight?.value} className="w-full h-12 bg-surface/20 border border-white/5 focus:brand rounded-2xl px-4 text-white font-medium outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Activity Level</label>
                <select className="w-full h-12 bg-surface/20 border border-white/5 focus:border-brand rounded-2xl px-4 text-white font-medium outline-none transition-all appearance-none" defaultValue={member?.activityLevel || "moderate"}>
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Very Active (6-7 days/week)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Primary Goal</label>
                <div className="flex flex-wrap gap-2">
                  {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'].map(goal => (
                    <div key={goal} className="px-4 py-2 border border-white/10 rounded-full text-sm font-bold text-white bg-surface/10 hover:bg-brand hover:border-brand cursor-pointer transition-all active:scale-95">
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-14 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold shadow-brand transition-all active:scale-95 mt-8">
            {loading ? 'Saving...' : 'Save Profile Integrity'}
          </Button>
        </form>
      </div>
    </div>
  );
}
