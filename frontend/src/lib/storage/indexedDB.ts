/**
 * IndexedDB utility for caching meme templates and captions
 * Provides offline support and faster loading times
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface MemeTemplate {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

interface CaptionPreset {
  id: number;
  text: string;
  emoji: string;
  category: 'meme' | 'emoji' | 'reaction';
}

class IndexedDBCache {
  private dbName = 'meme-battle-cache';
  private version = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve, reject) => {
      // Check if IndexedDB is available
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('captions')) {
          db.createObjectStore('captions', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generic method to store data in IndexedDB
   */
  private async storeData<T>(
    storeName: string, 
    key: string, 
    data: T, 
    version: string = '1.0.0'
  ): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version
      };

      const request = store.put({ key, ...cacheItem });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store data'));
    });
  }

  /**
   * Generic method to retrieve data from IndexedDB
   */
  private async getData<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to retrieve data'));
    });
  }

  /**
   * Check if cached data is still valid
   */
  private async isCacheValid(
    storeName: string, 
    key: string, 
    maxAge: number = 24 * 60 * 60 * 1000 // 24 hours default
  ): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      if (!this.db) {
        resolve(false);
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.timestamp) {
          const age = Date.now() - result.timestamp;
          resolve(age < maxAge);
        } else {
          resolve(false);
        }
      };

      request.onerror = () => resolve(false);
    });
  }

  /**
   * Cache meme templates
   */
  async cacheTemplates(templates: MemeTemplate[]): Promise<void> {
    try {
      await this.storeData('templates', 'meme-templates', templates, '1.0.0');
      console.log('✅ Meme templates cached successfully');
    } catch (error) {
      console.warn('⚠️ Failed to cache templates:', error);
    }
  }

  /**
   * Get cached meme templates
   */
  async getCachedTemplates(): Promise<MemeTemplate[] | null> {
    try {
      const isValid = await this.isCacheValid('templates', 'meme-templates');
      if (!isValid) {
        return null;
      }

      const templates = await this.getData<MemeTemplate[]>('templates', 'meme-templates');
      if (templates) {
        console.log('✅ Using cached templates');
      }
      return templates;
    } catch (error) {
      console.warn('⚠️ Failed to get cached templates:', error);
      return null;
    }
  }

  /**
   * Cache caption presets
   */
  async cacheCaptions(captions: CaptionPreset[]): Promise<void> {
    try {
      await this.storeData('captions', 'caption-presets', captions, '1.0.0');
      console.log('✅ Caption presets cached successfully');
    } catch (error) {
      console.warn('⚠️ Failed to cache captions:', error);
    }
  }

  /**
   * Get cached caption presets
   */
  async getCachedCaptions(): Promise<CaptionPreset[] | null> {
    try {
      const isValid = await this.isCacheValid('captions', 'caption-presets');
      if (!isValid) {
        return null;
      }

      const captions = await this.getData<CaptionPreset[]>('captions', 'caption-presets');
      if (captions) {
        console.log('✅ Using cached captions');
      }
      return captions;
    } catch (error) {
      console.warn('⚠️ Failed to get cached captions:', error);
      return null;
    }
  }

  /**
   * Store user preferences
   */
  async setUserPreference(key: string, value: any): Promise<void> {
    try {
      await this.storeData('metadata', `pref_${key}`, value);
    } catch (error) {
      console.warn('⚠️ Failed to store user preference:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreference<T>(key: string): Promise<T | null> {
    try {
      return await this.getData<T>('metadata', `pref_${key}`);
    } catch (error) {
      console.warn('⚠️ Failed to get user preference:', error);
      return null;
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['templates', 'captions', 'metadata'], 'readwrite');
      
      const clearPromises = [
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('templates').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('captions').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('metadata').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        })
      ];

      Promise.all(clearPromises)
        .then(() => {
          console.log('✅ Cache cleared successfully');
          resolve();
        })
        .catch(() => reject(new Error('Failed to clear cache')));
    });
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    templates: { cached: boolean; count: number };
    captions: { cached: boolean; count: number };
  }> {
    try {
      const [templates, captions] = await Promise.all([
        this.getCachedTemplates(),
        this.getCachedCaptions()
      ]);

      return {
        templates: {
          cached: templates !== null,
          count: templates?.length || 0
        },
        captions: {
          cached: captions !== null,
          count: captions?.length || 0
        }
      };
    } catch (error) {
      return {
        templates: { cached: false, count: 0 },
        captions: { cached: false, count: 0 }
      };
    }
  }
}

// Singleton instance
let cacheInstance: IndexedDBCache | null = null;

/**
 * Get or create the IndexedDB cache singleton
 */
export function getIndexedDBCache(): IndexedDBCache {
  if (!cacheInstance) {
    cacheInstance = new IndexedDBCache();
  }
  return cacheInstance;
}

// Export types
export type { MemeTemplate, CaptionPreset };
