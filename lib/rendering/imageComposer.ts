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
  const { layers, customizations, brasao, width = 2000, height = 2000 } = options;

  console.log(`[Composer] Iniciando composição ${width}x${height}`);

  const paintableLayers = layers.filter(layer => layer.index < 9999);
  const baseLayer = layers.find(layer => layer.index === 9999);

  const sortedLayers = [...paintableLayers].sort((a, b) => a.index - b.index);

  const compositeInputs: OverlayOptions[] = [];

  for (const layer of sortedLayers) {
    console.log(`[Composer] Processando camada ${layer.index}: ${layer.file}`);
    
    const layerResponse = await fetch(layer.url);
    const layerArrayBuffer = await layerResponse.arrayBuffer();
    let layerBuffer = Buffer.from(layerArrayBuffer);

    const customization = customizations.find(c => c.layer_index === layer.index);

    if (customization && layer.type === 'pattern') {
      console.log(`[Composer] Aplicando textura na camada ${layer.index}`);
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
  }

  if (brasao) {
    console.log(`[Composer] Aplicando brasão: ${brasao.url}`);
    try {
      const brasaoResponse = await fetch(brasao.url);
      const brasaoArrayBuffer = await brasaoResponse.arrayBuffer();
      let brasaoBuffer = Buffer.from(brasaoArrayBuffer);

      const resizedBrasao = await sharp(brasaoBuffer)
        .resize({
          width: Math.round(brasao.width),
          height: Math.round(brasao.height),
          fit: 'fill',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      compositeInputs.push({
        input: resizedBrasao,
        left: Math.round(brasao.x),
        top: Math.round(brasao.y)
      });
    } catch (error: any) {
      console.error(`[Composer] Erro ao aplicar brasão: ${error.message}`);
    }
  }

  if (baseLayer) {
    console.log(`[Composer] Adicionando camada base: ${baseLayer.file}`);
    
    const baseResponse = await fetch(baseLayer.url);
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

  console.log(`[Composer] Composição final de ${compositeInputs.length} camadas`);

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

  console.log(`[Composer] ✅ Composição concluída: ${metadata.width}x${metadata.height}`);

  return {
    buffer: finalImage,
    width: metadata.width || width,
    height: metadata.height || height,
    format: metadata.format || 'png'
  };
}