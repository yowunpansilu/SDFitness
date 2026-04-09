export interface AppAvatarProps {
  src?: string | null;
  altText: string;
  size?: number; // pixel size 
  status?: 'online' | 'offline' | null;
  className?: string;
}

export function AppAvatar({ src, altText, size = 48, status = null, className = '' }: AppAvatarProps) {
  // Extract initials for fallback
  const initials = altText
    .split(' ')
    .slice(0, 2)
    .map((word: string) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div 
      className={`avatar-wrap ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="img"
      aria-label={altText}
    >
      {src ? (
        <img src={src} alt={altText} className="avatar-image" loading="lazy" />
      ) : (
        <span className="avatar-fallback" style={{ fontSize: `${size * 0.4}px` }}>{initials}</span>
      )}

      {status && (
        <div className={`avatar-status-ring avatar-status-ring--${status}`} />
      )}
    </div>
  );
}
