import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, Clock, RotateCcw, Eye, ChevronLeft, History } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { getAllDrafts, deleteDraft, getDraftVersions, restoreDraftVersion } from '@/utils/storage';
import type { DraftMeta, DraftVersion, CanvasElement, TextElement, ImageElement, ShapeElement } from '@/types';

interface DraftsModalProps {
  onClose: () => void;
  onLoad: (draftId: string) => void;
  onRestore: (state: any) => void;
}

type ViewMode = 'list' | 'versions';

export const DraftsModal: React.FC<DraftsModalProps> = ({ onClose, onLoad, onRestore }) => {
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDraft, setSelectedDraft] = useState<DraftMeta | null>(null);
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [previewVersion, setPreviewVersion] = useState<DraftVersion | null>(null);

  const refreshDrafts = () => {
    setDrafts(getAllDrafts());
  };

  useEffect(() => {
    refreshDrafts();
  }, []);

  const handleDelete = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个草稿吗？所有版本将同时删除。')) {
      deleteDraft(draftId);
      refreshDrafts();
    }
  };

  const handleShowVersions = (e: React.MouseEvent, draft: DraftMeta) => {
    e.stopPropagation();
    setSelectedDraft(draft);
    setVersions(getDraftVersions(draft.id));
    setViewMode('versions');
  };

  const handleRestore = (version: DraftVersion) => {
    if (!selectedDraft) return;
    if (!confirm(`确定要恢复到「${formatDate(version.savedAt)}」版本吗？当前内容会保存为新版本。`)) {
      return;
    }
    const restored = restoreDraftVersion(selectedDraft.id, version.id);
    if (restored) {
      onRestore(restored);
      refreshDrafts();
      setVersions(getDraftVersions(selectedDraft.id));
      setPreviewVersion(null);
      alert('版本恢复成功！');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPreviewElement = (element: CanvasElement, scale: number) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: (element.x - element.width / 2) * scale,
      top: (element.y - element.height / 2) * scale,
      width: element.width * scale,
      height: element.height * scale,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      zIndex: element.zIndex,
    };

    const shadowStyle = element.shadow
      ? `${element.shadow.offsetX * scale}px ${element.shadow.offsetY * scale}px ${element.shadow.blur * scale}px ${element.shadow.color}`
      : 'none';

    switch (element.type) {
      case 'text': {
        const textEl = element as TextElement;
        return (
          <div key={element.id} style={baseStyle}>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: textEl.textAlign === 'center' ? 'center' : textEl.textAlign === 'right' ? 'flex-end' : 'flex-start',
                fontSize: textEl.fontSize * scale,
                fontFamily: textEl.fontFamily,
                fontWeight: textEl.fontWeight,
                color: textEl.color,
                textAlign: textEl.textAlign,
                lineHeight: textEl.lineHeight,
                letterSpacing: textEl.letterSpacing,
                textShadow: shadowStyle !== 'none' ? shadowStyle : undefined,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflow: 'hidden',
              }}
            >
              {textEl.content}
            </div>
          </div>
        );
      }

      case 'image':
      case 'logo': {
        const imgEl = element as ImageElement;
        return (
          <div key={element.id} style={baseStyle}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: imgEl.borderRadius * scale,
                overflow: 'hidden',
                boxShadow: shadowStyle,
              }}
            >
              <img
                src={imgEl.src}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: imgEl.objectFit,
                  pointerEvents: 'none',
                }}
                draggable={false}
              />
            </div>
          </div>
        );
      }

      case 'shape': {
        const shapeEl = element as ShapeElement;
        const isGradient = shapeEl.fill.startsWith('linear-gradient');

        if (shapeEl.shapeType === 'triangle') {
          return (
            <div key={element.id} style={baseStyle}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${(shapeEl.width / 2) * scale}px solid transparent`,
                  borderRight: `${(shapeEl.width / 2) * scale}px solid transparent`,
                  borderBottom: `${shapeEl.height * scale}px solid ${shapeEl.fill}`,
                  filter: shadowStyle !== 'none' ? `drop-shadow(${shadowStyle})` : undefined,
                }}
              />
            </div>
          );
        }

        return (
          <div key={element.id} style={baseStyle}>
            <div
              style={{
                width: '100%',
                height: '100%',
                background: isGradient ? shapeEl.fill : undefined,
                backgroundColor: isGradient ? undefined : shapeEl.fill,
                borderRadius: shapeEl.shapeType === 'circle' ? '50%' : shapeEl.borderRadius * scale,
                border: shapeEl.strokeWidth > 0 ? `${shapeEl.strokeWidth * scale}px solid ${shapeEl.stroke}` : 'none',
                boxShadow: shadowStyle,
              }}
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (viewMode === 'versions' && selectedDraft) {
    const pv = previewVersion || versions[0];
    const previewScale = Math.min(280 / selectedDraft.width, 200 / selectedDraft.height);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-dark-800 rounded-2xl w-full max-w-4xl border border-dark-700 overflow-hidden animate-bounce-in max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-dark-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setViewMode('list'); setSelectedDraft(null); setPreviewVersion(null); }}
                className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-semibold text-white">版本历史 - {selectedDraft.name}</h3>
                <p className="text-xs text-dark-400 mt-0.5">共保存 {versions.length} 个版本，最多保留最近 10 个</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-6 bg-dark-900/50 border-r border-dark-700">
              {pv ? (
                <div className="relative bg-white shadow-2xl animate-fade-in"
                  style={{
                    width: selectedDraft.width * previewScale,
                    height: selectedDraft.height * previewScale,
                    background: pv.state.backgroundColor || '#ffffff',
                  }}
                >
                  {pv.state.elements.filter(el => el.visible).map(el => renderPreviewElement(el, previewScale))}
                </div>
              ) : (
                <div className="text-center text-dark-500">
                  <History size={48} className="mx-auto mb-3 opacity-50" />
                  <p>暂无版本记录</p>
                </div>
              )}
            </div>

            <div className="w-80 overflow-y-auto scrollbar-thin flex-shrink-0">
              <div className="p-4 space-y-2">
                {versions.length === 0 ? (
                  <div className="text-center py-12 text-dark-400 text-sm">
                    暂无版本记录<br />保存草稿时会自动生成版本
                  </div>
                ) : (
                  versions.map((version, idx) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        (previewVersion?.id || versions[0]?.id) === version.id
                          ? 'bg-accent-500/10 border-accent-500'
                          : 'bg-dark-700/50 border-dark-600 hover:border-dark-500'
                      }`}
                      onClick={() => setPreviewVersion(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent-500">V{versions.length - idx}</span>
                          <span className="text-sm text-white">{formatDate(version.savedAt)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-dark-400 mb-2">
                        {version.state.elements.length} 个元素 · {version.state.width}×{version.state.height}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          icon={<Eye size={12} />}
                          onClick={(e: any) => { e.stopPropagation(); setPreviewVersion(version); }}
                        >
                          预览
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 text-xs"
                          icon={<RotateCcw size={12} />}
                          onClick={(e: any) => { e.stopPropagation(); handleRestore(version); }}
                        >
                          恢复
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-dark-700 flex justify-end flex-shrink-0">
            <Button variant="secondary" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-800 rounded-2xl w-full max-w-2xl border border-dark-700 overflow-hidden animate-bounce-in max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-dark-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">我的草稿</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {drafts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-dark-500" />
              </div>
              <p className="text-dark-300 mb-2">暂无草稿</p>
              <p className="text-sm text-dark-500">开始创建您的第一张海报吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => onLoad(draft.id)}
                  className="group bg-dark-700/50 rounded-xl border border-dark-600 overflow-hidden cursor-pointer hover:border-accent-500/50 hover:shadow-lg hover:shadow-accent-500/10 transition-all"
                >
                  <div className="aspect-video bg-dark-900 relative overflow-hidden">
                    {draft.thumbnail ? (
                      <img
                        src={draft.thumbnail}
                        alt={draft.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div
                          className="bg-white"
                          style={{
                            width: `${Math.min(draft.width, 120)}px`,
                            height: `${Math.min(draft.height, 80)}px`,
                          }}
                        />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleShowVersions(e, draft)}
                        className="p-1.5 bg-dark-800/90 rounded-lg text-white hover:bg-dark-700 transition-colors"
                        title="版本历史"
                      >
                        <History size={14} />
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDelete(e, draft.id)}
                        className="p-1.5 bg-red-600/90 rounded-lg text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-dark-900/80 rounded text-[10px] text-dark-300">
                      {draft.width} × {draft.height}
                    </div>
                    {draft.versions && draft.versions.length > 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-accent-500/80 rounded text-[10px] text-white">
                        {draft.versions.length} 个版本
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-white truncate">{draft.name}</h4>
                    <div className="flex items-center gap-1 mt-1 text-xs text-dark-400">
                      <Clock size={12} />
                      <span>{formatDate(draft.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-dark-700 flex justify-end gap-3 flex-shrink-0">
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};
