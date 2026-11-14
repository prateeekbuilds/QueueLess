import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  className = '',
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', selectedColor.bg, selectedColor.text)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
        {trendValue && (
          <span
            className={clsx(
              'inline-flex items-center text-xs font-medium',
              trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

