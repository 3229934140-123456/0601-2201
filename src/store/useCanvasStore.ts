import { create } from 'zustand';
import type { CanvasState, CanvasElement, HistoryState } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

const createInitialState = (): CanvasState => ({
  id: generateId(),
  name: '未命名海报',
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  elements: [],
  selectedElementId: null,
  zoom: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

type AddElementInput = 
  | (Omit<import('@/types').TextElement, 'id' | 'zIndex' | 'name'>)
  | (Omit<import('@/types').ImageElement, 'id' | 'zIndex' | 'name'>)
  | (Omit<import('@/types').ShapeElement, 'id' | 'zIndex' | 'name'>);

interface CanvasStore extends CanvasState, HistoryState {
  _pushHistory: () => void;
  setCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  setBackground: (color: string) => void;
  setZoom: (zoom: number) => void;
  setName: (name: string) => void;
  setElements: (elements: CanvasElement[]) => void;
  selectElement: (id: string | null) => void;
  addElement: (element: AddElementInput) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  rotateElement: (id: string, rotation: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  applyTemplate: (template: Partial<CanvasState>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  loadState: (state: CanvasState) => void;
  getSelectedElement: () => CanvasElement | null;
  createVariant: () => CanvasState;
}

const MAX_HISTORY = 50;

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  ...createInitialState(),
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  _pushHistory: () => {
    const state = get();
    const newPast = [...state.past, {
      id: state.id,
      name: state.name,
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      elements: JSON.parse(JSON.stringify(state.elements)),
      selectedElementId: state.selectedElementId,
      zoom: state.zoom,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    }].slice(-MAX_HISTORY);
    set({
      past: newPast,
      future: [],
      canUndo: newPast.length > 0,
      canRedo: false,
    });
  },

  setCanvasSize: (width, height) => {
    get()._pushHistory();
    set({ width, height, updatedAt: Date.now() });
  },

  setBackgroundColor: (color) => {
    get()._pushHistory();
    set({ backgroundColor: color, updatedAt: Date.now() });
  },

  setBackground: (color) => {
    get()._pushHistory();
    set({ backgroundColor: color, updatedAt: Date.now() });
  },

  setElements: (elements) => {
    get()._pushHistory();
    set({ elements, updatedAt: Date.now() });
  },

  setZoom: (zoom) => set({ zoom }),

  setName: (name) => {
    get()._pushHistory();
    set({ name, updatedAt: Date.now() });
  },

  selectElement: (id) => set({ selectedElementId: id }),

  addElement: (element) => {
    get()._pushHistory();
    const state = get();
    const maxZIndex = state.elements.length > 0
      ? Math.max(...state.elements.map(e => e.zIndex))
      : 0;
    
    const elementNames: Record<string, string> = {
      text: '文本',
      image: '图片',
      shape: '形状',
      logo: 'Logo',
    };
    
    const newElement: CanvasElement = {
      ...element,
      id: generateId(),
      zIndex: maxZIndex + 1,
      name: `${elementNames[element.type]} ${state.elements.filter(e => e.type === element.type).length + 1}`,
    } as CanvasElement;
    
    set({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
      updatedAt: Date.now(),
    });
  },

  updateElement: (id, updates) => {
    get()._pushHistory();
    const state = get();
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, ...updates } as CanvasElement : el
      ),
      updatedAt: Date.now(),
    });
  },

  deleteElement: (id) => {
    get()._pushHistory();
    const state = get();
    set({
      elements: state.elements.filter(el => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      updatedAt: Date.now(),
    });
  },

  duplicateElement: (id) => {
    get()._pushHistory();
    const state = get();
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    const maxZIndex = Math.max(...state.elements.map(e => e.zIndex));
    const newElement: CanvasElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: maxZIndex + 1,
      name: `${element.name} 副本`,
    } as CanvasElement;

    set({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
      updatedAt: Date.now(),
    });
  },

  moveElement: (id, x, y) => {
    const state = get();
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, x, y } : el
      ),
    });
  },

  resizeElement: (id, width, height) => {
    const state = get();
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, width, height } : el
      ),
    });
  },

  rotateElement: (id, rotation) => {
    const state = get();
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, rotation } : el
      ),
    });
  },

  bringToFront: (id) => {
    get()._pushHistory();
    const state = get();
    const maxZIndex = Math.max(...state.elements.map(e => e.zIndex));
    const element = state.elements.find(el => el.id === id);
    if (!element || element.zIndex === maxZIndex) return;

    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
      ),
      updatedAt: Date.now(),
    });
  },

  sendToBack: (id) => {
    get()._pushHistory();
    const state = get();
    const minZIndex = Math.min(...state.elements.map(e => e.zIndex));
    const element = state.elements.find(el => el.id === id);
    if (!element || element.zIndex === minZIndex) return;

    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
      ),
      updatedAt: Date.now(),
    });
  },

  moveLayerUp: (id) => {
    get()._pushHistory();
    const state = get();
    const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sortedElements.findIndex(el => el.id === id);
    if (index === -1 || index >= sortedElements.length - 1) return;

    const currentElement = sortedElements[index];
    const nextElement = sortedElements[index + 1];

    set({
      elements: state.elements.map(el => {
        if (el.id === id) return { ...el, zIndex: nextElement.zIndex };
        if (el.id === nextElement.id) return { ...el, zIndex: currentElement.zIndex };
        return el;
      }),
      updatedAt: Date.now(),
    });
  },

  moveLayerDown: (id) => {
    get()._pushHistory();
    const state = get();
    const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sortedElements.findIndex(el => el.id === id);
    if (index <= 0) return;

    const currentElement = sortedElements[index];
    const prevElement = sortedElements[index - 1];

    set({
      elements: state.elements.map(el => {
        if (el.id === id) return { ...el, zIndex: prevElement.zIndex };
        if (el.id === prevElement.id) return { ...el, zIndex: currentElement.zIndex };
        return el;
      }),
      updatedAt: Date.now(),
    });
  },

  toggleLock: (id) => {
    get()._pushHistory();
    const state = get();
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    });
  },

  toggleVisibility: (id) => {
    get()._pushHistory();
    const state = get();
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, visible: !el.visible } : el
      ),
    });
  },

  reorderElements: (startIndex, endIndex) => {
    get()._pushHistory();
    const state = get();
    const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const [removed] = sortedElements.splice(startIndex, 1);
    sortedElements.splice(endIndex, 0, removed);

    const reorderedElements = sortedElements.map((el, idx) => ({
      ...el,
      zIndex: idx + 1,
    }));

    set({
      elements: state.elements.map(el => {
        const reordered = reorderedElements.find(r => r.id === el.id);
        return reordered ? { ...el, zIndex: reordered.zIndex } : el;
      }),
      updatedAt: Date.now(),
    });
  },

  applyTemplate: (template) => {
    get()._pushHistory();
    set({
      width: template.width || get().width,
      height: template.height || get().height,
      backgroundColor: template.backgroundColor || get().backgroundColor,
      elements: template.elements || [],
      selectedElementId: null,
      updatedAt: Date.now(),
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const newPast = [...state.past];
    const previous = newPast.pop()!;
    const newFuture = [{
      id: state.id,
      name: state.name,
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      elements: JSON.parse(JSON.stringify(state.elements)),
      selectedElementId: state.selectedElementId,
      zoom: state.zoom,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    }, ...state.future];

    set({
      ...previous,
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: newFuture.length > 0,
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const newFuture = [...state.future];
    const next = newFuture.shift()!;
    const newPast = [...state.past, {
      id: state.id,
      name: state.name,
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      elements: JSON.parse(JSON.stringify(state.elements)),
      selectedElementId: state.selectedElementId,
      zoom: state.zoom,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    }];

    set({
      ...next,
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: newFuture.length > 0,
    });
  },

  loadState: (loadedState) => {
    set({
      ...loadedState,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  getSelectedElement: () => {
    const state = get();
    return state.elements.find(el => el.id === state.selectedElementId) || null;
  },

  createVariant: () => {
    const state = get();
    const variant: CanvasState = {
      ...JSON.parse(JSON.stringify(state)),
      id: generateId(),
      name: `${state.name} 变体`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      elements: state.elements.map(el => ({
        ...el,
        id: generateId(),
      })),
    };
    return variant;
  },
}));
