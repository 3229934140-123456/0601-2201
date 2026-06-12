import React from 'react';
import type { CanvasElement } from '@/types';

interface ElementControlsProps {
  element: CanvasElement;
  onResize: (corner: string, e: React.MouseEvent) => void;
  onRotate: (e: React.MouseEvent) => void;
  zoom: number;
}

const corners = [
  { id: 'nw', cursor: 'nw-resize', position: { top: -6, left: -6 } },
  { id: 'ne', cursor: 'ne-resize', position: { top: -6, right: -6 } },
  { id: 'sw', cursor: 'sw-resize', position: { bottom: -6, left: -6 } },
  { id: 'se', cursor: 'se-resize', position: { bottom: -6, right: -6 } },
  { id: 'n', cursor: 'n-resize', position: { top: -6, left: '50%', transform: 'translateX(-50%)' } },
  { id: 's', cursor: 's-resize', position: { bottom: -6, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'w', cursor: 'w-resize', position: { top: '50%', left: -6, transform: 'translateY(-50%)' } },
  { id: 'e', cursor: 'e-resize', position: { top: '50%', right: -6, transform: 'translateY(-50%)' } },
];

export const ElementControls: React.FC<ElementControlsProps> = ({
  element,
  onResize,
  onRotate,
  zoom,
}) => {
  const handleSize = 12 / zoom;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x - element.width / 2,
    top: element.y - element.height / 2,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: 10000,
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      <div
        className="absolute inset-0 border-2 border-accent-500 pointer-events-none"
        style={{ boxShadow: '0 0 0 1px rgba(249, 115, 22, 0.3)' }}
      />

      {corners.map((corner) => (
        <div
          key={corner.id}
          className="absolute bg-white border-2 border-accent-500 rounded-full pointer-events-auto cursor-pointer hover:bg-accent-500 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            cursor: corner.cursor,
            ...corner.position,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResize(corner.id, e);
          }}
        />
      ))}

      <div
        className="absolute pointer-events-auto"
        style={{
          top: -30 / zoom,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className="w-px h-5 bg-accent-500 mx-auto" />
        <div
          className="w-5 h-5 bg-accent-500 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center"
          style={{ width: 20 / zoom, height: 20 / zoom }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onRotate(e);
          }}
        >
          <svg width={12 / zoom} height={12 / zoom} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
