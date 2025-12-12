import { supabase } from '@/lib/supabase/client';
import type { 
  DiscoveredItem, 
  DiscoveredLayer, 
  DiscoveredCollection,
  DiscoveredVariant,
  ScanResult 
} from './types';
import { patternScanner } from './patternScanner';

const BUCKET_NAME = 'bebelize-images';
const IGNORED_FOLDERS = ['projects'];
const TEXTURES_FOLDER = 'Texturas';

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
      
      const { data: contents, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(itemPath, { limit: 100, offset: 0 });

      if (error || !contents) return null;

      const variants: DiscoveredVariant[] = [];

      const rootFiles = contents.filter(c => c.id !== null);
      const subFolders = contents.filter(c => c.id === null);
      const { paintableLayers: rootLayers, baseLayer: rootBase, previewUrl: rootPreview } = this.extractLayers(rootFiles, itemPath);
      
      if (rootLayers.length > 0 || rootBase) {
        const allRootLayers = rootBase ? [...rootLayers, rootBase] : rootLayers;
        variants.push({
          id: 'default',
          name: 'Padrão',
          layers: allRootLayers,
          previewUrl: rootPreview
        });
      }

      for (const folder of subFolders) {
        const variantPath = `${itemPath}/${folder.name}`;
        const { data: variantFiles } = await supabase.storage
          .from(BUCKET_NAME)
          .list(variantPath, { limit: 100 });

        if (variantFiles) {
          const { paintableLayers, baseLayer, previewUrl } = this.extractLayers(variantFiles, variantPath);
          
          if (paintableLayers.length > 0 || baseLayer) {
            const allVariantLayers = baseLayer ? [...paintableLayers, baseLayer] : paintableLayers;
            variants.push({
              id: folder.name,
              name: this.formatName(folder.name),
              layers: allVariantLayers,
              previewUrl: previewUrl
            });
          }
        }
      }

      if (variants.length === 0) return null;

      const mainVariant = variants.find(v => v.id === 'default') || variants[0];

      const itemId = `${collectionSlug}-${itemSlug}`;

      return {
        id: itemId,
        slug: itemSlug,
        name: this.formatName(itemSlug),
        collection_id: collectionSlug,
        collection_slug: collectionSlug,
        folder_path: itemPath,
        item_type: 'composite',
        variants: variants,
        layers: mainVariant.layers,
        image_url: mainVariant.previewUrl,
        description: `${this.formatName(itemSlug)} - ${variants.length} variações`
      };
    } catch (error) {
      console.error(`Error scanning composite item ${itemSlug}:`, error);
      return null;
    }
  },

  extractLayers(files: any[], basePath: string): { 
    paintableLayers: DiscoveredLayer[], 
    baseLayer: DiscoveredLayer | null,
    previewUrl?: string
  } {
    const imageFiles = files.filter(f => f.name && this.isImageFile(f.name));

    let baseLayer: DiscoveredLayer | null = null;
    let previewUrl: string | undefined = undefined;
    const paintableLayers: DiscoveredLayer[] = [];

    let layerIndex = 1;

    for (const file of imageFiles) {
      const fileName = file.name.toLowerCase();
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${basePath}/${file.name}`);

      if (fileName === 'montado.png') {
        previewUrl = data.publicUrl;
        continue;
      }

      if (fileName === 'base.png') {
        baseLayer = {
          index: 9999,
          file: file.name,
          name: 'Base',
          url: data.publicUrl,
          type: 'fixed'
        };
      } else {
        paintableLayers.push({
          index: layerIndex++,
          file: file.name,
          name: this.formatLayerName(file.name),
          url: data.publicUrl,
          type: 'pattern'
        });
      }
    }

    paintableLayers.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    paintableLayers.forEach((layer, idx) => {
      layer.index = idx + 1;
    });

    return { paintableLayers, baseLayer, previewUrl };
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
      variants: [],
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
  },

  formatLayerName(fileName: string): string {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const cleanName = nameWithoutExt.replace(/^\d+[\.\-\_\s]*/, '');
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  }
};