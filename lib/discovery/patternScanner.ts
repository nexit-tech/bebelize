// lib/discovery/patternScanner.ts
import { supabase } from '@/lib/supabase/client';
import type { DiscoveredPattern } from './types';

const BUCKET_NAME = 'bebelize-images';
const PATTERNS_FOLDER = 'Texturas';

export type { DiscoveredPattern };

export const patternScanner = {
  async scanPatterns(): Promise<DiscoveredPattern[]> {
    try {
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(PATTERNS_FOLDER, { limit: 1000, offset: 0 });

      if (error || !files) {
        console.error('Error listing patterns:', error);
        return [];
      }

      const patterns: DiscoveredPattern[] = files
        .filter(file => file.name && this.isImageFile(file.name))
        .map(file => {
          const filePath = `${PATTERNS_FOLDER}/${file.name}`;
          const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

          const slug = file.name.replace(/\.[^/.]+$/, '');
          const formattedName = this.formatName(slug);

          return {
            id: `pattern-${slug}`,
            name: formattedName,
            slug: slug,
            file: file.name,
            url: data.publicUrl,
            thumbnail_url: data.publicUrl
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      console.log(`✅ Padrões encontrados: ${patterns.length}`);
      return patterns;
    } catch (error) {
      console.error('Pattern scan error:', error);
      return [];
    }
  },

  isImageFile(fileName: string): boolean {
    const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
  },

  formatName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
};
