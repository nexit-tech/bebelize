import sharp from 'sharp';

interface ApplyPatternOptions {
  layerBuffer: Buffer;
  patternUrl: string;
  width: number;
  height: number;
}

export async function applyPattern(options: ApplyPatternOptions): Promise<Buffer> {
  const { layerBuffer, patternUrl, width, height } = options;

  const patternResponse = await fetch(patternUrl);
  const patternArrayBuffer = await patternResponse.arrayBuffer();
  const patternBuffer = Buffer.from(patternArrayBuffer);

  const patternMetadata = await sharp(patternBuffer).metadata();
  const patternWidth = patternMetadata.width || 512;
  const patternHeight = patternMetadata.height || 512;

  const tilesX = Math.ceil(width / patternWidth) + 1;
  const tilesY = Math.ceil(height / patternHeight) + 1;

  const tiles = [];
  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      tiles.push({
        input: patternBuffer,
        left: x * patternWidth,
        top: y * patternHeight
      });
    }
  }

  const tiledPattern = await sharp({
    create: {
      width: tilesX * patternWidth,
      height: tilesY * patternHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(tiles)
    .extract({ left: 0, top: 0, width, height })
    .toBuffer();

  const layerImage = sharp(layerBuffer);
  const layerMetadata = await layerImage.metadata();

  const maskBuffer = await sharp(layerBuffer)
    .extractChannel(3)
    .toBuffer();

  const result = await sharp(tiledPattern)
    .resize(width, height, { fit: 'cover' })
    .composite([
      {
        input: maskBuffer,
        blend: 'dest-in'
      }
    ])
    .toBuffer();

  return result;
}