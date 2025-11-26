import { bucketScanner } from './bucketScanner';
import { itemCache } from './itemCache';
import type { 
  ScanResult, 
  DiscoveredCollection, 
  DiscoveredItem,
  DiscoveredPattern 
} from './types';

export const discoveryService = {
  async initialize(forceRefresh = false): Promise<ScanResult> {
    if (!forceRefresh && itemCache.isValid()) {
      const cached = itemCache.load();
      if (cached) return cached;
    }

    const result = await bucketScanner.scanAllCollections();
    itemCache.save(result);

    return result;
  },

  getCachedData(): ScanResult | null {
    return itemCache.load();
  },

  async getCollections(forceRefresh = false): Promise<DiscoveredCollection[]> {
    const data = await this.initialize(forceRefresh);
    return data.collections;
  },

  async getCollection(collectionId: string): Promise<DiscoveredCollection | null> {
    await this.initialize();
    return itemCache.findCollection(collectionId);
  },

  async getItem(itemId: string): Promise<DiscoveredItem | null> {
    await this.initialize();
    return itemCache.findItem(itemId);
  },

  async getItemsByCollection(collectionId: string): Promise<DiscoveredItem[]> {
    await this.initialize();
    return itemCache.findItemsByCollection(collectionId);
  },

  async getAllItems(): Promise<DiscoveredItem[]> {
    await this.initialize();
    return itemCache.getAllItems();
  },

  async getPatterns(): Promise<DiscoveredPattern[]> {
    await this.initialize();
    return itemCache.getAllPatterns();
  },

  async getPattern(patternId: string): Promise<DiscoveredPattern | null> {
    await this.initialize();
    return itemCache.findPatternById(patternId);
  },

  async refreshCache(): Promise<ScanResult> {
    return this.initialize(true);
  },

  async refresh(): Promise<ScanResult> {
    return this.initialize(true);
  },

  clearCache(): void {
    itemCache.clear();
  }
};