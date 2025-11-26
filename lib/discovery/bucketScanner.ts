import { supabase } from '@/lib/supabase/client';
import type { 
  DiscoveredItem, 
  DiscoveredLayer, 
  DiscoveredCollection,
  DiscoveredPattern,
  ScanResult 
} from './types';

const BUCKET_NAME = 'bebelize-images';
const IGNORED_FOLDERS = ['projects'];
const TEXTURES_FOLDER = 'texturas';

export const bucketScanner = {
  async scanAllCollections(): Promise<ScanResult> {
    try {
      const { data: rootFolders, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 100, offset: 0 });

      if (error) throw error;

      const collectionFolders = rootFolders.filter(folder => 
        folder.id === null && 
        !IGNORED_FOLDERS.includes(folder.name.toLowerCase()) &&
        folder.name.toLowerCase() !== TEXTURES_FOLDER
      );

      const collections: DiscoveredCollection[] = [];

      for (const folder of collectionFolders) {
        const collection = await this.scanCollection(folder.name);
        if (collection) {
          collections.push(collection);
        }
      }

      const patterns = await this.scanPatterns();

      const totalItems = collections.reduce((sum, col) => sum + col.item_count, 0);
      const totalLayers = collections.reduce(
        (sum, col) => sum + col.items.reduce(
          (itemSum, item) => itemSum + item.layers.length, 
          0
        ),
        0
      );

      return {
        success: true,
        collections,
        patterns,
        total_items: totalItems,
        total_layers: totalLayers,
        scanned_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Scan error:', error);
      return {
        success: false,
        collections: [],
        patterns: [],
        total_items: 0,
        total_layers: 0,
        scanned_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async scanPatterns(): Promise<DiscoveredPattern[]> {
    try {
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(TEXTURES_FOLDER, { limit: 200, offset: 0 });

      if (error || !files) return [];

      const patterns: DiscoveredPattern[] = files
        .filter(file => file.name && this.isImageFile(file.name))
        .map(file => {
          const filePath = `${TEXTURES_FOLDER}/${file.name}`;
          const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

          return {
            id: `pattern-${nameWithoutExt}`,
            name: this.formatPatternName(nameWithoutExt),
            slug: nameWithoutExt,
            file: file.name,
            url: data.publicUrl,
            thumbnail_url: data.publicUrl
          };
        })
        .sort((a, b) => {
          const numA = parseInt(a.slug) || 0;
          const numB = parseInt(b.slug) || 0;
          return numA - numB;
        });

      return patterns;
    } catch (error) {
      console.error('Error scanning patterns:', error);
      return [];
    }
  },

  async scanCollection(collectionSlug: string): Promise<DiscoveredCollection | null> {
    try {
      const { data: contents, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(collectionSlug, { limit: 100, offset: 0 });

      if (error || !contents) return null;

      const items: DiscoveredItem[] = [];

      for (const content of contents) {
        if (!content.name) continue;

        const isFolder = content.id === null;

        if (isFolder) {
          const compositeItem = await this.scanCompositeItem(collectionSlug, content.name);
          if (compositeItem) items.push(compositeItem);
        } else if (this.isImageFile(content.name)) {
          const simpleItem = this.createSimpleItem(collectionSlug, content.name);
          items.push(simpleItem);
        }
      }

      return {
        id: collectionSlug,
        slug: collectionSlug,
        name: this.formatName(collectionSlug),
        description: `Coleção ${this.formatName(collectionSlug)}`,
        item_count: items.length,
        items
      };
    } catch (error) {
      console.error(`Error scanning collection ${collectionSlug}:`, error);
      return null;
    }
  },

  async scanCompositeItem(
    collectionSlug: string, 
    itemSlug: string
  ): Promise<DiscoveredItem | null> {
    try {
      const itemPath = `${collectionSlug}/${itemSlug}`;
      
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(itemPath, { limit: 100, offset: 0 });

      if (error || !files) return null;

      const layers = this.extractLayers(files, itemPath);
      if (layers.length === 0) return null;

      const itemId = `${collectionSlug}-${itemSlug}`;

      return {
        id: itemId,
        slug: itemSlug,
        name: this.formatName(itemSlug),
        collection_id: collectionSlug,
        collection_slug: collectionSlug,
        folder_path: itemPath,
        item_type: 'composite',
        layers,
        description: `${this.formatName(itemSlug)} - ${layers.length} camadas`
      };
    } catch (error) {
      console.error(`Error scanning composite item ${itemSlug}:`, error);
      return null;
    }
  },

  createSimpleItem(collectionSlug: string, fileName: string): DiscoveredItem {
    const itemSlug = fileName.replace(/\.[^/.]+$/, '');
    const itemId = `${collectionSlug}-${itemSlug}`;
    const filePath = `${collectionSlug}/${fileName}`;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      id: itemId,
      slug: itemSlug,
      name: this.formatName(itemSlug),
      collection_id: collectionSlug,
      collection_slug: collectionSlug,
      folder_path: filePath,
      item_type: 'simple',
      image_url: data.publicUrl,
      layers: [],
      description: this.formatName(itemSlug)
    };
  },

  extractLayers(files: any[], basePath: string): DiscoveredLayer[] {
    const pngFiles = files.filter(f => f.name && f.name.endsWith('.png'));

    return pngFiles
      .map(file => {
        const match = file.name.match(/^(\d+)\.png$/);
        if (!match) return null;

        const index = parseInt(match[1], 10);
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${basePath}/${file.name}`);

        return {
          index,
          file: file.name,
          url: data.publicUrl,
          type: 'pattern' as const
        };
      })
      .filter((layer): layer is DiscoveredLayer => layer !== null)
      .sort((a, b) => a.index - b.index);
  },

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  },

  formatName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  formatPatternName(slug: string): string {
    const num = parseInt(slug);
    if (!isNaN(num)) {
      return `Textura ${num}`;
    }
    return this.formatName(slug);
  }
};