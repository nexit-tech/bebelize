export interface Pattern {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[] | null;
  scale: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Layer {
  index: number;
  file: string;
  url: string;
  type: 'fixed' | 'pattern';
  zone?: string;
  description?: string;
}

export interface OverlayState {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface LayerCustomization {
  layer_index: number;
  pattern_id: string;
  pattern_url: string;
  pattern_name: string;
  layerId?: string;
  type?: 'color' | 'pattern';
  color?: string;
}

export interface ItemMetadata {
  item_id: string;
  item_name: string;
  layers: Layer[];
}

export interface RenderRequest {
  item_id: string;
  collection_id: string;
  variant_id?: string | null;
  customizations: LayerCustomization[];
  layers?: Layer[];
  overlay?: OverlayState | null;
}

export interface RenderResponse {
  success: boolean;
  preview_url: string;
  technical_plant_url: string;
  render_time_ms: number;
  error?: string;
}

export interface CompositionResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

export interface ItemWithLayers {
  id: string;
  collection_id: string;
  name: string;
  description: string | null;
  code: string;
  layers_metadata: ItemMetadata | null;
}