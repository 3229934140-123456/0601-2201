import React, { useRef } from 'react';
import type { CanvasElement as CanvasElementType, TextElement, ImageElement, ShapeElement } from '@/types';
import { cn } from '@/lib/utils';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, element: CanvasElementType) => void;
  onDoubleClick: (element: CanvasElementType) => void;
  readOnly?: boolean;
}

export const CanvasElementComponent: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  onMouseDown,
  onDoubleClick,
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!element.visible) return null;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x - element.width / 2,
    top: element.y - element.height / 2,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    cursor: element.locked || readOnly ? 'default' : 'move',
    zIndex: element.zIndex,
    pointerEvents: element.locked ? 'none' : 'auto',
  };

  const shadowStyle = element.shadow
    ? `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.color}`
    : 'none';

  const renderContent = () => {
    switch (element.type) {
      case 'text': {
        const textEl = element as TextElement;
        return (
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
        );
      }

      case 'image':
      case 'logo': {
        const imgEl = element as ImageElement;
        return (
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
        );
      }

      case 'shape': {
        const shapeEl = element as ShapeElement;
        
        if (shapeEl.fill.startsWith('linear-gradient')) {
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: shapeEl.fill,
                borderRadius: shapeEl.shapeType === 'circle' ? '50%' : shapeEl.borderRadius,
                border: shapeEl.strokeWidth > 0 ? `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}` : 'none',
                boxShadow: shadowStyle,
              }}
            />
          );
        }

        if (shapeEl.shapeType === 'triangle') {
          return (
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
          );
        }

        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: shapeEl.fill,
              borderRadius: shapeEl.shapeType === 'circle' ? '50%' : shapeEl.borderRadius,
              border: shapeEl.strokeWidth > 0 ? `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}` : 'none',
              boxShadow: shadowStyle,
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      style={baseStyle}
      className={cn(
        'transition-shadow duration-150',
        isSelected && !readOnly && 'ring-2 ring-accent-500 ring-offset-1 ring-offset-transparent'
      )}
      onMouseDown={(e) => !readOnly && onMouseDown(e, element)}
      onDoubleClick={() => !readOnly && onDoubleClick(element)}
    >
      {renderContent()}
    </div>
  );
};
