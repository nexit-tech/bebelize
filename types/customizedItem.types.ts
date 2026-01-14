import { DiscoveredItem } from '@/lib/discovery/types';

export interface BrasaoMetadata {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayerMetadata {
  layerId: string;
  patternId: string;
  color?: string;
  scale?: number;
  opacity?: number;
  blendMode?: string;
}

export interface CustomizationData {
  layers: LayerMetadata[];
  brasao?: BrasaoMetadata;
}

export interface CustomizedItem extends DiscoveredItem {
  cartItemId: string;       
  item_id: string;          
  base_image_url?: string;  
  customization_data: CustomizationData;
  quantity: number;
  variant_id?: string | null;
}