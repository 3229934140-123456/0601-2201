import React, { useState, useEffect } from 'react';
import { X, Download, Image, Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useCanvasStore } from '@/store/useCanvasStore';
import { exportToPNG, downloadPNG, exportStateToPNG } from '@/utils/exporter';
import { getAllDrafts, getDraft } from '@/utils/storage';
import type { DraftMeta, CanvasState } from '@/types';

interface ExportPanelProps {
  onClose: () => void;
}

const exportScales = [
  { value: 1, label: '1x', description: '标准质量' },
  { value: 2, label: '2x', description: '高清 (推荐)' },
  { value: 3, label: '3x', description: '超高清' },
];

type ExportMode = 'single' | 'batch';
type ExportItemStatus = 'pending' | 'exporting' | 'success' | 'failed';

interface ExportItem {
  id: string;
  name: string;
  state?: CanvasState;
  isCurrent?: boolean;
  status: ExportItemStatus;
  error?: string;
  size?: { w: number; h: number };
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ onClose }) => {
  const currentState = useCanvasStore();
  const [mode, setMode] = useState<ExportMode>('single');
  const [selectedScale, setSelectedScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['__current__']));
  const [exportItems, setExportItems] = useState<ExportItem[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  useEffect(() => {
    setDrafts(getAllDrafts());
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const allIds = ['__current__', ...drafts.map(d => d.id)];
    if (selectedIds.size === allIds.length) {
      setSelectedIds(new Set(['__current__']));
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const buildFilename = (name: string, w: number, h: number, scale: number) => {
    return `${name.replace(/\s+/g, '-').replace(/[\\/:*?"<>|]/g, '_')}-${w}x${h}@${scale}x.png`;
  };

  const handleSingleExport = async () => {
    setIsExporting(true);
    try {
      const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
      if (!canvasElement) {
        throw new Error('找不到画布元素');
      }

      const dataUrl = await exportToPNG(canvasElement, currentState, selectedScale);
      downloadPNG(dataUrl, buildFilename(currentState.name, currentState.width, currentState.height, selectedScale));
      onClose();
    } catch (e) {
      console.error('导出失败:', e);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const runBatchExport = async () => {
    if (selectedIds.size === 0) {
      alert('请至少选择一项进行导出');
      return;
    }

    const items: ExportItem[] = [];

    if (selectedIds.has('__current__')) {
      const s = useCanvasStore.getState();
      items.push({
        id: '__current__',
        name: s.name + '（当前）',
        state: { ...s },
        isCurrent: true,
        status: 'pending',
        size: { w: s.width, h: s.height },
      });
    }

    for (const d of drafts) {
      if (selectedIds.has(d.id)) {
        const st = getDraft(d.id);
        if (st) {
          items.push({
            id: d.id,
            name: d.name,
            state: st,
            status: 'pending',
            size: { w: d.width, h: d.height },
          });
        } else {
          items.push({
            id: d.id,
            name: d.name,
            status: 'failed',
            error: '读取草稿失败',
            size: { w: d.width, h: d.height },
          });
        }
      }
    }

    setExportItems(items);
    setDoneCount(0);
    setSuccessCount(0);
    setFailCount(items.filter(i => i.status === 'failed').length);
    setIsExporting(true);

    let done = items.filter(i => i.status === 'failed').length;
    let success = 0;
    let fail = items.filter(i => i.status === 'failed').length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'failed') continue;

      setExportItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'exporting' } : it));

      try {
        if (!item.state) throw new Error('无效的画布状态');
        const dataUrl = await exportStateToPNG(item.state, selectedScale);
        downloadPNG(dataUrl, buildFilename(item.name, item.size!.w, item.size!.h, selectedScale));
        setExportItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'success' } : it));
        success++;
      } catch (err: any) {
        setExportItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'failed', error: err?.message || '导出失败' } : it));
        fail++;
      }

      done++;
      setDoneCount(done);
      setSuccessCount(success);
      setFailCount(fail);
    }

    setIsExporting(false);
  };

  const failedItems = exportItems.filter(i => i.status === 'failed');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-800 rounded-2xl w-full max-w-3xl border border-dark-700 overflow-hidden animate-bounce-in max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-dark-700 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white">导出海报</h3>
            <p className="text-xs text-dark-400 mt-0.5">
              {mode === 'single' ? '导出当前画布' : '批量导出多张草稿 / 变体'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-dark-700">
          <button
            onClick={() => { setMode('single'); setIsExporting(false); setExportItems([]); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              mode === 'single' ? 'text-accent-500' : 'text-dark-400 hover:text-white'
            }`}
          >
            单张导出
            {mode === 'single' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />}
          </button>
          <div className="w-px bg-dark-700" />
          <button
            onClick={() => { setMode('batch'); setIsExporting(false); setExportItems([]); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              mode === 'batch' ? 'text-accent-500' : 'text-dark-400 hover:text-white'
            }`}
          >
            批量导出
            {mode === 'batch' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm text-dark-300 mb-3">导出倍率</label>
              <div className="grid grid-cols-3 gap-3">
                {exportScales.map((scale) => (
                  <button
                    key={scale.value}
                    onClick={() => setSelectedScale(scale.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedScale === scale.value
                        ? 'bg-accent-500/10 border-accent-500'
                        : 'bg-dark-700/50 border-dark-600 hover:border-dark-500'
                    }`}
                    disabled={isExporting}
                  >
                    <p className={`text-xl font-bold ${
                      selectedScale === scale.value ? 'text-accent-500' : 'text-white'
                    }`}>
                      {scale.label}
                    </p>
                    <p className="text-xs text-dark-400 mt-1">{scale.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'single' ? (
              <div className="bg-dark-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">草稿名称</span>
                  <span className="text-white">{currentState.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">原始尺寸</span>
                  <span className="text-white">{currentState.width} × {currentState.height}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">输出尺寸</span>
                  <span className="text-accent-500 font-mono">
                    {currentState.width * selectedScale} × {currentState.height * selectedScale}px
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">输出格式</span>
                  <div className="flex items-center gap-2 text-white">
                    <Image size={16} className="text-accent-500" />
                    <span>PNG</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-dark-600">
                  <span className="text-dark-400">文件名</span>
                  <span className="text-white font-mono text-xs break-all text-right max-w-[70%]">
                    {buildFilename(currentState.name, currentState.width, currentState.height, selectedScale)}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-dark-300">
                    选择要导出的草稿
                    <span className="text-accent-500 ml-2">({selectedIds.size} 已选)</span>
                  </label>
                  <button
                    onClick={toggleSelectAll}
                    disabled={isExporting}
                    className="text-xs text-accent-500 hover:text-accent-400 disabled:opacity-50"
                  >
                    {selectedIds.size === drafts.length + 1 ? '取消全选' : '全选'}
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedIds.has('__current__')
                        ? 'bg-accent-500/10 border-accent-500'
                        : 'bg-dark-700/50 border-dark-600 hover:border-dark-500'
                    } ${isExporting ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has('__current__')}
                      onChange={() => toggleSelect('__current__')}
                      className="w-4 h-4 accent-accent-500 rounded border-dark-500 bg-dark-800"
                    />
                    <div className="w-12 h-9 bg-dark-900 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <div className="bg-white" style={{
                        width: Math.min(currentState.width / 20, 40),
                        height: Math.min(currentState.height / 20, 30),
                      }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{currentState.name}（当前编辑中）</p>
                      <p className="text-xs text-dark-400">
                        {currentState.width} × {currentState.height} · {currentState.elements.length} 个元素
                      </p>
                    </div>
                  </label>

                  {drafts.map(d => (
                    <label
                      key={d.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedIds.has(d.id)
                          ? 'bg-accent-500/10 border-accent-500'
                          : 'bg-dark-700/50 border-dark-600 hover:border-dark-500'
                      } ${isExporting ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(d.id)}
                        onChange={() => toggleSelect(d.id)}
                        className="w-4 h-4 accent-accent-500 rounded border-dark-500 bg-dark-800"
                      />
                      <div className="w-12 h-9 bg-dark-900 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {d.thumbnail ? (
                          <img src={d.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-white" style={{
                            width: Math.min(d.width / 20, 40),
                            height: Math.min(d.height / 20, 30),
                          }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{d.name}</p>
                        <p className="text-xs text-dark-400">
                          {d.width} × {d.height}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {exportItems.length > 0 && (
                  <div className="bg-dark-900/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-400">导出进度</span>
                      <span className="text-white">
                        {doneCount} / {exportItems.length}
                        <span className="text-green-500 ml-2">成功 {successCount}</span>
                        {failCount > 0 && <span className="text-red-500 ml-2">失败 {failCount}</span>}
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-500 to-accent-400 transition-all duration-300"
                        style={{ width: `${exportItems.length ? (doneCount / exportItems.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1">
                      {exportItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-xs py-1">
                          {item.status === 'pending' && <div className="w-3 h-3 rounded-full bg-dark-600" />}
                          {item.status === 'exporting' && <Loader2 size={12} className="text-accent-500 animate-spin" />}
                          {item.status === 'success' && <CheckCircle size={12} className="text-green-500" />}
                          {item.status === 'failed' && <XCircle size={12} className="text-red-500" />}
                          <span className={`flex-1 truncate ${
                            item.status === 'failed' ? 'text-red-400' : 'text-dark-300'
                          }`}>
                            {item.name}
                          </span>
                          {item.error && <span className="text-red-400 text-[10px]">{item.error}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-dark-700 flex justify-end gap-3 flex-shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            取消
          </Button>
          {mode === 'single' ? (
            <Button
              variant="primary"
              icon={isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              onClick={handleSingleExport}
              disabled={isExporting}
            >
              {isExporting ? '导出中...' : '下载 PNG'}
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              onClick={runBatchExport}
              disabled={isExporting || selectedIds.size === 0}
            >
              {isExporting ? `导出中 ${doneCount}/${exportItems.length}` : `批量导出 (${selectedIds.size})`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
