interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: 'brand' | 'energy';
  className?: string;
  height?: number; // optionally override height in px
}

export function ProgressBar({ progress, variant = 'brand', className = '', height }: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div 
      className={`progress-bar-wrap ${className}`} 
      style={height ? { height: `${height}px` } : undefined}
      role="progressbar" 
      aria-valuenow={safeProgress} 
      aria-valuemin={0} 
      aria-valuemax={100}
    >
      <div 
        className={`progress-bar-fill progress-bar-fill--${variant}`} 
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}
