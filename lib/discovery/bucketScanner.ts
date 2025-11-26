import { supabase } from '@/lib/supabase/client';
import type { DiscoveredItem, DiscoveredLayer, BucketStructure } from './types';

const BUCKET_NAME = 'bebelize-images';

export const bucketScanner = {
  async scanCollection(collectionSlug: string): Promise<DiscoveredItem[]> {
    try {
      const { data: folders, error: foldersError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(collectionSlug, {
          limit: 100,
          offset: 0
        });

      if (foldersError) throw foldersError;

      if (!folders || folders.length === 0) {
        return [];
      }

      const items: DiscoveredItem[] = [];

      for (const folder of folders) {
        if (!folder.name) continue;

        const itemPath = `${collectionSlug}/${folder.name}`;
        
        const { data: files, error: filesError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(itemPath, {
            limit: 100,
            offset: 0
          });

        if (filesError || !files) continue;

        const layers = this.extractLayers(files, itemPath);

        if (layers.length === 0) continue;

        const itemName = this.formatItemName(folder.name);
        const itemId = `${collectionSlug}-${folder.name}`;

        items.push({
          id: itemId,
          slug: folder.name,
          name: itemName,
          collection_id: collectionSlug,
          collection_slug: collectionSlug,
          folder_path: itemPath,
          layers
        });
      }

      return items;
    } catch (error) {
      console.error(`Error scanning collection ${collectionSlug}:`, error);
      throw error;
    }
  },

  extractLayers(files: any[], basePath: string): DiscoveredLayer[] {
    const pngFiles = files.filter(f => f.name.endsWith('.png'));
    
    const layers: DiscoveredLayer[] = pngFiles
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

    return layers;
  },

  formatItemName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  async scanAllCollections(collectionSlugs: string[]): Promise<BucketStructure[]> {
    const results: BucketStructure[] = [];

    for (const slug of collectionSlugs) {
      try {
        const items = await this.scanCollection(slug);
        
        if (items.length > 0) {
          results.push({
            collection_slug: slug,
            items
          });
        }
      } catch (error) {
        console.error(`Failed to scan collection ${slug}:`, error);
      }
    }

    return results;
  }
};