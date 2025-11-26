import { supabase } from '@/lib/supabase/client';

const BUCKET_NAME = 'bebelize-images';
const PATTERNS_FOLDER = 'texturas';

export interface DiscoveredPattern {
  id: string;
  slug: string;
  name: string;
  url: string;
  category: string;
  thumbnail_url: string;
}

export const patternScanner = {
  async scanPatterns(): Promise<DiscoveredPattern[]> {
    try {
      const { data: categories, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(PATTERNS_FOLDER, { limit: 100 });

      if (error) {
        console.error('Error listing pattern categories:', error);
        return [];
      }

      const patterns: DiscoveredPattern[] = [];

      for (const category of categories) {
        if (category.id !== null) continue;

        const categoryPatterns = await this.scanCategory(category.name);
        patterns.push(...categoryPatterns);
      }

      return patterns;
    } catch (error) {
      console.error('Pattern scan error:', error);
      return [];
    }
  },

  async scanCategory(categorySlug: string): Promise<DiscoveredPattern[]> {
    try {
      const categoryPath = `${PATTERNS_FOLDER}/${categorySlug}`;
      
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(categoryPath, { limit: 100 });

      if (error || !files) return [];

      const patterns: DiscoveredPattern[] = [];

      for (const file of files) {
        if (!file.name || !this.isImageFile(file.name)) continue;

        const filePath = `${categoryPath}/${file.name}`;
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        const slug = file.name.replace(/\.[^/.]+$/, '');
        const id = `${categorySlug}-${slug}`;

        patterns.push({
          id,
          slug,
          name: this.formatName(slug),
          url: data.publicUrl,
          category: categorySlug,
          thumbnail_url: data.publicUrl
        });
      }

      return patterns;
    } catch (error) {
      console.error(`Error scanning category ${categorySlug}:`, error);
      return [];
    }
  },

  isImageFile(fileName: string): boolean {
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
  },

  formatName(slug: string): string {
    return slug
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};