// lib/discovery/bucketScanner.ts
import { supabase } from '@/lib/supabase/client';
import type { 
  DiscoveredItem, 
  DiscoveredLayer, 
  DiscoveredCollection,
  DiscoveredPattern,
  ScanResult 
} from './types';
import { patternScanner } from './patternScanner';

const BUCKET_NAME = 'bebelize-images';
const IGNORED_FOLDERS = ['projects'];
const TEXTURES_FOLDER = 'Texturas';
const SPECIAL_FILES = ['base.png', 'montado.png'];

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
        folder.name !== TEXTURES_FOLDER
      );

      const collections: DiscoveredCollection[] = [];

      for (const folder of collectionFolders) {
        const collection = await this.scanCollection(folder.name);
        if (collection) {
          collections.push(collection);
        }
      }

      const patterns = await patternScanner.scanPatterns();

      const totalItems = collections.reduce((sum, col) => sum + col.item_count, 0);
      const totalLayers = collections.reduce(
        (sum, col) => sum + col.items.reduce(
          (itemSum, item) => itemSum + item.layers.length, 
          0
        ),
        0
      );

      console.log(`✅ Scan completo: ${collections.length} coleções, ${totalItems} itens, ${totalLayers} camadas`);

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

      const { paintableLayers, baseLayer } = this.extractLayers(files, itemPath);
      
      if (paintableLayers.length === 0 && !baseLayer) return null;

      const allLayers = baseLayer 
        ? [...paintableLayers, baseLayer]
        : paintableLayers;

      const itemId = `${collectionSlug}-${itemSlug}`;

      console.log(`📦 Item: ${itemSlug} | Pintáveis: ${paintableLayers.length} | Base: ${baseLayer ? 'Sim' : 'Não'}`);

      return {
        id: itemId,
        slug: itemSlug,
        name: this.formatName(itemSlug),
        collection_id: collectionSlug,
        collection_slug: collectionSlug,
        folder_path: itemPath,
        item_type: 'composite',
        layers: allLayers,
        description: `${this.formatName(itemSlug)} - ${paintableLayers.length} camadas pintáveis`
      };
    } catch (error) {
      console.error(`Error scanning composite item ${itemSlug}:`, error);
      return null;
    }
  },

  extractLayers(files: any[], basePath: string): { 
    paintableLayers: DiscoveredLayer[], 
    baseLayer: DiscoveredLayer | null 
  } {
    const imageFiles = files.filter(f => f.name && this.isImageFile(f.name));

    let baseLayer: DiscoveredLayer | null = null;
    const paintableLayers: DiscoveredLayer[] = [];

    let layerIndex = 1;

    for (const file of imageFiles) {
      const fileName = file.name.toLowerCase();

      if (fileName === 'montado.png') {
        continue;
      }

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${basePath}/${file.name}`);

      if (fileName === 'base.png') {
        baseLayer = {
          index: 9999,
          file: file.name,
          url: data.publicUrl,
          type: 'pattern'
        };
      } else {
        paintableLayers.push({
          index: layerIndex++,
          file: file.name,
          url: data.publicUrl,
          type: 'pattern'
        });
      }
    }

    paintableLayers.sort((a, b) => {
      const nameA = a.file.toLowerCase();
      const nameB = b.file.toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });

    paintableLayers.forEach((layer, idx) => {
      layer.index = idx + 1;
    });

    return { paintableLayers, baseLayer };
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

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  },

  formatName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
};