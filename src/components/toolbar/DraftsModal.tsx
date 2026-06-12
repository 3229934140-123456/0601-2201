import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { getAllDrafts, deleteDraft } from '@/utils/storage';
import type { DraftMeta } from '@/types';

interface DraftsModalProps {
  onClose: () => void;
  onLoad: (draftId: string) => void;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({ onClose, onLoad }) => {
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);

  useEffect(() => {
    setDrafts(getAllDrafts());
  }, []);

  const handleDelete = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个草稿吗？')) {
      deleteDraft(draftId);
      setDrafts(getAllDrafts());
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
    
    return date.toLocaleDateString('zh-CN');
  };

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
