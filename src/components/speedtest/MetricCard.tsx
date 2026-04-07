"use client";

interface MetricCardProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  isActive?: boolean;
}

export function MetricCard({ label, value, unit, isActive }: MetricCardProps) {
  const displayValue = value === null || value === undefined || value === 0 
    ? "--" 
    : value.toFixed(value > 10 ? 1 : 2);

  return (
    <div className={`flex flex-col p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border ${isActive ? 'border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'border-slate-200 dark:border-slate-700'} transition-all duration-300`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </span>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
          {displayValue}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}
