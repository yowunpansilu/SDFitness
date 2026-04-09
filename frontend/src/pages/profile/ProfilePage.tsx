import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Settings, Bell, Shield } from 'lucide-react';
import { useAuthStore } from '../../lib/stores/authStore';
import { useMemberStats } from '../../hooks/queries/useMemberQueries';
import { AppAvatar } from '../../components/ui/AppAvatar';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: stats, isLoading: isStatsLoading } = useMemberStats();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const workoutsCount = stats?.totalWorkouts || 0;
  const caloriesBurned = stats?.burnedCalories || 0;
  const badgesCount = 0; // TODO: Integrate with badges API when available

  return (
    <div className="pb-32 page-animate-in bg-base min-h-screen">
      <header className="px-6 py-4 pt-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ink hover:text-brand transition-colors p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-headline font-bold text-lg text-white">Profile</h2>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Profile Header Block */}
      <section className="profile-header flex flex-col items-center">
        <div className="profile-avatar-wrap mb-4">
          <AppAvatar 
            altText={user?.firstName || 'User'} 
            src={user?.avatar} 
            size={96} 
            status="online" 
          />
        </div>
        
        <h1 className="profile-name text-2xl font-bold text-white mb-1">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="profile-meta text-ink-muted text-sm mb-6">
          {user?.email} • Member since {new Date().getFullYear()}
        </p>
        
        <div className="profile-stats-row flex justify-around w-full max-w-md px-6 py-4 bg-surface/30 rounded-3xl border border-white/5 backdrop-blur-xl">
          <div className="profile-stat flex flex-col items-center">
            <span className="profile-stat__value text-xl font-bold text-white">
              {isStatsLoading ? '...' : workoutsCount}
            </span>
            <span className="profile-stat__label text-xs uppercase tracking-widest text-ink-muted mt-1">Workouts</span>
          </div>
          <div className="profile-stat flex flex-col items-center">
            <span className="profile-stat__value text-xl font-bold text-white">
              {isStatsLoading ? '...' : (caloriesBurned > 1000 ? (caloriesBurned / 1000).toFixed(1) + 'k' : caloriesBurned)}
            </span>
            <span className="profile-stat__label text-xs uppercase tracking-widest text-ink-muted mt-1">Calories</span>
          </div>
          <div className="profile-stat flex flex-col items-center">
            <span className="profile-stat__value text-xl font-bold text-white">
              {badgesCount}
            </span>
            <span className="profile-stat__label text-xs uppercase tracking-widest text-ink-muted mt-1">Badges</span>
          </div>
        </div>
      </section>

      {/* Settings Grid */}
      <section className="mt-8 px-6">
        <h3 className="section-title mb-4 opacity-50">Account Settings</h3>
        <div className="settings-group space-y-2">
          <div className="settings-row flex items-center justify-between p-4 bg-surface/20 rounded-2xl border border-white/5 hover:bg-surface/30 cursor-pointer transition-all">
            <div className="settings-row__left flex items-center gap-3">
              <div className="settings-row__icon w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><Settings size={18} /></div>
              <span className="settings-row__label font-medium text-white">Preferences</span>
            </div>
            <ChevronLeft size={16} className="text-ink-muted rotate-180" />
          </div>
          <div className="settings-row flex items-center justify-between p-4 bg-surface/20 rounded-2xl border border-white/5 hover:bg-surface/30 cursor-pointer transition-all">
            <div className="settings-row__left flex items-center gap-3">
              <div className="settings-row__icon w-10 h-10 rounded-xl bg-energy/10 text-energy flex items-center justify-center"><Bell size={18} /></div>
              <span className="settings-row__label font-medium text-white">Notifications</span>
            </div>
            <ChevronLeft size={16} className="text-ink-muted rotate-180" />
          </div>
          <div className="settings-row flex items-center justify-between p-4 bg-surface/20 rounded-2xl border border-white/5 hover:bg-surface/30 cursor-pointer transition-all">
            <div className="settings-row__left flex items-center gap-3">
              <div className="settings-row__icon w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Shield size={18} /></div>
              <span className="settings-row__label font-medium text-white">Privacy & Security</span>
            </div>
            <ChevronLeft size={16} className="text-ink-muted rotate-180" />
          </div>
        </div>

        <h3 className="section-title mb-4 mt-8 opacity-50 text-brand">Danger Zone</h3>
        <div className="settings-group">
          <button 
            onClick={handleLogout}
            className="settings-row flex items-center justify-between w-full p-4 bg-brand/5 rounded-2xl border border-brand/10 hover:bg-brand/10 cursor-pointer transition-all text-brand"
          >
            <div className="settings-row__left flex items-center gap-3">
              <div className="settings-row__icon w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><LogOut size={18} /></div>
              <span className="settings-row__label font-bold">Log Out</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
