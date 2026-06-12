import html2canvas from 'html2canvas';
import type { CanvasState, CanvasElement, TextElement, ImageElement, ShapeElement } from '@/types';

export const exportToPNG = async (
  canvasElement: HTMLElement,
  scaleOrState: number | CanvasState = 2,
  scale?: number
): Promise<string> => {
  try {
    let actualScale = 2;
    let backgroundColor = '#ffffff';
    let width = canvasElement.offsetWidth;
    let height = canvasElement.offsetHeight;

    if (typeof scaleOrState === 'number') {
      actualScale = scaleOrState;
    } else {
      actualScale = scale ?? 2;
      backgroundColor = scaleOrState.backgroundColor;
      width = scaleOrState.width;
      height = scaleOrState.height;
    }

    const canvas = await html2canvas(canvasElement, {
      scale: actualScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      width,
      height,
    });

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Failed to export PNG:', e);
    throw e;
  }
};

export const renderStateToElement = (state: CanvasState): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-99999px';
  container.style.top = '-99999px';
  container.style.width = `${state.width}px`;
  container.style.height = `${state.height}px`;
  container.style.background = state.backgroundColor || '#ffffff';
  container.style.transformOrigin = 'top left';

  const sortedElements = [...state.elements].filter(e => e.visible).sort((a, b) => a.zIndex - b.zIndex);

  sortedElements.forEach(element => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${element.x - element.width / 2}px`;
    wrapper.style.top = `${element.y - element.height / 2}px`;
    wrapper.style.width = `${element.width}px`;
    wrapper.style.height = `${element.height}px`;
    wrapper.style.transform = `rotate(${element.rotation}deg)`;
    wrapper.style.opacity = String(element.opacity);
    wrapper.style.zIndex = String(element.zIndex);
    wrapper.style.overflow = 'hidden';

    const shadowStyle = element.shadow
      ? `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.color}`
      : 'none';

    if (element.type === 'text') {
      const textEl = element as TextElement;
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = textEl.textAlign === 'center'
        ? 'center'
        : textEl.textAlign === 'right' ? 'flex-end' : 'flex-start';
      wrapper.style.fontSize = `${textEl.fontSize}px`;
      wrapper.style.fontFamily = textEl.fontFamily;
      wrapper.style.fontWeight = String(textEl.fontWeight);
      wrapper.style.color = textEl.color;
      wrapper.style.textAlign = textEl.textAlign;
      wrapper.style.lineHeight = String(textEl.lineHeight);
      wrapper.style.letterSpacing = `${textEl.letterSpacing}px`;
      wrapper.style.whiteSpace = 'pre-wrap';
      wrapper.style.wordBreak = 'break-word';
      if (shadowStyle !== 'none') wrapper.style.textShadow = shadowStyle;
      wrapper.textContent = textEl.content;
    } else if (element.type === 'image' || element.type === 'logo') {
      const imgEl = element as ImageElement;
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.borderRadius = `${imgEl.borderRadius}px`;
      inner.style.overflow = 'hidden';
      inner.style.boxShadow = shadowStyle;
      const img = document.createElement('img');
      img.src = imgEl.src;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = imgEl.objectFit;
      img.crossOrigin = 'anonymous';
      inner.appendChild(img);
      wrapper.appendChild(inner);
    } else if (element.type === 'shape') {
      const shapeEl = element as ShapeElement;
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.boxShadow = shadowStyle;

      if (shapeEl.shapeType === 'triangle') {
        wrapper.style.width = '0';
        wrapper.style.height = '0';
        wrapper.style.borderLeft = `${shapeEl.width / 2}px solid transparent`;
        wrapper.style.borderRight = `${shapeEl.width / 2}px solid transparent`;
        wrapper.style.borderBottom = `${shapeEl.height}px solid ${shapeEl.fill}`;
        if (shadowStyle !== 'none') wrapper.style.filter = `drop-shadow(${shadowStyle})`;
      } else {
        const isGradient = shapeEl.fill.startsWith('linear-gradient');
        if (isGradient) {
          inner.style.background = shapeEl.fill;
        } else {
          inner.style.backgroundColor = shapeEl.fill;
        }
        inner.style.borderRadius = shapeEl.shapeType === 'circle' ? '50%' : `${shapeEl.borderRadius}px`;
        if (shapeEl.strokeWidth > 0) {
          inner.style.border = `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}`;
        }
        wrapper.appendChild(inner);
      }
    }

    container.appendChild(wrapper);
  });

  return container;
};

export const exportStateToPNG = async (state: CanvasState, scale: number = 2): Promise<string> => {
  const element = renderStateToElement(state);
  document.body.appendChild(element);

  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: state.backgroundColor,
      width: state.width,
      height: state.height,
    });
    return canvas.toDataURL('image/png');
  } finally {
    document.body.removeChild(element);
  }
};

export const downloadPNG = (dataUrl: string, filename: string = 'poster.png'): void => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export const createThumbnail = async (
  canvasElement: HTMLElement,
  size: number = 200
): Promise<string> => {
  try {
    const canvas = await html2canvas(canvasElement, {
      scale: size / Math.max(canvasElement.offsetWidth, canvasElement.offsetHeight),
      useCORS: true,
      allowTaint: true,
    });

    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (e) {
    console.error('Failed to create thumbnail:', e);
    return '';
  }
};

