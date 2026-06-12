import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Palette } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useBrandStore } from '@/store/useBrandStore';
import { Button } from '@/components/common/Button';
import { ColorPicker } from '@/components/common/ColorPicker';

export const UploadPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { addElement } = useCanvasStore();
  const { logo, setLogo, addColor, colors } = useBrandStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const maxSize = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width / height) * maxSize;
          height = maxSize;
        }

        addElement({
          type: 'image',
          x: 540,
          y: 540,
          width,
          height,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          src,
          objectFit: 'contain',
          borderRadius: 0,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setLogo(src);
    };
    reader.readAsDataURL(file);
  };

  const handleAddLogo = () => {
    if (!logo) return;
    
    addElement({
      type: 'logo',
      x: 540,
      y: 540,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      src: logo,
      objectFit: 'contain',
      borderRadius: 0,
    });
  };

  const handleAddBrandColor = (color: string) => {
    addColor(color);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="panel-card">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <ImageIcon size={16} className="text-accent-500" />
          上传图片
        </h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="secondary"
          className="w-full"
          icon={<Upload size={16} />}
          onClick={() => fileInputRef.current?.click()}
        >
          选择图片上传
        </Button>
        <p className="mt-2 text-xs text-dark-400 text-center">
          支持 JPG、PNG、WebP 格式
        </p>
      </div>

      <div className="panel-card">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <ImageIcon size={16} className="text-accent-500" />
          品牌 Logo
        </h3>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
        {logo ? (
          <div className="space-y-3">
            <div className="w-full h-24 bg-dark-900 rounded-lg flex items-center justify-center overflow-hidden border border-dark-600">
              <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => logoInputRef.current?.click()}
              >
                更换
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleAddLogo}
              >
                添加到画布
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            icon={<Upload size={16} />}
            onClick={() => logoInputRef.current?.click()}
          >
            上传品牌 Logo
          </Button>
        )}
      </div>

      <div className="panel-card">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Palette size={16} className="text-accent-500" />
          品牌色板
        </h3>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {colors.map((color, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-lg border-2 border-dark-600 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <ColorPicker
          value={colors[0] || '#1e1b4b'}
          onChange={handleAddBrandColor}
          label="添加品牌色"
        />
      </div>
    </div>
  );
};
