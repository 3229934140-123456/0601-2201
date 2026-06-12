import { useEffect, useRef, useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { createThumbnail } from '@/utils/exporter';
import type { TextElement, ImageElement, ShapeElement, CanvasElement } from '@/types';
import Button from '@/components/common/Button';

interface MobilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobilePreview({ isOpen, onClose }: MobilePreviewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { elements, width, height, backgroundColor } = useCanvasStore();

  const visibleElements = elements.filter(el => el.visible);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const generatePreview = async () => {
        try {
          const dataUrl = await createThumbnail(canvasRef.current, 300);
          setPreviewImage(dataUrl);
        } catch (error) {
          console.error('Failed to generate preview:', error);
        }
      };
      generatePreview();
    }
  }, [isOpen, elements, width, height, backgroundColor]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative animate-bounce-in">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/80">
          <Smartphone size={20} />
          <span className="text-sm font-medium">手机端预览</span>
        </div>

        <div className="relative">
          <div className="w-80 bg-dark-900 rounded-[3rem] p-3 shadow-2xl border-4 border-dark-700">
            <div className="relative bg-dark-950 rounded-[2.5rem] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-dark-900 rounded-b-2xl z-10"></div>
              
              <div className="pt-8 pb-4 px-3">
                <div className="bg-white rounded-2xl overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                  <div className="p-3 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 w-12 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">加载中...</div>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                      <div className="flex gap-2 mt-3">
                        <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-dark-800/50 hover:bg-dark-700 text-white/80 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="absolute opacity-0 pointer-events-none" style={{ position: 'absolute', left: -9999, top: 0 }}>
          <div
            ref={canvasRef}
            className="relative"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              background: backgroundColor || '#ffffff',
            }}
          >
            {visibleElements.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  );
}
