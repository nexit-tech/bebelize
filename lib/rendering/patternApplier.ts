import sharp from 'sharp';
import type { OverlayOptions } from 'sharp';

interface ApplyPatternOptions {
  layerBuffer: Buffer;
  patternUrl: string;
  width: number;
  height: number;
}

export async function applyPattern(options: ApplyPatternOptions): Promise<Buffer> {
  const { layerBuffer, patternUrl, width, height } = options;

  try {
    console.log(`[PatternApplier] Aplicando textura: ${patternUrl.split('/').pop()}`);

    const response = await fetch(patternUrl);
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const patternBuffer = await sharp(Buffer.from(arrayBuffer))
      .ensureAlpha()
      .png()
      .toBuffer();

    const originalLayerResized = await sharp(layerBuffer)
      .resize(width, height, { 
        fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 0 } 
      })
      .ensureAlpha()
      .png()
      .toBuffer();

    const layerMetadata = await sharp(originalLayerResized).metadata();
    const finalWidth = layerMetadata.width || width;
    const finalHeight = layerMetadata.height || height;

    const patternMetadata = await sharp(patternBuffer).metadata();
    const patternWidth = patternMetadata.width || 512;
    const patternHeight = patternMetadata.height || 512;
    
    const tilesX = Math.ceil(finalWidth / patternWidth) + 1;
    const tilesY = Math.ceil(finalHeight / patternHeight) + 1;

    const tiles: OverlayOptions[] = [];
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        tiles.push({ 
          input: patternBuffer, 
          left: x * patternWidth, 
          top: y * patternHeight 
        });
      }
    }

    const tiledWidth = tilesX * patternWidth;
    const tiledHeight = tilesY * patternHeight;

    const tiledPatternBuffer = await sharp({
      create: {
        width: tiledWidth,
        height: tiledHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite(tiles)
      .png()
      .toBuffer();

    const tiledResized = await sharp(tiledPatternBuffer)
      .extract({ 
        left: 0, 
        top: 0, 
        width: finalWidth, 
        height: finalHeight 
      })
      .ensureAlpha()
      .png()
      .toBuffer();

    const finalImage = await sharp(tiledResized)
      .composite([
        {
          input: originalLayerResized,
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();

    return finalImage;

  } catch (error: any) {
    console.error(`[PatternApplier] Erro: ${error.message}`);
    
    return await sharp(layerBuffer)
      .resize(width, height, { 
        fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 0 } 
      })
      .png()
      .toBuffer();
  }
}