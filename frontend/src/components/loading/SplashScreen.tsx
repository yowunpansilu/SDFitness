import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 400);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash${exiting ? ' splash--exit' : ''}`} role="status" aria-label="Loading SDFitness">
      {/* Animated rings */}
      <div className="splash__logo-wrap">
        <span className="splash__ring splash__ring--1" aria-hidden="true" />
        <span className="splash__ring splash__ring--2" aria-hidden="true" />
        <span className="splash__ring splash__ring--3" aria-hidden="true" />

        {/* Logo */}
        <div className="splash__logo">
          <Zap size={40} strokeWidth={2.5} />
        </div>
      </div>

      {/* Wordmark */}
      <p className="splash__wordmark">SDFitness</p>
      <p className="splash__tagline">Crush your goals, every day.</p>

      {/* Dot loader */}
      <div className="splash__loader" aria-hidden="true">
        <span className="splash__dot" />
        <span className="splash__dot" />
        <span className="splash__dot" />
      </div>
    </div>
  );
}
