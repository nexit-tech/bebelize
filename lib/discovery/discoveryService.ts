import { bucketScanner } from './bucketScanner';
import { itemCache } from './itemCache';
import type { ScanResult, DiscoveredCollection, DiscoveredItem } from './types';

export const discoveryService = {
  async getCollections(forceRefresh = false): Promise<DiscoveredCollection[]> {
    if (!forceRefresh) {
      const cached = itemCache.load();
      if (cached?.success) {
        return cached.collections;
      }
    }

    const scanResult = await bucketScanner.scanAllCollections();
    
    if (scanResult.success) {
      itemCache.save(scanResult);
    }

    return scanResult.collections;
  },

  async getCollectionById(collectionId: string): Promise<DiscoveredCollection | null> {
    const cached = itemCache.findCollection(collectionId);
    if (cached) return cached;

    const collections = await this.getCollections(true);
    return collections.find(c => c.id === collectionId || c.slug === collectionId) || null;
  },

  async getItemsByCollection(collectionId: string): Promise<DiscoveredItem[]> {
    const cached = itemCache.findItemsByCollection(collectionId);
    if (cached.length > 0) return cached;

    const collection = await this.getCollectionById(collectionId);
    return collection?.items || [];
  },

  async getItemById(itemId: string): Promise<DiscoveredItem | null> {
    const cached = itemCache.findItem(itemId);
    if (cached) return cached;

    await this.getCollections(true);
    return itemCache.findItem(itemId);
  },

  async searchItems(query: string): Promise<DiscoveredItem[]> {
    const collections = await this.getCollections();
    const allItems = collections.flatMap(c => c.items);

    const lowerQuery = query.toLowerCase();

    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.slug.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery)
    );
  },

  async refreshCache(): Promise<ScanResult> {
    itemCache.clear();
    const scanResult = await bucketScanner.scanAllCollections();
    
    if (scanResult.success) {
      itemCache.save(scanResult);
    }

    return scanResult;
  },

  getCachedData(): ScanResult | null {
    return itemCache.load();
  },

  isCacheValid(): boolean {
    return itemCache.isValid();
  }
};