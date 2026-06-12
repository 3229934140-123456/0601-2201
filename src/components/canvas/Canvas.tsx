import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { CanvasElementComponent } from './CanvasElement';
import { ElementControls } from './ElementControls';
import type { CanvasElement as CanvasElementType } from '@/types';

interface CanvasProps {
  readOnly?: boolean;
}

type DragState = {
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  element: CanvasElementType | null;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
  startWidth: number;
  startHeight: number;
  startRotation: number;
  resizeCorner: string;
};

const initialDragState: DragState = {
  isDragging: false,
  isResizing: false,
  isRotating: false,
  element: null,
  startX: 0,
  startY: 0,
  startElementX: 0,
  startElementY: 0,
  startWidth: 0,
  startHeight: 0,
  startRotation: 0,
  resizeCorner: '',
};

export const Canvas: React.FC<CanvasProps> = ({ readOnly = false }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const {
    width,
    height,
    backgroundColor,
    elements,
    selectedElementId,
    zoom,
    selectElement,
    moveElement,
    resizeElement,
    rotateElement,
    updateElement,
  } = useCanvasStore();

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const selectedElement = elements.find((e) => e.id === selectedElementId) || null;

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      };
    },
    [zoom]
  );

  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElementType) => {
    if (readOnly || element.locked) return;
    e.stopPropagation();
    
    selectElement(element.id);
    
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragState({
      ...initialDragState,
      isDragging: true,
      element,
      startX: x,
      startY: y,
      startElementX: element.x,
      startElementY: element.y,
    });
  };

  const handleElementDoubleClick = (element: CanvasElementType) => {
    if (readOnly || element.locked) return;
    if (element.type === 'text') {
      setEditingElement(element.id);
      setEditText((element as any).content);
    }
  };

  const handleResize = (corner: string, e: React.MouseEvent) => {
    if (!selectedElement || readOnly) return;
    e.stopPropagation();
    
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragState({
      ...initialDragState,
      isResizing: true,
      element: selectedElement,
      startX: x,
      startY: y,
      startElementX: selectedElement.x,
      startElementY: selectedElement.y,
      startWidth: selectedElement.width,
      startHeight: selectedElement.height,
      resizeCorner: corner,
    });
  };

  const handleRotate = (e: React.MouseEvent) => {
    if (!selectedElement || readOnly) return;
    e.stopPropagation();
    
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragState({
      ...initialDragState,
      isRotating: true,
      element: selectedElement,
      startX: x,
      startY: y,
      startRotation: selectedElement.rotation,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.element || (!dragState.isDragging && !dragState.isResizing && !dragState.isRotating)) return;

      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const deltaX = x - dragState.startX;
      const deltaY = y - dragState.startY;

      if (dragState.isDragging) {
        moveElement(
          dragState.element.id,
          dragState.startElementX + deltaX,
          dragState.startElementY + deltaY
        );
      }

      if (dragState.isResizing) {
        const angle = (dragState.element.rotation * Math.PI) / 180;
        const cos = Math.cos(-angle);
        const sin = Math.sin(-angle);
        const rotatedDeltaX = deltaX * cos - deltaY * sin;
        const rotatedDeltaY = deltaX * sin + deltaY * cos;

        let newWidth = dragState.startWidth;
        let newHeight = dragState.startHeight;
        let newX = dragState.startElementX;
        let newY = dragState.startElementY;

        const corner = dragState.resizeCorner;

        if (corner.includes('e')) {
          newWidth = Math.max(20, dragState.startWidth + rotatedDeltaX * 2);
        }
        if (corner.includes('w')) {
          newWidth = Math.max(20, dragState.startWidth - rotatedDeltaX * 2);
          newX = dragState.startElementX + (dragState.startWidth - newWidth) / 2;
        }
        if (corner.includes('s')) {
          newHeight = Math.max(20, dragState.startHeight + rotatedDeltaY * 2);
        }
        if (corner.includes('n')) {
          newHeight = Math.max(20, dragState.startHeight - rotatedDeltaY * 2);
          newY = dragState.startElementY + (dragState.startHeight - newHeight) / 2;
        }

        resizeElement(dragState.element.id, newWidth, newHeight);
        if (corner.includes('w') || corner.includes('n')) {
          moveElement(dragState.element.id, newX, newY);
        }
      }

      if (dragState.isRotating) {
        const centerX = dragState.startElementX;
        const centerY = dragState.startElementY;
        const startAngle = Math.atan2(dragState.startY - centerY, dragState.startX - centerX);
        const currentAngle = Math.atan2(y - centerY, x - centerX);
        const angleDelta = ((currentAngle - startAngle) * 180) / Math.PI;
        let newRotation = dragState.startRotation + angleDelta;
        
        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        
        rotateElement(dragState.element.id, newRotation);
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging || dragState.isResizing || dragState.isRotating) {
        setDragState(initialDragState);
      }
    };

    if (dragState.isDragging || dragState.isResizing || dragState.isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, getCanvasCoords, moveElement, resizeElement, rotateElement]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (editingElement) {
      updateElement(editingElement, { content: editText } as any);
      setEditingElement(null);
      return;
    }
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'true') {
      selectElement(null);
    }
  };

  const handleTextBlur = () => {
    if (editingElement) {
      updateElement(editingElement, { content: editText } as any);
      setEditingElement(null);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingElement(null);
    }
  };

  const canvasStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor,
    position: 'relative',
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
  };

  return (
    <div className="flex-1 flex items-center justify-center canvas-grid-bg overflow-auto p-8">
      <div
        ref={canvasRef}
        style={canvasStyle}
        onClick={handleCanvasClick}
        data-canvas="true"
        className="relative flex-shrink-0 animate-fade-in"
      >
        {sortedElements.map((element) => (
          <div key={element.id}>
            <CanvasElementComponent
              element={element}
              isSelected={selectedElementId === element.id && editingElement !== element.id}
              onMouseDown={handleElementMouseDown}
              onDoubleClick={handleElementDoubleClick}
              readOnly={readOnly}
            />
            {editingElement === element.id && element.type === 'text' && (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                autoFocus
                style={{
                  position: 'absolute',
                  left: element.x - element.width / 2,
                  top: element.y - element.height / 2,
                  width: element.width,
                  height: element.height,
                  transform: `rotate(${element.rotation}deg)`,
                  opacity: element.opacity,
                  zIndex: element.zIndex + 1000,
                  fontSize: (element as any).fontSize,
                  fontFamily: (element as any).fontFamily,
                  fontWeight: (element as any).fontWeight,
                  color: (element as any).color,
                  textAlign: (element as any).textAlign,
                  lineHeight: (element as any).lineHeight,
                  letterSpacing: (element as any).letterSpacing,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '2px solid #f97316',
                  borderRadius: '4px',
                  outline: 'none',
                  resize: 'none',
                  padding: '4px',
                }}
              />
            )}
          </div>
        ))}

        {selectedElement && !readOnly && !editingElement && !selectedElement.locked && (
          <ElementControls
            element={selectedElement}
            onResize={handleResize}
            onRotate={handleRotate}
            zoom={zoom}
          />
        )}
      </div>
    </div>
  );
};
