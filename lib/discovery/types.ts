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
  layers: DiscoveredLayer[];
}

export interface BucketStructure {
  collection_slug: string;
  items: DiscoveredItem[];
}

export interface ScanResult {
  success: boolean;
  collections: BucketStructure[];
  total_items: number;
  total_layers: number;
  scanned_at: string;
  error?: string;
}