import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, UtensilsCrossed, TrendingUp, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',     icon: Home,           path: '/home' },
  { id: 'workouts', label: 'Train',    icon: Dumbbell,       path: '/workouts' },
  { id: 'action',   label: 'Start',    icon: Zap,            path: null },        // center action btn
  { id: 'diet',     label: 'Diet',     icon: UtensilsCrossed,path: '/diet' },
  { id: 'progress', label: 'Progress', icon: TrendingUp,     path: '/progress' },
] as const;

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleNav = (path: string | null) => {
    if (path) navigate(path);
    else navigate('/workouts/start');
  };

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <ul className="bottom-nav__list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.path ? pathname.startsWith(item.path) : false;
          const isAction = item.id === 'action';

          return (
            <li key={item.id} className="bottom-nav__item">
              {isAction ? (
                /* Centre "Start Workout" floating action button */
                <div className="bottom-nav__action">
                  <button
                    type="button"
                    className="bottom-nav__action-btn"
                    onClick={() => handleNav(null)}
                    aria-label="Start Workout"
                  >
                    <Icon size={24} strokeWidth={2.5} />
                  </button>
                  <span className="bottom-nav__action-label">{item.label}</span>
                </div>
              ) : (
                <button
                  type="button"
                  className={`bottom-nav__btn${isActive ? ' bottom-nav__btn--active' : ''}`}
                  onClick={() => handleNav(item.path)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="bottom-nav__icon">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                  </span>
                  <span className="bottom-nav__label">{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
