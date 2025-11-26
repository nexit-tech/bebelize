import { NextRequest, NextResponse } from 'next/server';
import { bucketScanner } from '@/lib/discovery/bucketScanner';
import type { ScanResult } from '@/lib/discovery/types';

const KNOWN_COLLECTIONS = [
  'aviador',
  'campo-chique',
  'cavalinho-rose',
  'cavalinho',
  'garden',
  'lavanda',
  'renda-real',
  'realeza-azul',
  'safari-baby',
  'xadrez-malva'
];

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const collections = await bucketScanner.scanAllCollections(KNOWN_COLLECTIONS);

    const totalItems = collections.reduce((sum, col) => sum + col.items.length, 0);
    const totalLayers = collections.reduce(
      (sum, col) => sum + col.items.reduce((itemSum, item) => itemSum + item.layers.length, 0),
      0
    );

    const result: ScanResult = {
      success: true,
      collections,
      total_items: totalItems,
      total_layers: totalLayers,
      scanned_at: new Date().toISOString()
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    });

  } catch (error) {
    console.error('Discovery error:', error);

    return NextResponse.json(
      {
        success: false,
        collections: [],
        total_items: 0,
        total_layers: 0,
        scanned_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection_slug } = body;

    if (!collection_slug) {
      return NextResponse.json(
        { success: false, error: 'collection_slug is required' },
        { status: 400 }
      );
    }

    const items = await bucketScanner.scanCollection(collection_slug);

    return NextResponse.json({
      success: true,
      collection_slug,
      items,
      total_items: items.length,
      scanned_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Collection scan error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}