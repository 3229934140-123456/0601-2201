import type { MaterialItem } from '@/types';

export const shapeMaterials: MaterialItem[] = [
  { id: 'shape-rect', type: 'shape', name: '矩形', thumbnail: 'rect', category: '基础形状' },
  { id: 'shape-circle', type: 'shape', name: '圆形', thumbnail: 'circle', category: '基础形状' },
  { id: 'shape-triangle', type: 'shape', name: '三角形', thumbnail: 'triangle', category: '基础形状' },
];

export const backgroundImages: MaterialItem[] = [
  {
    id: 'bg-1',
    type: 'image',
    name: '渐变蓝紫',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20gradient%20blue%20purple%20smooth%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20gradient%20blue%20purple%20smooth%20background&image_size=square',
    category: '渐变背景',
  },
  {
    id: 'bg-2',
    type: 'image',
    name: '暖橙渐变',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20orange%20gradient%20sunset%20smooth%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20orange%20gradient%20sunset%20smooth%20background&image_size=square',
    category: '渐变背景',
  },
  {
    id: 'bg-3',
    type: 'image',
    name: '森林绿意',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forest%20green%20gradient%20nature%20smooth%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forest%20green%20gradient%20nature%20smooth%20background&image_size=square',
    category: '渐变背景',
  },
  {
    id: 'bg-4',
    type: 'image',
    name: '星空夜空',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=night%20sky%20stars%20dark%20blue%20gradient%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=night%20sky%20stars%20dark%20blue%20gradient%20background&image_size=square',
    category: '渐变背景',
  },
  {
    id: 'bg-5',
    type: 'image',
    name: '樱花粉红',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossom%20pink%20soft%20gradient%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossom%20pink%20soft%20gradient%20background&image_size=square',
    category: '渐变背景',
  },
  {
    id: 'bg-6',
    type: 'image',
    name: '商务深蓝',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=corporate%20dark%20blue%20professional%20gradient%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=corporate%20dark%20blue%20professional%20gradient%20background&image_size=square',
    category: '渐变背景',
  },
];

export const decorationImages: MaterialItem[] = [
  {
    id: 'deco-1',
    type: 'image',
    name: '几何抽象',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=geometric%20abstract%20shapes%20modern%20minimal%20transparent%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=geometric%20abstract%20shapes%20modern%20minimal%20transparent%20background&image_size=square',
    category: '装饰元素',
  },
  {
    id: 'deco-2',
    type: 'image',
    name: '流体艺术',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fluid%20art%20abstract%20colorful%20waves%20transparent%20background&image_size=square',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fluid%20art%20abstract%20colorful%20waves%20transparent%20background&image_size=square',
    category: '装饰元素',
  },
];

export const allMaterials = [...shapeMaterials, ...backgroundImages, ...decorationImages];
