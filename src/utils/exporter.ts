import html2canvas from 'html2canvas';
import type { CanvasState } from '@/types';

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
