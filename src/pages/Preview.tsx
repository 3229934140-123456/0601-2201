import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Smartphone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseShareLink } from '@/utils/storage';
import { exportToPNG } from '@/utils/exporter';
import Button from '@/components/common/Button';
import MobilePreview from '@/components/toolbar/MobilePreview';
import type { CanvasElement } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';

interface PreviewData {
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  elements: CanvasElement[];
}

export default function Preview() {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setCanvasSize, setElements, setBackgroundColor, setName } = useCanvasStore();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setError('无效的分享链接');
      setLoading(false);
      return;
    }

    try {
      const data = parseShareLink(hash);
      if (data) {
        setPreviewData(data);
        setCanvasSize(data.width, data.height);
        setElements(data.elements);
        setBackgroundColor(data.backgroundColor);
        setName(data.name);
      } else {
        setError('无法解析分享数据');
      }
    } catch (e) {
      setError('解析分享链接失败');
    }
    setLoading(false);
  }, [setCanvasSize, setElements, setBackgroundColor, setName]);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await exportToPNG(canvasRef.current, 2);
      const link = document.createElement('a');
      link.download = `${previewData?.name || 'poster'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert('导出失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{error || '加载失败'}</h2>
          <p className="text-dark-400 mb-6">分享链接可能已过期或无效</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const scale = Math.min(
    (window.innerWidth - 80) / previewData.width,
    (window.innerHeight - 200) / previewData.height,
    1
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-950">
      <header className="h-14 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-dark-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-white font-medium text-sm">{previewData.name}</h1>
            <p className="text-dark-500 text-xs">
              {previewData.width} × {previewData.height} · 只读预览
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Smartphone size={16} />}
            onClick={() => setShowMobilePreview(true)}
          >
            手机预览
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExport}
          >
            导出 PNG
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center overflow-auto p-8">
        <div
          className="relative shadow-2xl animate-bounce-in"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center',
          }}
        >
          <div
            ref={canvasRef}
            className="relative"
            style={{
              width: `${previewData.width}px`,
              height: `${previewData.height}px`,
              background: previewData.backgroundColor || '#ffffff',
            }}
          >
            {previewData.elements.map((element) => (
              <div
                key={element.id}
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: `rotate(${element.rotation || 0}deg)`,
                  opacity: element.opacity ?? 1,
                }}
              >
                {element.type === 'text' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      fontFamily: element.fontFamily || 'Inter',
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight || 400,
                      color: element.color || '#000000',
                      textAlign: element.textAlign || 'left',
                      lineHeight: element.lineHeight || 1.5,
                      letterSpacing: `${element.letterSpacing || 0}px`,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      display: 'flex',
                      alignItems: 'center',
                      textShadow: element.shadow ? `2px 2px 4px rgba(0,0,0,0.3)` : 'none',
                    }}
                  >
                    {element.content}
                  </div>
                )}
                {element.type === 'image' && (
                  <img
                    src={element.src}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: element.objectFit || 'cover',
                      borderRadius: `${element.borderRadius || 0}px`,
                    }}
                  />
                )}
                {element.type === 'shape' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: element.fill || '#3b82f6',
                      borderRadius: element.shapeType === 'circle' ? '50%' : `${element.borderRadius || 0}px`,
                      border: element.stroke ? `${element.strokeWidth || 2}px solid ${element.stroke}` : 'none',
                      clipPath: element.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="h-10 bg-dark-900 border-t border-dark-700 flex items-center justify-center">
        <p className="text-dark-500 text-xs">
          由 Poster Studio 生成 · <button onClick={() => navigate('/')} className="text-accent-500 hover:underline">立即创建</button>
        </p>
      </footer>

      <MobilePreview
        isOpen={showMobilePreview}
        onClose={() => setShowMobilePreview(false)}
      />
    </div>
  );
}
