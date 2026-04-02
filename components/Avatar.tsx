
import React from 'react';

interface AvatarProps {
  nome: string;
  fotoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ nome, fotoUrl, size = 'md', className = '' }) => {
  const getInitials = (n: string) => {
    const parts = n.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-4xl',
  };

  if (fotoUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 ${className}`}>
        <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-[#8B1538] text-white flex items-center justify-center font-serif font-bold border-2 border-white shadow-sm shrink-0 ${className}`}>
      {getInitials(nome)}
    </div>
  );
};

export default Avatar;
