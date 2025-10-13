import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'color';
  showText?: boolean;
}

export function Logo({ size = 'md', variant = 'color', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const textColorClasses = {
    light: 'text-white',
    dark: 'text-gray-800',
    color: 'text-gray-800'
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="15" width="90" height="90" rx="8" stroke="#1E40AF" strokeWidth="4" fill="none"/>
          <rect x="25" y="30" width="70" height="6" rx="3" fill="#3B82F6"/>
          <rect x="25" y="42" width="70" height="6" rx="3" fill="#3B82F6"/>
          <rect x="25" y="54" width="70" height="6" rx="3" fill="#60A5FA"/>
          <rect x="25" y="66" width="70" height="6" rx="3" fill="#60A5FA"/>
          <rect x="25" y="78" width="70" height="6" rx="3" fill="#3B82F6"/>
          <rect x="25" y="90" width="70" height="6" rx="3" fill="#3B82F6"/>
          <line x1="102" y1="30" x2="102" y2="96" stroke="#1E40AF" strokeWidth="2"/>
          <circle cx="102" cy="100" r="4" fill="#1E40AF"/>
        </svg>
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold ${textColorClasses[variant]} leading-tight`}>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              BlindsCloud
            </span>
          </h1>
          {size !== 'sm' && (
            <p className={`text-xs ${variant === 'light' ? 'text-blue-100' : 'text-blue-600'} font-medium`}>
              Professional Blinds Solutions
            </p>
          )}
        </div>
      )}
    </div>
  );
}