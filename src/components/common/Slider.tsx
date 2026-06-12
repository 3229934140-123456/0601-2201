import React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  showInput?: boolean;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
  showInput = true,
  unit = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 relative h-2 bg-dark-700 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-accent-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent-500 rounded-full shadow-lg transition-transform hover:scale-125 pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      {showInput && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
            className="w-16 px-2 py-1 text-sm bg-dark-900 border border-dark-600 rounded text-white text-right focus:outline-none focus:border-accent-500"
            min={min}
            max={max}
            step={step}
          />
          {unit && <span className="text-xs text-dark-400 w-6">{unit}</span>}
        </div>
      )}
    </div>
  );
};
