export interface DiscoveredLayer {
  index: number;
  file: string;
  url: string;
  type: 'pattern';
}

export interface DiscoveredItem {
  id: string;
  slug: string;
  name: string;
  collection_id: string;
  collection_slug: string;
  folder_path: string;
  item_type: 'simple' | 'composite';
  image_url?: string;
  layers: DiscoveredLayer[];
  description?: string;
}

export interface DiscoveredCollection {
  id: string;
  slug: string;
  name: string;
  description: string;
  item_count: number;
  items: DiscoveredItem[];
}

export interface DiscoveredPattern {
  id: string;
  name: string;
  slug: string;
  file: string;
  url: string;
  thumbnail_url: string;
}

export interface ScanResult {
  success: boolean;
  collections: DiscoveredCollection[];
  patterns: DiscoveredPattern[];
  total_items: number;
  total_layers: number;
  scanned_at: string;
  error?: string;
}