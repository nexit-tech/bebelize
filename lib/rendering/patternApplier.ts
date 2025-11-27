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
    let patternBuffer = Buffer.from(arrayBuffer);

    try {
      patternBuffer = await sharp(patternBuffer).png().toBuffer();
    } catch (e) {
      throw new Error('Arquivo de textura inválido');
    }

    const patternMetadata = await sharp(patternBuffer).metadata();
    const patternWidth = patternMetadata.width || 512;
    const patternHeight = patternMetadata.height || 512;
    const tilesX = Math.ceil(width / patternWidth);
    const tilesY = Math.ceil(height / patternHeight);
    const tiles = [];
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        tiles.push({ input: patternBuffer, left: x * patternWidth, top: y * patternHeight });
      }
    }

    const tiledPatternBuffer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite(tiles)
      .png()
      .toBuffer();

    const originalLayerResized = await sharp(layerBuffer)
      .resize(width, height, { 
        fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 0 } 
      })
      .png()
      .toBuffer();

    const shadowLayer = await sharp(originalLayerResized)
      .grayscale()
      .toBuffer();

    const finalImage = await sharp(tiledPatternBuffer)
      .composite([
        {
          input: originalLayerResized,
          blend: 'dest-in' 
        },
        {
          input: shadowLayer,
          blend: 'multiply' 
        }
      ])
      .png()
      .toBuffer();

    return finalImage;

  } catch (error: any) {
    console.error(`[PatternApplier] Erro: ${error.message}`);
    return await sharp(layerBuffer)
      .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
  }
}