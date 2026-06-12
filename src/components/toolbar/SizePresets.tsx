import React from 'react';
import { sizePresets } from '@/utils/templates';
import type { SizePreset } from '@/types';
import {
  Square,
  Image,
  Smartphone,
  Monitor,
  MessageSquare,
  BookOpen,
  MessageCircle,
  Music,
  RectangleHorizontal,
  FileImage,
  Check,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Square: <Square size={16} />,
  Image: <Image size={16} />,
  Smartphone: <Smartphone size={16} />,
  Monitor: <Monitor size={16} />,
  MessageSquare: <MessageSquare size={16} />,
  BookOpen: <BookOpen size={16} />,
  MessageCircle: <MessageCircle size={16} />,
  Music: <Music size={16} />,
  RectangleHorizontal: <RectangleHorizontal size={16} />,
  FileImage: <FileImage size={16} />,
};

interface SizePresetsProps {
  onSelect: (preset: SizePreset) => void;
  currentWidth: number;
  currentHeight: number;
  onClose: () => void;
}

export const SizePresets: React.FC<SizePresetsProps> = ({
  onSelect,
  currentWidth,
  currentHeight,
  onClose,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const platforms = [...new Set(sizePresets.map((p) => p.platform))];

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-2 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 w-72 overflow-hidden animate-fade-in"
    >
      <div className="p-3 border-b border-dark-700">
        <h4 className="text-sm font-medium text-white">尺寸预设</h4>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {platforms.map((platform) => (
          <div key={platform} className="p-2">
            <p className="text-xs text-dark-500 px-2 py-1">{platform}</p>
            {sizePresets
              .filter((p) => p.platform === platform)
              .map((preset) => {
                const isSelected = preset.width === currentWidth && preset.height === currentHeight;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelect(preset)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-accent-500/20 border border-accent-500/50'
                        : 'hover:bg-dark-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-accent-500 text-white' : 'bg-dark-700 text-dark-300'
                    }`}>
                      {iconMap[preset.icon] || <Square size={16} />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm ${isSelected ? 'text-white' : 'text-dark-200'}`}>
                        {preset.name}
                      </p>
                      <p className="text-xs text-dark-500">
                        {preset.width} × {preset.height}px
                      </p>
                    </div>
                    {isSelected && <Check size={16} className="text-accent-500" />}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};
