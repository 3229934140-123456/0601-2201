import type { CanvasState, CanvasElement, TextElement, ImageElement, ShapeElement, BrandConfig } from '@/types';

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  } : null;
};

const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('linear-gradient')) return color;
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\(([^)]+)\)/, (_, inner) => {
      const parts = inner.split(',').map(s => s.trim());
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    });
  }
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  return color;
};

const replaceInGradient = (gradient: string, colors: string[]): string => {
  const hexRegex = /(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgba?\([^)]+\))/g;
  const matches = gradient.match(hexRegex);
  if (!matches || matches.length === 0) return gradient;
  let result = gradient;
  matches.forEach((m, idx) => {
    const replacement = colors[idx % colors.length];
    result = result.replace(m, replacement);
  });
  return result;
};

const pickColorForRole = (role: string, brand: BrandConfig, idx: number = 0): string => {
  const colors = brand.colors || [];
  if (colors.length === 0) return '#ffffff';

  switch (role) {
    case 'primary':
      return colors[0] || '#ffffff';
    case 'secondary':
      return colors[1] || colors[0] || '#ffffff';
    case 'accent':
      return colors[2] || colors[0] || '#ffffff';
    case 'background':
      return colors[0] || '#1e1b4b';
    default:
      return colors[idx % colors.length];
  }
};

const isLightColor = (color: string): boolean => {
  let r = 255, g = 255, b = 255;
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    if (rgb) { r = rgb.r; g = rgb.g; b = rgb.b; }
  } else if (color.startsWith('rgba')) {
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      r = parseInt(m[1], 10);
      g = parseInt(m[2], 10);
      b = parseInt(m[3], 10);
    }
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
};

export const applyBrandStyle = (
  state: CanvasState,
  brand: BrandConfig
): CanvasState => {
  const newElements: CanvasElement[] = state.elements.map((el, idx) => {
    const role = el.brandRole;
    const clone = JSON.parse(JSON.stringify(el)) as CanvasElement;

    if (!role) return clone;

    switch (clone.type) {
      case 'text': {
        const t = clone as TextElement;
        if (role === 'primary' || role === 'secondary' || role === 'accent') {
          const newColor = pickColorForRole(role, brand, idx);
          if (t.color.startsWith('rgba')) {
            t.color = withAlpha(newColor, parseFloat(t.color.split(',').pop()?.trim() || '1'));
          } else {
            t.color = newColor;
          }
          if (t.shadow) {
            t.shadow.color = isLightColor(newColor) ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.4)';
          }
        }
        return t;
      }

      case 'shape': {
        const s = clone as ShapeElement;
        const newColor = pickColorForRole(role, brand, idx);

        if (role === 'background') {
          if (s.fill.startsWith('linear-gradient')) {
            const bgColors = role === 'background'
              ? [
                  brand.colors[0] || '#1e1b4b',
                  brand.colors[1] || brand.colors[0] || '#f97316',
                ]
              : [newColor, newColor];
            s.fill = replaceInGradient(s.fill, bgColors);
          } else {
            s.fill = newColor;
          }
        } else {
          if (s.fill.startsWith('linear-gradient')) {
            s.fill = replaceInGradient(s.fill, [newColor, newColor]);
          } else if (s.fill.startsWith('rgba')) {
            const alpha = parseFloat(s.fill.split(',').pop()?.trim() || '1');
            s.fill = withAlpha(newColor, alpha);
          } else {
            s.fill = newColor;
          }
        }
        return s;
      }

      case 'image':
      case 'logo': {
        const img = clone as ImageElement;
        if (role === 'logo' && brand.logo) {
          img.src = brand.logo;
          img.type = 'logo';
        }
        return img;
      }

      default:
        return clone;
    }
  });

  return {
    ...state,
    elements: newElements,
  };
};
