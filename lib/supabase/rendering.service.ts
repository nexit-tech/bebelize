import { supabase } from './client';
import type { LayerCustomization } from '@/types/rendering.types';

interface SaveRenderData {
  project_id: string;
  preview_url: string;
  technical_plant_url: string;
  customizations: LayerCustomization[];
}

export const renderingService = {
  async saveRender(data: SaveRenderData): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .update({
        preview_image_url: data.preview_url,
        technical_plant_url: data.technical_plant_url,
        customizations_data: {
          customizations: data.customizations,
          rendered_at: new Date().toISOString()
        }
      })
      .eq('id', data.project_id);

    if (error) {
      console.error('Error saving render:', error);
      throw error;
    }

    return true;
  },

  async uploadImage(buffer: Buffer, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('bebelize-images')
      .upload(path, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('bebelize-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  async getItemMetadata(itemId: string) {
    const { data, error } = await supabase
      .from('items')
      .select('id, name, layers_metadata')
      .eq('id', itemId)
      .single();

    if (error) {
      console.error('Error fetching item metadata:', error);
      throw error;
    }

    return data;
  }
};