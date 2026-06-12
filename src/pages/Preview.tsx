import { useState, useEffect, useRef } from 'react';
import { Download, Smartphone, X, Loader2 } from 'lucide-react';
import { parseShareLink } from '@/utils/storage';
import { exportStateToPNG, downloadPNG } from '@/utils/exporter';
import Button from '@/components/common/Button';
import MobilePreview from '@/components/toolbar/MobilePreview';
import type { CanvasElement, TextElement, ImageElement, ShapeElement } from '@/types';

interface PreviewData {
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  elements: CanvasElement[];
}

export default function Preview() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        setError('无效的分享链接');
        setLoading(false);
        return;
      }

      const data = parseShareLink(hash);
      if (data) {
        setPreviewData(data);
      } else {
        setError('无法解析分享数据');
      }
    } catch (e) {
      console.error('Parse error:', e);
      setError('解析分享链接失败');
    }
    setLoading(false);
  }, []);

  const handleExport = async () => {
    if (!previewData) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportStateToPNG({
        ...previewData,
        id: 'preview',
        createdAt: 0,
        updatedAt: 0,
        selectedElementId: null,
        zoom: 1,
      } as any, 2);
      const safeName = previewData.name?.replace(/[\\/:*?"<>|\s]/g, '-') || 'poster';
      downloadPNG(dataUrl, `${safeName}-${previewData.width}x${previewData.height}@2x.png`);
    } catch (e) {
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const renderElement = (element: CanvasElement) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x - element.width / 2,
      top: element.y - element.height / 2,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      zIndex: element.zIndex,
    };

    const shadowStyle = element.shadow
      ? `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.color}`
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
                fontSize: textEl.fontSize,
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
                userSelect: 'none',
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
                borderRadius: imgEl.borderRadius,
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
                  userSelect: 'none',
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
                  borderLeft: `${shapeEl.width / 2}px solid transparent`,
                  borderRight: `${shapeEl.width / 2}px solid transparent`,
                  borderBottom: `${shapeEl.height}px solid ${shapeEl.fill}`,
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
                borderRadius: shapeEl.shapeType === 'circle' ? '50%' : shapeEl.borderRadius,
                border: shapeEl.strokeWidth > 0 ? `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}` : 'none',
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
          <p className="text-dark-400">分享链接可能已过期或无效</p>
        </div>
      </div>
    );
  }

  const visibleElements = previewData.elements.filter(el => el.visible);
  const scale = Math.min(
    (window.innerWidth - 80) / previewData.width,
    (window.innerHeight - 200) / previewData.height,
    1
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-950">
      <header className="h-14 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
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
            icon={isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '导出中...' : '导出 PNG'}
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
            className="relative"
            style={{
              width: `${previewData.width}px`,
              height: `${previewData.height}px`,
              background: previewData.backgroundColor || '#ffffff',
            }}
          >
            {visibleElements.map(renderElement)}
          </div>
        </div>
      </main>

      <footer className="h-10 bg-dark-900 border-t border-dark-700 flex items-center justify-center">
        <p className="text-dark-500 text-xs">
          由 Poster Studio 生成 · 只读预览模式
        </p>
      </footer>

      <MobilePreview
        isOpen={showMobilePreview}
        onClose={() => setShowMobilePreview(false)}
      />
    </div>
  );
}
