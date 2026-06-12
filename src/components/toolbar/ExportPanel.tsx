import React, { useState, useRef } from 'react';
import { X, Download, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useCanvasStore } from '@/store/useCanvasStore';
import { exportToPNG, downloadPNG } from '@/utils/exporter';

interface ExportPanelProps {
  onClose: () => void;
}

const exportScales = [
  { value: 1, label: '1x', description: '标准质量' },
  { value: 2, label: '2x', description: '高清 (推荐)' },
  { value: 3, label: '3x', description: '超高清' },
];

export const ExportPanel: React.FC<ExportPanelProps> = ({ onClose }) => {
  const { name, width, height } = useCanvasStore();
  const [selectedScale, setSelectedScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
      if (!canvasElement) {
        throw new Error('找不到画布元素');
      }

      const state = useCanvasStore.getState();
      const dataUrl = await exportToPNG(canvasElement, state, selectedScale);
      downloadPNG(dataUrl, `${name.replace(/\s+/g, '-')}-${width}x${height}@${selectedScale}x.png`);
      onClose();
    } catch (e) {
      console.error('导出失败:', e);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-800 rounded-2xl w-full max-w-lg border border-dark-700 overflow-hidden animate-bounce-in">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-white">导出海报</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-dark-300 mb-3">导出尺寸</label>
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
                >
                  <p className={`text-xl font-bold ${
                    selectedScale === scale.value ? 'text-accent-500' : 'text-white'
                  }`}>
                    {scale.label}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">{scale.description}</p>
                  <p className="text-[10px] text-dark-500 mt-2">
                    {width * scale.value} × {height * scale.value}px
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">输出格式</span>
              <div className="flex items-center gap-2 text-white">
                <Image size={16} className="text-accent-500" />
                <span>PNG</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-dark-400">文件名</span>
              <span className="text-white font-mono text-xs">
                {name.replace(/\s+/g, '-')}-{width}x{height}@{selectedScale}x.png
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              icon={isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? '导出中...' : '下载 PNG'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
