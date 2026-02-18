import { supabase } from './client';

const BUCKET_NAME = 'bebelize-images';

export const storageService = {
  async uploadImage(path: string, file: File): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png'
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async createFolder(path: string): Promise<boolean> {
    const emptyFile = new File([''], '.keep', { type: 'text/plain' });
    const folderPath = path.endsWith('/') ? `${path}.keep` : `${path}/.keep`;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(folderPath, emptyFile, {
        upsert: true,
      });

    if (error) throw error;
    return true;
  },

  async removeFile(path: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
    return true;
  },

  async listContents(path: string = '') {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path, { limit: 1000 });

    if (error) throw error;
    return data || [];
  }
};