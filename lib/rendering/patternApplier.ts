import sharp from 'sharp';

interface ApplyPatternOptions {
  layerBuffer: Buffer;
  patternUrl: string;
  width: number;
  height: number;
}

export async function applyPattern(options: ApplyPatternOptions): Promise<Buffer> {
  const { layerBuffer, patternUrl, width, height } = options;

  try {
    const response = await fetch(patternUrl);
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const originalPatternBuffer = Buffer.from(arrayBuffer);

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

    const scaleFactor = 0.25;
    const targetPatternWidth = Math.max(32, Math.floor(finalWidth * scaleFactor));

    const resizedPatternBuffer = await sharp(originalPatternBuffer)
      .resize({ width: targetPatternWidth })
      .ensureAlpha()
      .png()
      .toBuffer();

    const patternMetadata = await sharp(resizedPatternBuffer).metadata();
    const patternWidth = patternMetadata.width || targetPatternWidth;
    const patternHeight = patternMetadata.height || targetPatternWidth;

    const tilesX = Math.ceil(finalWidth / patternWidth) + 1;
    const tilesY = Math.ceil(finalHeight / patternHeight) + 1;

    // Correção: Tipagem explícita para o array de tiles
    const tiles: { input: Buffer; left: number; top: number; }[] = [];
    
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        tiles.push({ 
          input: resizedPatternBuffer, 
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
    console.error(`Erro no PatternApplier: ${error.message}`);
    
    return await sharp(layerBuffer)
      .resize(width, height, { 
        fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 0 } 
      })
      .png()
      .toBuffer();
  }
}