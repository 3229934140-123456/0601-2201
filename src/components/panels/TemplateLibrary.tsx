import React from 'react';
import { templates } from '@/utils/templates';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Sparkles } from 'lucide-react';

export const TemplateLibrary: React.FC = () => {
  const { applyTemplate } = useCanvasStore();

  const categories = [...new Set(templates.map((t) => t.category))];

  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filteredTemplates = activeCategory
    ? templates.filter((t) => t.category === activeCategory)
    : templates;

  return (
    <div className="p-3">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
            activeCategory === null
              ? 'bg-accent-500 text-white'
              : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
          }`}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${
              activeCategory === category
                ? 'bg-accent-500 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="group cursor-pointer"
            onClick={() => applyTemplate(template.canvasState)}
          >
            <div className="relative aspect-[4/5] bg-dark-800 rounded-lg overflow-hidden border border-dark-700 hover:border-accent-500 transition-all group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-accent-500/20">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white font-medium">{template.name}</p>
                  <p className="text-[10px] text-dark-400">{template.category}</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-dark-300 text-center">{template.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
