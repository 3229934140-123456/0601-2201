import React, { useState } from 'react';
import { Layers, Settings, ChevronRight } from 'lucide-react';
import { Tabs } from '@/components/common/Tabs';
import { LayerPanel } from './LayerPanel';
import { PropertyPanel } from './PropertyPanel';
import { cn } from '@/lib/utils';

interface RightPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ isCollapsed, onToggle }) => {
  const [activeTab, setActiveTab] = useState('layers');

  const tabs = [
    { id: 'layers', label: '图层', icon: <Layers size={16} /> },
    { id: 'properties', label: '属性', icon: <Settings size={16} /> },
  ];

  return (
    <div
      className={cn(
        'h-full bg-dark-900 border-l border-dark-700 flex flex-col transition-all duration-300 animate-slide-in-right',
        isCollapsed ? 'w-16' : 'w-80'
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
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-dark-400 hover:bg-dark-700 hover:text-white transition-all mt-auto"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
        </div>
      ) : (
        <>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {activeTab === 'layers' && <LayerPanel />}
            {activeTab === 'properties' && <PropertyPanel />}
          </div>
        </>
      )}
    </div>
  );
};
