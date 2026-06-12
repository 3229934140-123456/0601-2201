import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useBrandStore } from '@/store/useBrandStore';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, className, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { colors } = useBrandStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const presetColors = [
    ...colors,
    '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  ];

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && <label className="block text-xs text-dark-400 mb-1.5">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg hover:border-accent-500 transition-colors"
      >
        <div
          className="w-6 h-6 rounded border border-dark-600"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-white font-mono">{value.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 p-3 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl animate-fade-in w-64">
          <div className="grid grid-cols-5 gap-2 mb-3">
            {presetColors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-9 h-9 rounded-lg border-2 transition-all hover:scale-110',
                  value.toLowerCase() === color.toLowerCase()
                    ? 'border-accent-500 shadow-lg shadow-accent-500/30'
                    : 'border-dark-600 hover:border-dark-500'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-dark-900 border border-dark-600 rounded-lg text-white font-mono focus:outline-none focus:border-accent-500"
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
};
