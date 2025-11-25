import sharp from 'sharp';
import { applyPattern } from './patternApplier';
import type { Layer, LayerCustomization, CompositionResult } from '@/types/rendering.types';

interface ComposeImageOptions {
  layers: Layer[];
  customizations: LayerCustomization[];
  width?: number;
  height?: number;
}

export async function composeImage(options: ComposeImageOptions): Promise<CompositionResult> {
  const { layers, customizations, width = 2000, height = 2000 } = options;

  const sortedLayers = [...layers].sort((a, b) => a.index - b.index);

  const compositeInputs = [];

  for (const layer of sortedLayers) {
    const layerResponse = await fetch(layer.url);
    const layerArrayBuffer = await layerResponse.arrayBuffer();
    let layerBuffer = Buffer.from(layerArrayBuffer);

    const customization = customizations.find(c => c.layer_index === layer.index);

    if (customization && layer.type === 'pattern') {
      layerBuffer = await applyPattern({
        layerBuffer,
        patternUrl: customization.pattern_url,
        width,
        height
      });
    }

    const resizedLayer = await sharp(layerBuffer)
      .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    compositeInputs.push({ input: resizedLayer });
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