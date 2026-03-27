import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string; // Made optional to handle initial states better
  alt: string;
  size?: AvatarSize;
  className?: string;
  // Adjusted to accept boolean for easier integration with user.isOnline
  status?: 'online' | 'offline' | 'away' | 'busy' | boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  status,
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };
  
  // Helper to determine status color
  const getStatusColor = () => {
    if (status === true || status === 'online') return 'bg-green-500';
    if (status === 'away') return 'bg-yellow-500';
    if (status === 'busy') return 'bg-red-500';
    return 'bg-gray-400'; // Default for false or 'offline'
  };
  
  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  // Safe fallback URL
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&color=fff`;
  
  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <img
        src={src || fallbackSrc}
        alt={alt}
        className={`rounded-full object-cover border border-gray-100 ${sizeClasses[size]}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = fallbackSrc;
        }}
      />
      
      {/* Only show status dot if status is explicitly provided (string or true) */}
      {status !== undefined && status !== false && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${getStatusColor()} ${statusSizes[size]}`}
        />
      )}
    </div>
  );
};