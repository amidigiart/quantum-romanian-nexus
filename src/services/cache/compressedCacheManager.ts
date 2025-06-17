
import { CacheEntry } from '@/types/cache';
import { CacheCompressionUtils, CompressionResult } from './utils/compressionUtils';

export class CompressedCacheManager {
  private compressionStats = {
    totalCompressed: 0,
    totalUncompressed: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0
  };

  async compressAndStore<T>(
    data: T,
    timestamp: number,
    ttl: number,
    accessCount: number,
    lastAccessed: number,
    tags: string[],
    priority: 'low' | 'medium' | 'high'
  ): Promise<CacheEntry<T | CompressionResult>> {
    const serializedData = JSON.stringify(data);
    const compressionResult = await CacheCompressionUtils.compress(serializedData);
    
    // Update compression stats
    if (compressionResult.isCompressed) {
      this.compressionStats.totalCompressed++;
      this.compressionStats.totalCompressedSize += compressionResult.compressedSize;
    } else {
      this.compressionStats.totalUncompressed++;
    }
    this.compressionStats.totalOriginalSize += compressionResult.originalSize;

    const entry: CacheEntry<T | CompressionResult> = {
      data: compressionResult.isCompressed ? compressionResult : data,
      timestamp,
      ttl,
      accessCount,
      lastAccessed,
      tags,
      priority,
      compression: {
        isCompressed: compressionResult.isCompressed,
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize
      }
    };

    return entry;
  }

  async decompressAndRetrieve<T>(entry: CacheEntry<T | CompressionResult>): Promise<T> {
    if (!entry.compression?.isCompressed) {
      return entry.data as T;
    }

    try {
      const compressionResult = entry.data as CompressionResult;
      const decompressedString = await CacheCompressionUtils.decompress(compressionResult);
      return JSON.parse(decompressedString) as T;
    } catch (error) {
      console.error('Failed to decompress cache entry:', error);
      throw new Error('Cache decompression failed');
    }
  }

  getCompressionStats() {
    const totalEntries = this.compressionStats.totalCompressed + this.compressionStats.totalUncompressed;
    const compressionRatio = totalEntries > 0 ? 
      this.compressionStats.totalCompressedSize / this.compressionStats.totalOriginalSize : 1;
    const spaceSaved = this.compressionStats.totalOriginalSize - this.compressionStats.totalCompressedSize;

    return {
      totalCompressed: this.compressionStats.totalCompressed,
      totalUncompressed: this.compressionStats.totalUncompressed,
      compressionRatio: compressionRatio,
      spaceSaved: Math.max(0, spaceSaved)
    };
  }

  resetCompressionStats() {
    this.compressionStats = {
      totalCompressed: 0,
      totalUncompressed: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0
    };
  }
}
