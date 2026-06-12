import React, { useState, useRef } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Smartphone,
  Copy,
  FileText,
  ChevronDown,
  Save,
  FolderOpen,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Button } from '@/components/common/Button';
import { sizePresets } from '@/utils/templates';
import { SizePresets } from './SizePresets';
import { ExportPanel } from './ExportPanel';
import { DraftsModal } from './DraftsModal';
import { generateShareLink } from '@/utils/storage';
import { saveDraft, getAllDrafts, getDraft } from '@/utils/storage';
import type { SizePreset } from '@/types';
import { cn } from '@/lib/utils';

interface TopToolbarProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  onShowMobilePreview: () => void;
  onRestoreVersion?: (state: any) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onToggleLeftPanel,
  onToggleRightPanel,
  leftPanelCollapsed,
  rightPanelCollapsed,
  onShowMobilePreview,
  onRestoreVersion,
}) => {
  const {
    name,
    setName,
    width,
    height,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    createVariant,
    loadState,
    id,
  } = useCanvasStore();

  const [showSizePresets, setShowSizePresets] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const currentPreset = sizePresets.find(
    (p) => p.width === width && p.height === height
  );

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.3));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleSelectPreset = (preset: SizePreset) => {
    useCanvasStore.getState().setCanvasSize(preset.width, preset.height);
    setShowSizePresets(false);
  };

  const handleCreateVariant = () => {
    const variant = createVariant();
    loadState(variant);
  };

  const handleGenerateShare = () => {
    const state = useCanvasStore.getState();
    const link = generateShareLink({
      id: state.id,
      name: state.name,
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      elements: state.elements,
      selectedElementId: state.selectedElementId,
      zoom: state.zoom,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    });
    setShareLink(link);
    setShowShareModal(true);
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('链接已复制到剪贴板！');
    } catch (e) {
      alert('复制失败，请手动复制');
    }
  };

  const handleSave = () => {
    const state = useCanvasStore.getState();
    saveDraft({
      id: state.id,
      name: state.name,
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      elements: state.elements,
      selectedElementId: state.selectedElementId,
      zoom: state.zoom,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    });
    alert('保存成功！');
  };

  const handleLoadDraft = (draftId: string) => {
    const draft = getDraft(draftId);
    if (draft) {
      loadState(draft);
      setShowDrafts(false);
    }
  };

  const handleNameBlur = () => {
    if (editName.trim()) {
      setName(editName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditName(name);
      setIsEditingName(false);
    }
  };

  React.useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  return (
    <>
      <div className="h-14 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLeftPanel}
            className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
          >
            {leftPanelCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>

          <div className="h-6 w-px bg-dark-700 mx-2" />

          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="bg-dark-800 text-white px-2 py-1 rounded border border-accent-500 outline-none text-sm font-medium"
              style={{ minWidth: '150px' }}
            />
          ) : (
            <button
              onClick={() => {
                setEditName(name);
                setIsEditingName(true);
              }}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-dark-800 transition-colors"
            >
              <FileText size={16} className="text-accent-500" />
              <span className="text-white font-medium text-sm">{name}</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowSizePresets(!showSizePresets)}
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 rounded-lg text-dark-200 text-xs hover:bg-dark-700 transition-colors"
            >
              {currentPreset ? currentPreset.name : `${width} × ${height}`}
              <ChevronDown size={14} />
            </button>
            {showSizePresets && (
              <SizePresets
                onSelect={handleSelectPreset}
                currentWidth={width}
                currentHeight={height}
                onClose={() => setShowSizePresets(false)}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Undo2 size={16} />}
            onClick={undo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Redo2 size={16} />}
            onClick={redo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
          />

          <div className="h-6 w-px bg-dark-700 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            icon={<ZoomOut size={16} />}
            onClick={handleZoomOut}
            title="缩小"
          />
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs text-dark-300 hover:text-white hover:bg-dark-700 rounded transition-colors min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="sm"
            icon={<ZoomIn size={16} />}
            onClick={handleZoomIn}
            title="放大"
          />

          <div className="h-6 w-px bg-dark-700 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            icon={<Copy size={16} />}
            onClick={handleCreateVariant}
            title="创建变体"
          >
            变体
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Smartphone size={16} />}
            onClick={onShowMobilePreview}
            title="手机预览"
          >
            预览
          </Button>

          <div className="h-6 w-px bg-dark-700 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            icon={<FolderOpen size={16} />}
            onClick={() => setShowDrafts(true)}
            title="我的草稿"
          >
            草稿
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Save size={16} />}
            onClick={handleSave}
            title="保存"
          >
            保存
          </Button>

          <div className="h-6 w-px bg-dark-700 mx-1" />

          <Button
            variant="secondary"
            size="sm"
            icon={<Share2 size={16} />}
            onClick={handleGenerateShare}
          >
            分享
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => setShowExportPanel(true)}
          >
            导出
          </Button>

          <button
            onClick={onToggleRightPanel}
            className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors ml-2"
          >
            {rightPanelCollapsed ? <Menu size={18} className="rotate-180" /> : <X size={18} className="rotate-180" />}
          </button>
        </div>
      </div>

      {showExportPanel && (
        <ExportPanel onClose={() => setShowExportPanel(false)} />
      )}

      {showDrafts && (
        <DraftsModal
          onClose={() => setShowDrafts(false)}
          onLoad={handleLoadDraft}
          onRestore={(state) => {
            if (onRestoreVersion) onRestoreVersion(state);
            setShowDrafts(false);
          }}
        />
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-md border border-dark-700 animate-bounce-in">
            <h3 className="text-lg font-semibold text-white mb-4">分享链接</h3>
            <p className="text-sm text-dark-400 mb-4">
              复制以下链接分享给他人，他们可以在只读模式下查看您的海报设计。
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white text-sm focus:outline-none"
              />
              <Button variant="primary" onClick={handleCopyShareLink}>
                复制
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
