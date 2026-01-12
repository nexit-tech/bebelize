import sharp from 'sharp';
import { Layer, LayerCustomization, OverlayState } from '@/types/rendering.types';
import { applyPattern } from './patternApplier';

interface ComposeOptions {
  layers: Layer[];
  customizations: LayerCustomization[];
  overlay?: OverlayState | null;
}

export async function composeImage(options: ComposeOptions): Promise<Buffer> {
  const { layers, customizations, overlay } = options;

  try {
    const sortedLayers = [...layers].sort((a, b) => (a.index || 0) - (b.index || 0));
    
    const compositeOperations: sharp.OverlayOptions[] = [];
    let canvasWidth = 1000; 
    let canvasHeight = 1000; 

    for (const layer of sortedLayers) {

      if (layer.type === 'fixed' || !layer.url) {
        if (layer.url) {
          const response = await fetch(layer.url);
          const buffer = Buffer.from(await response.arrayBuffer());
          
          if (layer.index === 0) {
            const metadata = await sharp(buffer).metadata();
            canvasWidth = metadata.width || 1000;
            canvasHeight = metadata.height || 1000;
          }

          compositeOperations.push({ input: buffer });
        }
        continue;
      }

      const response = await fetch(layer.url);
      const layerBuffer = Buffer.from(await response.arrayBuffer());

      if (layer.index === 0) {
        const metadata = await sharp(layerBuffer).metadata();
        canvasWidth = metadata.width || 1000;
        canvasHeight = metadata.height || 1000;
      }

      const customization = customizations.find(c => c.layer_index === layer.index);

      if (customization) {
        
        if ((customization.type === 'pattern' || !customization.type) && customization.pattern_url) {
          const patternedBuffer = await applyPattern({
            layerBuffer,
            patternUrl: customization.pattern_url,
            width: canvasWidth,
            height: canvasHeight
          });
          compositeOperations.push({ input: patternedBuffer });
        } 
        else if (customization.type === 'color' && customization.color) {
          const coloredBuffer = await sharp(layerBuffer)
            .tint(customization.color)
            .toBuffer();
          compositeOperations.push({ input: coloredBuffer });
        } else {

          compositeOperations.push({ input: layerBuffer });
        }
      } else {
        compositeOperations.push({ input: layerBuffer });
      }
    }

    const baseImage = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite(compositeOperations)
    .png()
    .toBuffer();

    if (overlay && overlay.url) {
      let overlayBuffer: Buffer;
      
      if (overlay.url.startsWith('data:')) {
        const base64Data = overlay.url.split(';base64,').pop();
        if (base64Data) {
          overlayBuffer = Buffer.from(base64Data, 'base64');
        } else {
            throw new Error('Formato de imagem DataURL inválido.');
        }
      } else {
        const response = await fetch(overlay.url);
        overlayBuffer = Buffer.from(await response.arrayBuffer());
      }

      const resizedOverlay = await sharp(overlayBuffer)
        .resize({
          width: Math.round(overlay.width),
          height: Math.round(overlay.height),
          fit: 'fill'
        })
        .rotate(overlay.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      const finalWithOverlay = await sharp(baseImage)
        .composite([{
          input: resizedOverlay,
          left: Math.round(overlay.x),
          top: Math.round(overlay.y)
        }])
        .png()
        .toBuffer();

      return finalWithOverlay;
    }

    return baseImage;

  } catch (error) {
    console.error('Erro na composição de imagem:', error);
    throw new Error('Falha ao gerar imagem do produto.');
  }
}