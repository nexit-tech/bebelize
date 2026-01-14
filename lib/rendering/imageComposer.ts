import sharp from 'sharp';
import type { OverlayOptions } from 'sharp';
import { applyPattern } from './patternApplier';
import type { Layer, LayerCustomization, CompositionResult, BrasaoCustomization } from '@/types/rendering.types';

interface ComposeImageOptions {
  layers: Layer[];
  customizations: LayerCustomization[];
  brasao?: BrasaoCustomization;
  width?: number;
  height?: number;
}

export async function composeImage(options: ComposeImageOptions): Promise<CompositionResult> {
  const { layers, customizations, brasao, width = 1000, height = 1000 } = options;

  console.log(`[Composer] Iniciando composição ${width}x${height}`);

  const paintableLayers = layers.filter(layer => layer.index < 9999);
  const baseLayer = layers.find(layer => layer.index === 9999);

  const sortedLayers = [...paintableLayers].sort((a, b) => a.index - b.index);

  const compositeInputs: OverlayOptions[] = [];

  for (const layer of sortedLayers) {
    // Correção: Verifica se a URL existe antes de processar
    if (!layer.url) {
      console.warn(`[Composer] Camada ${layer.index} ignorada: URL não definida.`);
      continue;
    }

    console.log(`[Composer] Processando camada ${layer.index}: ${layer.file || 'sem-nome'}`);
    
    try {
      const layerResponse = await fetch(layer.url);
      if (!layerResponse.ok) throw new Error(`Falha ao baixar layer ${layer.url}`);
      
      const layerArrayBuffer = await layerResponse.arrayBuffer();
      let layerBuffer = Buffer.from(layerArrayBuffer);

      const customization = customizations.find(c => c.layer_index === layer.index);

      // Correção: Verifica se pattern_url existe antes de chamar applyPattern
      if (customization && customization.pattern_url && layer.type === 'pattern') {
        layerBuffer = await applyPattern({
          layerBuffer,
          patternUrl: customization.pattern_url,
          width,
          height
        });
      } else {
        layerBuffer = await sharp(layerBuffer)
          .resize(width, height, { 
            fit: 'contain', 
            background: { r: 0, g: 0, b: 0, alpha: 0 } 
          })
          .png()
          .toBuffer();
      }

      compositeInputs.push({ input: layerBuffer });
    } catch (err) {
      console.warn(`[Composer] Erro ao processar camada ${layer.index}, pulando:`, err);
    }
  }

  // Correção: Verifica se baseLayer e sua URL existem
  if (baseLayer && baseLayer.url) {
    console.log(`[Composer] Adicionando camada base: ${baseLayer.file || 'base'}`);
    try {
      const baseResponse = await fetch(baseLayer.url);
      if (baseResponse.ok) {
        const baseArrayBuffer = await baseResponse.arrayBuffer();
        const baseBuffer = Buffer.from(baseArrayBuffer);

        const resizedBase = await sharp(baseBuffer)
          .resize(width, height, { 
            fit: 'contain', 
            background: { r: 0, g: 0, b: 0, alpha: 0 } 
          })
          .png()
          .toBuffer();

        compositeInputs.push({ input: resizedBase });
      }
    } catch (err) {
      console.warn('[Composer] Erro ao processar base layer:', err);
    }
  }

  // Correção: Verifica se brasao.url existe
  if (brasao && brasao.url) {
    console.log(`[Composer] Aplicando brasão: ${brasao.url}`);
    try {
      const brasaoResponse = await fetch(brasao.url);
      if (brasaoResponse.ok) {
        const brasaoArrayBuffer = await brasaoResponse.arrayBuffer();
        const brasaoBuffer = Buffer.from(brasaoArrayBuffer);

        // Garante números válidos para o Sharp
        const safeWidth = Math.max(1, Math.round(brasao.width || 100));
        const safeHeight = Math.max(1, Math.round(brasao.height || 100));

        const resizedBrasao = await sharp(brasaoBuffer)
          .resize({
            width: safeWidth,
            height: safeHeight,
            fit: 'fill',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();

        compositeInputs.push({
          input: resizedBrasao,
          left: Math.round(brasao.x || 0),
          top: Math.round(brasao.y || 0)
        });
      }
    } catch (error: any) {
      console.error(`[Composer] Erro ao aplicar brasão: ${error.message}`);
    }
  }

  const finalImage = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite(compositeInputs)
    .png()
    .toBuffer();

  const metadata = await sharp(finalImage).metadata();

  return {
    buffer: finalImage,
    width: metadata.width || width,
    height: metadata.height || height,
    format: metadata.format || 'png'
  };
}