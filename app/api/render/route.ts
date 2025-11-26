import { NextRequest, NextResponse } from 'next/server';
import { composeImage } from '@/lib/rendering/imageComposer';
import { renderingService } from '@/lib/supabase/rendering.service';
import { itemCache } from '@/lib/discovery/itemCache';
import type { RenderRequest, RenderResponse } from '@/types/rendering.types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: RenderRequest = await request.json();
    const { item_id, collection_id, customizations } = body;

    if (!item_id || !customizations || customizations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const item = itemCache.findItem(item_id);

    if (!item || !item.layers || item.layers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Item or layers not found' },
        { status: 404 }
      );
    }

    const layers = item.layers.map(layer => ({
      index: layer.index,
      file: layer.file,
      url: layer.url,
      type: layer.type as 'fixed' | 'pattern',
      zone: `layer-${layer.index}`,
      description: `Camada ${layer.index}`
    }));

    const result = await composeImage({
      layers,
      customizations,
      width: 2000,
      height: 2000
    });

    const timestamp = Date.now();
    const previewPath = `projects/renders/${item_id}-preview-${timestamp}.png`;
    const technicalPath = `projects/renders/${item_id}-technical-${timestamp}.png`;

    const previewUrl = await renderingService.uploadImage(result.buffer, previewPath);
    const technicalUrl = await renderingService.uploadImage(result.buffer, technicalPath);

    const renderTime = Date.now() - startTime;

    const response: RenderResponse = {
      success: true,
      preview_url: previewUrl,
      technical_plant_url: technicalUrl,
      render_time_ms: renderTime
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Render error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        preview_url: '',
        technical_plant_url: '',
        render_time_ms: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}