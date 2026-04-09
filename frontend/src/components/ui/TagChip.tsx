interface TagChipProps {
  label: string;
  variant?: 'brand' | 'energy' | 'neutral';
  className?: string;
}

export function TagChip({ label, variant = 'neutral', className = '' }: TagChipProps) {
  return (
    <span className={`tag-chip tag-chip--${variant} ${className}`}>
      {label}
    </span>
  );
}
