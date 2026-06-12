import React from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { ColorPicker } from '@/components/common/ColorPicker';
import { Slider } from '@/components/common/Slider';
import { AlignLeft, AlignCenter, AlignRight, Bold } from 'lucide-react';
import type { TextElement, ImageElement, ShapeElement } from '@/types';

const fontFamilies = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
];

const fontWeights = [
  { value: 300, label: '细体' },
  { value: 400, label: '常规' },
  { value: 500, label: '中等' },
  { value: 600, label: '半粗' },
  { value: 700, label: '粗体' },
];

const objectFitOptions = [
  { value: 'cover', label: '覆盖' },
  { value: 'contain', label: '包含' },
  { value: 'fill', label: '拉伸' },
];

export const PropertyPanel: React.FC = () => {
  const { getSelectedElement, updateElement, backgroundColor, setBackgroundColor, width, height } = useCanvasStore();
  const selectedElement = getSelectedElement();

  if (!selectedElement) {
    return (
      <div className="p-4 space-y-4">
        <div className="panel-card">
          <h3 className="text-sm font-medium text-white mb-3">画布设置</h3>
          <div className="space-y-4">
            <ColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
              label="背景颜色"
            />
            <div>
              <label className="block text-xs text-dark-400 mb-1.5">尺寸</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => useCanvasStore.getState().setCanvasSize(Number(e.target.value), height)}
                    className="input-field"
                  />
                  <p className="text-[10px] text-dark-500 mt-1">宽度 (px)</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => useCanvasStore.getState().setCanvasSize(width, Number(e.target.value))}
                    className="input-field"
                  />
                  <p className="text-[10px] text-dark-500 mt-1">高度 (px)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 text-dark-400">
          <p className="text-sm">选择元素以编辑属性</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<any>) => {
    updateElement(selectedElement.id, updates);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="panel-card">
        <h3 className="text-sm font-medium text-white mb-3">位置与尺寸</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-dark-400 mb-1 block">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">宽度</label>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">高度</label>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
          <Slider
            value={selectedElement.rotation}
            min={-180}
            max={180}
            onChange={(value) => handleUpdate({ rotation: value })}
            unit="°"
          />
          <p className="text-[10px] text-dark-500">旋转角度</p>
        </div>
      </div>

      <div className="panel-card">
        <h3 className="text-sm font-medium text-white mb-3">外观</h3>
        <div className="space-y-3">
          <Slider
            value={selectedElement.opacity * 100}
            min={0}
            max={100}
            onChange={(value) => handleUpdate({ opacity: value / 100 })}
            unit="%"
          />
          <p className="text-[10px] text-dark-500">不透明度</p>
        </div>
      </div>

      {selectedElement.type === 'text' && (
        <TextProperties element={selectedElement as TextElement} onUpdate={handleUpdate} />
      )}

      {(selectedElement.type === 'image' || selectedElement.type === 'logo') && (
        <ImageProperties element={selectedElement as ImageElement} onUpdate={handleUpdate} />
      )}

      {selectedElement.type === 'shape' && (
        <ShapeProperties element={selectedElement as ShapeElement} onUpdate={handleUpdate} />
      )}

      <div className="panel-card">
        <h3 className="text-sm font-medium text-white mb-3">阴影</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedElement.shadow) {
                  handleUpdate({ shadow: undefined });
                } else {
                  handleUpdate({
                    shadow: { offsetX: 0, offsetY: 4, blur: 10, color: 'rgba(0,0,0,0.3)' },
                  });
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                selectedElement.shadow
                  ? 'bg-accent-500 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              {selectedElement.shadow ? '移除阴影' : '添加阴影'}
            </button>
          </div>
          {selectedElement.shadow && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">X偏移</label>
                  <input
                    type="number"
                    value={selectedElement.shadow.offsetX}
                    onChange={(e) =>
                      handleUpdate({
                        shadow: { ...selectedElement.shadow!, offsetX: Number(e.target.value) },
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Y偏移</label>
                  <input
                    type="number"
                    value={selectedElement.shadow.offsetY}
                    onChange={(e) =>
                      handleUpdate({
                        shadow: { ...selectedElement.shadow!, offsetY: Number(e.target.value) },
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
              <Slider
                value={selectedElement.shadow.blur}
                min={0}
                max={50}
                onChange={(value) =>
                  handleUpdate({ shadow: { ...selectedElement.shadow!, blur: value } })
                }
                unit="px"
              />
              <p className="text-[10px] text-dark-500">模糊半径</p>
              <ColorPicker
                value={selectedElement.shadow.color.startsWith('rgba') ? '#000000' : selectedElement.shadow.color}
                onChange={(color) =>
                  handleUpdate({ shadow: { ...selectedElement.shadow!, color } })
                }
                label="阴影颜色"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface TextPropertiesProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

const TextProperties: React.FC<TextPropertiesProps> = ({ element, onUpdate }) => {
  return (
    <div className="panel-card">
      <h3 className="text-sm font-medium text-white mb-3">文本属性</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-dark-400 mb-1 block">内容</label>
          <textarea
            value={element.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="input-field min-h-[80px] resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-dark-400 mb-1 block">字体</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="input-field"
          >
            {fontFamilies.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-dark-400 mb-1 block">字号</label>
            <input
              type="number"
              value={element.fontSize}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              className="input-field"
              min={8}
              max={200}
            />
          </div>
          <div>
            <label className="text-xs text-dark-400 mb-1 block">字重</label>
            <select
              value={element.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}
              className="input-field"
            >
              {fontWeights.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ColorPicker
          value={element.color}
          onChange={(color) => onUpdate({ color })}
          label="文字颜色"
        />
        <div>
          <label className="text-xs text-dark-400 mb-1.5 block">对齐方式</label>
          <div className="flex gap-1">
            {[
              { value: 'left', icon: <AlignLeft size={16} /> },
              { value: 'center', icon: <AlignCenter size={16} /> },
              { value: 'right', icon: <AlignRight size={16} /> },
            ].map((align) => (
              <button
                key={align.value}
                onClick={() => onUpdate({ textAlign: align.value as any })}
                className={`flex-1 p-2 rounded-lg transition-all ${
                  element.textAlign === align.value
                    ? 'bg-accent-500 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                {align.icon}
              </button>
            ))}
          </div>
        </div>
        <Slider
          value={element.lineHeight * 100}
          min={100}
          max={300}
          onChange={(value) => onUpdate({ lineHeight: value / 100 })}
          unit="%"
        />
        <p className="text-[10px] text-dark-500">行高</p>
        <Slider
          value={element.letterSpacing}
          min={-5}
          max={20}
          onChange={(value) => onUpdate({ letterSpacing: value })}
          unit="px"
        />
        <p className="text-[10px] text-dark-500">字间距</p>
      </div>
    </div>
  );
};

interface ImagePropertiesProps {
  element: ImageElement;
  onUpdate: (updates: Partial<ImageElement>) => void;
}

const ImageProperties: React.FC<ImagePropertiesProps> = ({ element, onUpdate }) => {
  return (
    <div className="panel-card">
      <h3 className="text-sm font-medium text-white mb-3">图片属性</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-dark-400 mb-1 block">填充方式</label>
          <select
            value={element.objectFit}
            onChange={(e) => onUpdate({ objectFit: e.target.value as any })}
            className="input-field"
          >
            {objectFitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Slider
          value={element.borderRadius}
          min={0}
          max={100}
          onChange={(value) => onUpdate({ borderRadius: value })}
          unit="px"
        />
        <p className="text-[10px] text-dark-500">圆角</p>
      </div>
    </div>
  );
};

interface ShapePropertiesProps {
  element: ShapeElement;
  onUpdate: (updates: Partial<ShapeElement>) => void;
}

const ShapeProperties: React.FC<ShapePropertiesProps> = ({ element, onUpdate }) => {
  return (
    <div className="panel-card">
      <h3 className="text-sm font-medium text-white mb-3">形状属性</h3>
      <div className="space-y-3">
        {!element.fill.startsWith('linear-gradient') && (
          <ColorPicker
            value={element.fill}
            onChange={(color) => onUpdate({ fill: color })}
            label="填充颜色"
          />
        )}
        <ColorPicker
          value={element.stroke}
          onChange={(color) => onUpdate({ stroke: color })}
          label="边框颜色"
        />
        <Slider
          value={element.strokeWidth}
          min={0}
          max={20}
          onChange={(value) => onUpdate({ strokeWidth: value })}
          unit="px"
        />
        <p className="text-[10px] text-dark-500">边框宽度</p>
        {element.shapeType === 'rectangle' && (
          <>
            <Slider
              value={element.borderRadius}
              min={0}
              max={100}
              onChange={(value) => onUpdate({ borderRadius: value })}
              unit="px"
            />
            <p className="text-[10px] text-dark-500">圆角</p>
          </>
        )}
      </div>
    </div>
  );
};
