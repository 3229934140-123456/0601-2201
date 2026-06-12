import React, { useState } from 'react';
import { shapeMaterials, backgroundImages, decorationImages } from '@/utils/materials';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Plus } from 'lucide-react';

export const MaterialPanel: React.FC = () => {
  const { addElement, setBackgroundColor } = useCanvasStore();
  const [activeCategory, setActiveCategory] = useState('shapes');

  const categories = [
    { id: 'shapes', label: '形状', items: shapeMaterials },
    { id: 'backgrounds', label: '背景', items: backgroundImages },
    { id: 'decorations', label: '装饰', items: decorationImages },
  ];

  const activeItems = categories.find((c) => c.id === activeCategory)?.items || [];

  const handleAddShape = (item: any) => {
    if (item.thumbnail === 'rect') {
      addElement({
        type: 'shape',
        shapeType: 'rectangle',
        x: 540,
        y: 540,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        fill: '#3b82f6',
        stroke: 'transparent',
        strokeWidth: 0,
        borderRadius: 8,
      });
    } else if (item.thumbnail === 'circle') {
      addElement({
        type: 'shape',
        shapeType: 'circle',
        x: 540,
        y: 540,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        fill: '#8b5cf6',
        stroke: 'transparent',
        strokeWidth: 0,
        borderRadius: 100,
      });
    } else if (item.thumbnail === 'triangle') {
      addElement({
        type: 'shape',
        shapeType: 'triangle',
        x: 540,
        y: 540,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        fill: '#22c55e',
        stroke: 'transparent',
        strokeWidth: 0,
        borderRadius: 0,
      });
    }
  };

  const handleAddImage = (item: any) => {
    if (activeCategory === 'backgrounds') {
      addElement({
        type: 'image',
        x: 540,
        y: 540,
        width: 1080,
        height: 1080,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        src: item.src,
        objectFit: 'cover',
        borderRadius: 0,
      });
    } else {
      addElement({
        type: 'image',
        x: 540,
        y: 540,
        width: 300,
        height: 300,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        src: item.src,
        objectFit: 'contain',
        borderRadius: 0,
      });
    }
  };

  const renderShapeIcon = (type: string) => {
    if (type === 'rect') {
      return <div className="w-10 h-10 bg-blue-500 rounded" />;
    }
    if (type === 'circle') {
      return <div className="w-10 h-10 bg-purple-500 rounded-full" />;
    }
    if (type === 'triangle') {
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '35px solid #22c55e',
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all ${
              activeCategory === category.id
                ? 'bg-accent-500 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer relative"
            onClick={() => {
              if (item.type === 'shape') {
                handleAddShape(item);
              } else {
                handleAddImage(item);
              }
            }}
          >
            <div className="aspect-square bg-dark-800 rounded-lg overflow-hidden border border-dark-700 hover:border-accent-500 transition-all group-hover:scale-105 flex items-center justify-center">
              {item.type === 'shape' ? (
                renderShapeIcon(item.thumbnail)
              ) : (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-dark-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center animate-bounce-in">
                  <Plus size={16} className="text-white" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-dark-300 text-center truncate">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
