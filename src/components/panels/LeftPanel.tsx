import React, { useState } from 'react';
import { LayoutTemplate, Image, Upload, Type, Square } from 'lucide-react';
import { Tabs } from '@/components/common/Tabs';
import { TemplateLibrary } from './TemplateLibrary';
import { MaterialPanel } from './MaterialPanel';
import { UploadPanel } from './UploadPanel';
import { useCanvasStore } from '@/store/useCanvasStore';
import { cn } from '@/lib/utils';

interface LeftPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ isCollapsed, onToggle }) => {
  const [activeTab, setActiveTab] = useState('templates');

  const tabs = [
    { id: 'templates', label: '模板', icon: <LayoutTemplate size={16} /> },
    { id: 'materials', label: '素材', icon: <Image size={16} /> },
    { id: 'upload', label: '上传', icon: <Upload size={16} /> },
  ];

  const quickAddItems = [
    { id: 'text', label: '文字', icon: <Type size={18} />, action: 'addText' },
    { id: 'rect', label: '矩形', icon: <Square size={18} />, action: 'addRect' },
    { id: 'circle', label: '圆形', icon: <Square size={18} className="rounded-full" />, action: 'addCircle' },
  ];

  return (
    <div
      className={cn(
        'h-full bg-dark-900 border-r border-dark-700 flex flex-col transition-all duration-300 animate-slide-in-left',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                onToggle();
              }}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                activeTab === tab.id
                  ? 'bg-accent-500 text-white'
                  : 'text-dark-400 hover:bg-dark-700 hover:text-white'
              )}
            >
              {tab.icon}
            </button>
          ))}
          <div className="w-8 h-px bg-dark-700 my-2" />
          {quickAddItems.map((item) => (
            <QuickAddButton key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="p-3 border-b border-dark-700">
            <p className="text-xs text-dark-400 mb-2">快速添加</p>
            <div className="flex gap-2">
              {quickAddItems.map((item) => (
                <QuickAddButton key={item.id} item={item} horizontal />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {activeTab === 'templates' && <TemplateLibrary />}
            {activeTab === 'materials' && <MaterialPanel />}
            {activeTab === 'upload' && <UploadPanel />}
          </div>
        </>
      )}
    </div>
  );
};

interface QuickAddButtonProps {
  item: { id: string; label: string; icon: React.ReactNode; action: string };
  horizontal?: boolean;
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({ item, horizontal }) => {
  const { addElement } = useCanvasStore();

  const handleClick = () => {
    if (item.action === 'addText') {
      addElement({
        type: 'text',
        x: 540,
        y: 540,
        width: 400,
        height: 80,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        content: '双击编辑文字',
        fontSize: 48,
        fontFamily: 'Inter',
        fontWeight: 600,
        color: '#1e293b',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
      });
    } else if (item.action === 'addRect') {
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
    } else if (item.action === 'addCircle') {
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
    }
  };

  if (horizontal) {
    return (
      <button
        onClick={handleClick}
        className="flex-1 flex flex-col items-center gap-1 p-3 bg-dark-800 rounded-lg text-dark-300 hover:bg-dark-700 hover:text-white hover:scale-105 transition-all"
      >
        {item.icon}
        <span className="text-xs">{item.label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-10 h-10 rounded-lg flex items-center justify-center text-dark-400 hover:bg-dark-700 hover:text-white transition-all"
      title={item.label}
    >
      {item.icon}
    </button>
  );
};
