import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { cn } from '@/lib/utils';
import type { CanvasElement } from '@/types';

const elementIcons: Record<string, string> = {
  text: 'T',
  image: '🖼️',
  shape: '■',
  logo: '🏷️',
};

export const LayerPanel: React.FC = () => {
  const {
    elements,
    selectedElementId,
    selectElement,
    toggleVisibility,
    toggleLock,
    duplicateElement,
    deleteElement,
    moveLayerUp,
    moveLayerDown,
  } = useCanvasStore();

  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleDragStart = (e: React.DragEvent, element: CanvasElement) => {
    e.dataTransfer.setData('text/plain', element.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedIndex = sortedElements.findIndex((el) => el.id === draggedId);
    
    if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
      const startIndex = elements.findIndex((el) => el.id === draggedId);
      const endIndex = elements.findIndex((el) => el.id === sortedElements[targetIndex].id);
      useCanvasStore.getState().reorderElements(startIndex, endIndex);
    }
  };

  return (
    <div className="p-3 space-y-2">
      {sortedElements.length === 0 ? (
        <div className="text-center py-8 text-dark-400">
          <p className="text-sm">暂无图层</p>
          <p className="text-xs mt-1">添加元素以开始编辑</p>
        </div>
      ) : (
        sortedElements.map((element, index) => (
          <div
            key={element.id}
            draggable={!element.locked}
            onDragStart={(e) => handleDragStart(e, element)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all',
              selectedElementId === element.id
                ? 'bg-accent-500/20 border border-accent-500/50'
                : 'bg-dark-800 hover:bg-dark-700 border border-transparent',
              element.locked && 'opacity-60'
            )}
            onClick={() => selectElement(element.id)}
          >
            <div className="w-8 h-8 rounded bg-dark-700 flex items-center justify-center text-sm font-bold text-dark-300">
              {elementIcons[element.type]}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm truncate',
                selectedElementId === element.id ? 'text-white' : 'text-dark-200',
                !element.visible && 'line-through text-dark-500'
              )}>
                {element.name}
              </p>
              <p className="text-xs text-dark-500">
                {element.type === 'text' ? '文本' : element.type === 'image' ? '图片' : element.type === 'logo' ? 'Logo' : '形状'}
              </p>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerUp(element.id);
                }}
                className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-white transition-colors"
                title="上移一层"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerDown(element.id);
                }}
                className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-white transition-colors"
                title="下移一层"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(element.id);
                }}
                className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-white transition-colors"
                title={element.visible ? '隐藏' : '显示'}
              >
                {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(element.id);
                }}
                className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-white transition-colors"
                title={element.locked ? '解锁' : '锁定'}
              >
                {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateElement(element.id);
                }}
                className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-white transition-colors"
                title="复制"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(element.id);
                }}
                className="p-1 rounded hover:bg-red-600/20 text-dark-400 hover:text-red-400 transition-colors"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
