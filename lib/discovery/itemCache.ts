import type { DiscoveredItem, ScanResult } from './types';

const CACHE_KEY = 'bebelize_items_cache';
const CACHE_DURATION = 1000 * 60 * 30;

export const itemCache = {
  save(data: ScanResult): void {
    try {
      const cacheData = {
        ...data,
        cached_at: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  },

  load(): ScanResult | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const age = Date.now() - data.cached_at;

      if (age > CACHE_DURATION) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading cache:', error);
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  isValid(): boolean {
    const cached = this.load();
    return cached !== null;
  },

  findItem(itemId: string): DiscoveredItem | null {
    const cached = this.load();
    if (!cached) return null;

    for (const collection of cached.collections) {
      const item = collection.items.find(i => i.id === itemId);
      if (item) return item;
    }

    return null;
  },

  findItemsByCollection(collectionSlug: string): DiscoveredItem[] {
    const cached = this.load();
    if (!cached) return [];

    const collection = cached.collections.find(c => c.collection_slug === collectionSlug);
    return collection?.items || [];
  }
};