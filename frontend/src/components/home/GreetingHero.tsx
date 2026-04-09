import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/authStore';
import { AppAvatar } from '../ui/AppAvatar';
import { FitnessOrb } from '../3d/FitnessOrb';
import { MapPin } from 'lucide-react';

export function GreetingHero() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const firstName = user?.firstName ? user.firstName : 'Athlete';

  return (
    <section className="home-greeting">
      <div className="flex items-center justify-between">
        <div>
          <div className="home-greeting__meta">
            <MapPin size={14} className="text-brand" />
            <span>SDFitness Downtown</span>
          </div>
          <h1 className="home-greeting__name">Hi, {firstName}!</h1>
          <p className="home-greeting__sub">Ready to crush your goals?</p>
        </div>
        <div 
          onClick={() => navigate('/profile')} 
          className="cursor-pointer active:scale-95 transition-transform"
        >
          <AppAvatar 
            altText={user?.firstName || 'Athlete'} 
            size={56} 
            status="online"
          />
        </div>
      </div>

      <div className="home-3d-wrap">
        <FitnessOrb />
      </div>
    </section>
  );
}
