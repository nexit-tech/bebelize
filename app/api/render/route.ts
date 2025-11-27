import { NextRequest, NextResponse } from 'next/server';
import { composeImage } from '@/lib/rendering/imageComposer';
import { renderingService } from '@/lib/supabase/rendering.service';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { item_id, customizations, layers } = body;

    if (!item_id || !layers) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos (item_id ou layers faltando)' },
        { status: 400 }
      );
    }

    console.log(`[Render] Iniciando render para Item: ${item_id}`);
    console.log(`[Render] Camadas recebidas: ${layers.length}`);
    console.log(`[Render] Customizações: ${customizations?.length || 0}`);

    const layersToRender = layers.map((layer: any) => ({
      index: layer.index,
      url: layer.url,
      type: 'pattern',
      zone: `layer-${layer.index}`
    }));

    let result;
    try {
      result = await composeImage({
        layers: layersToRender,
        customizations: customizations || [],
        width: 1000, 
        height: 1000
      });
    } catch (composeError: any) {
      console.error('[Render] Erro FATAL no Sharp/ImageComposer:', composeError);
      return NextResponse.json(
        { success: false, error: `Falha ao processar imagem: ${composeError.message}` },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const previewPath = `projects/renders/${item_id}-preview-${timestamp}.png`;
    
    let previewUrl;
    try {
      previewUrl = await renderingService.uploadImage(result.buffer, previewPath);
    } catch (uploadError: any) {
      console.error('[Render] Erro ao fazer upload para Supabase:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Erro ao salvar a imagem gerada no storage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preview_url: previewUrl,
      render_time_ms: Date.now() - startTime
    });

  } catch (error: any) {
    console.error('[Render] Erro desconhecido:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}