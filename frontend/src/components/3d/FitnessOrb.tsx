import { Zap } from 'lucide-react';
export function FitnessOrb() {
  return (
    <div className="fitness-orb" aria-hidden="true">
      {/* Shadow under the orb */}
      <div className="fitness-orb__shadow" />
      
      {/* Outer spinning rings */}
      <div className="fitness-orb__ring" />
      <div className="fitness-orb__ring fitness-orb__ring--2" />
      
      {/* Floating 3D Sphere */}
      <div className="fitness-orb__sphere">
        <Zap className="fitness-orb__icon" size={48} strokeWidth={2.5} />
      </div>
    </div>
  );
}
