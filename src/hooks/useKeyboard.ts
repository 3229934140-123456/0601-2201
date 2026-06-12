import { useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

export const useKeyboard = () => {
  const {
    selectedElementId,
    deleteElement,
    duplicateElement,
    undo,
    redo,
    canUndo,
    canRedo,
    bringToFront,
    sendToBack,
    toggleLock,
    toggleVisibility,
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedElementId) duplicateElement(selectedElementId);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === ']' && selectedElementId) {
        e.preventDefault();
        bringToFront(selectedElementId);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '[' && selectedElementId) {
        e.preventDefault();
        sendToBack(selectedElementId);
        return;
      }

      if (e.key === 'l' && selectedElementId) {
        e.preventDefault();
        toggleLock(selectedElementId);
        return;
      }

      if (e.key === 'h' && selectedElementId) {
        e.preventDefault();
        toggleVisibility(selectedElementId);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        useCanvasStore.getState().selectElement(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementId,
    deleteElement,
    duplicateElement,
    undo,
    redo,
    canUndo,
    canRedo,
    bringToFront,
    sendToBack,
    toggleLock,
    toggleVisibility,
  ]);
};
