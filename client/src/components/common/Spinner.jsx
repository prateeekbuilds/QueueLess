import React from 'react';
import clsx from 'clsx';

export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={clsx(
        'inline-block animate-spin rounded-full border-solid border-current border-t-transparent',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

