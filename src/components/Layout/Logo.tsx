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
      <img
        src="/ChatGPT Image Oct 9, 2025, 03_24_42 PM.png"
        alt="BlindsCloud Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold ${textColorClasses[variant]} leading-tight`}>
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              BlindsCloud
            </span>
          </h1>
          {size !== 'sm' && (
            <p className={`text-xs ${variant === 'light' ? 'text-blue-100' : 'text-blue-600'} font-medium`}>
              Blindfold Solutions
            </p>
          )}
        </div>
      )}
    </div>
  );
}