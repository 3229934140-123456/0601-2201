import { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { saveDraft } from '@/utils/storage';

export const useAutoSave = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { elements, name, width, height, backgroundColor, id, updatedAt } = useCanvasStore();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const state = useCanvasStore.getState();
      saveDraft({
        id: state.id,
        name: state.name,
        width: state.width,
        height: state.height,
        backgroundColor: state.backgroundColor,
        elements: state.elements,
        selectedElementId: state.selectedElementId,
        zoom: state.zoom,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      });
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [elements, name, width, height, backgroundColor, id, updatedAt]);
};
