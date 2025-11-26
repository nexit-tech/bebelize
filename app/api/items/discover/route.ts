import { NextRequest, NextResponse } from 'next/server';
import { discoveryService } from '@/lib/discovery/discoveryService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const collections = await discoveryService.getCollections(forceRefresh);

    const totalItems = collections.reduce((sum, col) => sum + col.item_count, 0);
    const totalLayers = collections.reduce(
      (sum, col) => sum + col.items.reduce(
        (itemSum, item) => itemSum + item.layers.length,
        0
      ),
      0
    );

    return NextResponse.json(
      {
        success: true,
        collections,
        total_items: totalItems,
        total_layers: totalLayers,
        scanned_at: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
        }
      }
    );
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
    const { collection_id } = body;

    if (!collection_id) {
      return NextResponse.json(
        { success: false, error: 'collection_id is required' },
        { status: 400 }
      );
    }

    const items = await discoveryService.getItemsByCollection(collection_id);

    return NextResponse.json({
      success: true,
      collection_id,
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