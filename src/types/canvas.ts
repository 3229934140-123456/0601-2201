export interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface BaseElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'logo';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  name: string;
  shadow?: ShadowConfig;
  brandRole?: 'primary' | 'secondary' | 'accent' | 'logo' | 'background';
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageElement extends BaseElement {
  type: 'image' | 'logo';
  src: string;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;

export interface CanvasState {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  elements: CanvasElement[];
  selectedElementId: string | null;
  zoom: number;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryState {
  past: CanvasState[];
  future: CanvasState[];
}

export interface SizePreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  icon: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  canvasState: Partial<CanvasState>;
}

export interface MaterialItem {
  id: string;
  type: 'image' | 'shape' | 'icon';
  name: string;
  thumbnail: string;
  src?: string;
  category: string;
}

export interface BrandConfig {
  logo: string | null;
  colors: string[];
  fonts: string[];
}

export interface DraftVersion {
  id: string;
  state: CanvasState;
  savedAt: number;
  note?: string;
}

export interface DraftMeta {
  id: string;
  name: string;
  thumbnail: string;
  updatedAt: number;
  width: number;
  height: number;
  versions?: DraftVersion[];
}
