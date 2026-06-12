import { useEffect, useRef, useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { createThumbnail } from '@/utils/exporter';
import Button from '@/components/common/Button';

interface MobilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobilePreview({ isOpen, onClose }: MobilePreviewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { elements, width, height, backgroundColor } = useCanvasStore();

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

        <div className="absolute opacity-0 pointer-events-none">
          <div
            ref={canvasRef}
            className="relative"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              background: backgroundColor || '#ffffff',
            }}
          >
            {elements.map((element) => (
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
      </div>
    </div>
  );
}
