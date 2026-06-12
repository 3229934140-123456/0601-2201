import React, { useState } from 'react';
import { templates } from '@/utils/templates';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useBrandStore } from '@/store/useBrandStore';
import { applyBrandStyle } from '@/utils/brand';
import { Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const TemplateLibrary: React.FC = () => {
  const { applyTemplate } = useCanvasStore();
  const brand = useBrandStore();
  const [applyingBrand, setApplyingBrand] = useState(false);

  const categories = [...new Set(templates.map((t) => t.category))];

  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filteredTemplates = activeCategory
    ? templates.filter((t) => t.category === activeCategory)
    : templates;

  const handleApplyWithBrand = (templateId: string) => {
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;
    setApplyingBrand(true);
    try {
      const tmpState: any = {
        id: Math.random().toString(36).slice(2, 10),
        name: tpl.name + '（品牌版）',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        selectedElementId: null,
        zoom: 1,
        ...tpl.canvasState,
      };
      const branded = applyBrandStyle(tmpState, {
        logo: brand.logo,
        colors: brand.colors,
        fonts: brand.fonts,
      });
      applyTemplate(branded as any);
    } finally {
      setTimeout(() => setApplyingBrand(false), 500);
    }
  };

  return (
    <div className="p-3">
      <div className="mb-4 p-3 rounded-xl bg-dark-800/60 border border-dark-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Palette size={14} className="text-accent-500" />
            <span className="text-xs font-medium text-white">品牌风格</span>
          </div>
          <div className="flex items-center gap-1">
            {brand.colors.slice(0, 5).map((c, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-dark-700"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            {brand.logo && (
              <div className="w-5 h-5 rounded bg-dark-700 overflow-hidden border border-dark-600 ml-1">
                <img src={brand.logo} alt="logo" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>
        <p className="text-[10px] text-dark-400">
          鼠标悬停模板后点击 <span className="text-accent-500">品牌图标</span>，可一键套用品牌色板与 Logo
        </p>
      </div>

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
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyWithBrand(template.id);
                  }}
                  className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center hover:bg-accent-400 transition-colors shadow-lg"
                  title="套用品牌风格"
                >
                  {applyingBrand ? (
                    <Sparkles size={12} className="text-white animate-pulse" />
                  ) : (
                    <Palette size={12} className="text-white" />
                  )}
                </button>
                <div className="w-6 h-6 bg-dark-800/90 rounded-full flex items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-dark-300 truncate">{template.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
