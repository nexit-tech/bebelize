import { supabase } from '@/lib/supabase/client';
// CORREÇÃO: Importar a interface centralizada em vez de redefinir
import type { DiscoveredPattern } from './types';

const BUCKET_NAME = 'bebelize-images';
const PATTERNS_FOLDER = 'Texturas';

// Re-exportar para facilitar imports se necessário, mas o ideal é usar de ./types
export type { DiscoveredPattern };

export const patternScanner = {
  async scanPatterns(): Promise<DiscoveredPattern[]> {
    try {
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(PATTERNS_FOLDER, { limit: 100, offset: 0 });

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

          // O objeto agora deve casar exatamente com a interface de ./types.ts
          return {
            id: `pattern-${slug}`,
            name: `Textura ${slug}`,
            slug: slug,
            file: file.name, // Propriedade obrigatória que faltava na interface local
            url: data.publicUrl,
            thumbnail_url: data.publicUrl
            // category: removido pois não existe em types.ts e não é mais usado
          };
        })
        .sort((a, b) => {
          const numA = parseInt(a.slug);
          const numB = parseInt(b.slug);
          if (isNaN(numA) || isNaN(numB)) return a.slug.localeCompare(b.slug);
          return numA - numB;
        });

      return patterns;
    } catch (error) {
      console.error('Pattern scan error:', error);
      return [];
    }
  },

  isImageFile(fileName: string): boolean {
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }
};