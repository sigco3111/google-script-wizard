import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  color?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-150 ease-in-out inline-flex items-center justify-center shadow-md border';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const colorStyles = {
    primary: {
      solid: 'bg-sky-500/30 border-sky-400/50 text-sky-100 hover:bg-sky-500/40 hover:border-sky-300/70 focus:ring-sky-400 backdrop-filter backdrop-blur-md disabled:bg-sky-600/20 disabled:border-sky-500/30 disabled:text-sky-300/50 disabled:cursor-not-allowed',
      outline: 'bg-sky-500/10 border-sky-500/70 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400/90 focus:ring-sky-400 backdrop-filter backdrop-blur-sm disabled:border-sky-600/30 disabled:text-sky-400/50 disabled:bg-sky-700/10 disabled:cursor-not-allowed',
      ghost: 'bg-transparent border-transparent text-sky-300 hover:bg-sky-500/20 focus:ring-sky-400 disabled:text-sky-400/50 disabled:cursor-not-allowed',
    },
    secondary: {
      solid: 'bg-slate-500/30 border-slate-400/50 text-slate-100 hover:bg-slate-500/40 hover:border-slate-300/70 focus:ring-slate-400 backdrop-filter backdrop-blur-md disabled:bg-slate-600/20 disabled:border-slate-500/30 disabled:text-slate-300/50 disabled:cursor-not-allowed',
      outline: 'bg-slate-500/10 border-slate-500/70 text-slate-300 hover:bg-slate-500/20 hover:border-slate-400/90 focus:ring-slate-400 backdrop-filter backdrop-blur-sm disabled:border-slate-600/30 disabled:text-slate-400/50 disabled:bg-slate-700/10 disabled:cursor-not-allowed',
      ghost: 'bg-transparent border-transparent text-slate-300 hover:bg-slate-500/20 focus:ring-slate-400 disabled:text-slate-400/50 disabled:cursor-not-allowed',
    },
    danger: {
      solid: 'bg-red-500/40 border-red-400/60 text-red-100 hover:bg-red-500/50 hover:border-red-300/80 focus:ring-red-400 backdrop-filter backdrop-blur-md disabled:bg-red-600/20 disabled:border-red-500/30 disabled:text-red-300/50 disabled:cursor-not-allowed',
      outline: 'bg-red-500/10 border-red-500/70 text-red-300 hover:bg-red-500/20 hover:border-red-400/90 focus:ring-red-400 backdrop-filter backdrop-blur-sm disabled:border-red-600/30 disabled:text-red-400/50 disabled:bg-red-700/10 disabled:cursor-not-allowed',
      ghost: 'bg-transparent border-transparent text-red-300 hover:bg-red-500/20 focus:ring-red-400 disabled:text-red-400/50 disabled:cursor-not-allowed',
    },
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  // Corrected className concatenation
  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${colorStyles[color][variant]} ${widthStyle} ${className}`.trim();

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};
