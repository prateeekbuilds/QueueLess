import React from 'react';
import clsx from 'clsx';

export default function Card({
  children,
  title,
  subtitle,
  actions,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  ...props
}) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden transition-all',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div
          className={clsx(
            'px-6 py-4.5 border-b border-gray-100 flex items-center justify-between gap-4',
            headerClassName
          )}
        >
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={clsx('p-6', bodyClassName)}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100">{footer}</div>
      )}
    </div>
  );
}

