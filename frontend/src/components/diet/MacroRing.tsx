interface MacroRingProps {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}

export function MacroRing({ label, value, total, colorClass }: MacroRingProps) {
  const percentage = Math.min(100, Math.max(0, (value / total) * 100));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="macro-ring">
      <svg className="macro-ring__svg" viewBox="0 0 80 80">
        <circle 
          className="macro-ring__bg" 
          cx="40" cy="40" r={radius} 
          strokeWidth="6" 
          fill="none" 
        />
        <circle 
          className={`macro-ring__progress ${colorClass}`} 
          cx="40" cy="40" r={radius} 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round"
          style={{ 
            strokeDasharray: circumference, 
            strokeDashoffset 
          }} 
        />
      </svg>
      <div className="macro-ring__content">
        <span className="macro-ring__value">{value}</span>
        <span className="macro-ring__label">{label}</span>
      </div>
    </div>
  );
}
