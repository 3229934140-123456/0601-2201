import { useState, useEffect } from 'react';
import { TopToolbar } from '@/components/toolbar/TopToolbar';
import { LeftPanel } from '@/components/panels/LeftPanel';
import { RightPanel } from '@/components/panels/RightPanel';
import { Canvas } from '@/components/canvas/Canvas';
import MobilePreview from '@/components/toolbar/MobilePreview';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function Editor() {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const { loadState } = useCanvasStore();

  useAutoSave();
  useKeyboard();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get('draft');
    if (draftId) {
      const { getDraft } = require('@/utils/storage');
      const draft = getDraft(draftId);
      if (draft) {
        loadState(draft);
      }
    }
  }, [loadState]);

  const handleToggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  const handleToggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-950 overflow-hidden">
      <TopToolbar
        onToggleLeftPanel={handleToggleLeftPanel}
        onToggleRightPanel={handleToggleRightPanel}
        leftPanelCollapsed={leftPanelCollapsed}
        rightPanelCollapsed={rightPanelCollapsed}
        onShowMobilePreview={() => setShowMobilePreview(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <LeftPanel isCollapsed={leftPanelCollapsed} onToggle={handleToggleLeftPanel} />

        <main className="flex-1 overflow-auto bg-dark-950 relative">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />
          <Canvas />
        </main>

        <RightPanel isCollapsed={rightPanelCollapsed} onToggle={handleToggleRightPanel} />
      </div>

      <MobilePreview
        isOpen={showMobilePreview}
        onClose={() => setShowMobilePreview(false)}
      />
    </div>
  );
}
