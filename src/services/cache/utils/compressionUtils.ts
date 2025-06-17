
// Compression utilities for cache data
export interface CompressionResult {
  data: string;
  isCompressed: boolean;
  originalSize: number;
  compressedSize: number;
}

export class CacheCompressionUtils {
  private static readonly COMPRESSION_THRESHOLD = 1024; // 1KB threshold
  private static readonly COMPRESSION_RATIO_THRESHOLD = 0.8; // Only compress if we save at least 20%

  static shouldCompress(data: string): boolean {
    return data.length > this.COMPRESSION_THRESHOLD;
  }

  static async compress(data: string): Promise<CompressionResult> {
    const originalSize = data.length;
    
    if (!this.shouldCompress(data)) {
      return {
        data,
        isCompressed: false,
        originalSize,
        compressedSize: originalSize
      };
    }

    try {
      // Use built-in compression API if available
      if ('CompressionStream' in window) {
        const compressed = await this.compressWithStream(data);
        const compressionRatio = compressed.length / originalSize;
        
        // Only use compression if it provides meaningful space savings
        if (compressionRatio < this.COMPRESSION_RATIO_THRESHOLD) {
          return {
            data: compressed,
            isCompressed: true,
            originalSize,
            compressedSize: compressed.length
          };
        }
      }
      
      // Fallback to simple compression using btoa/atob
      const compressed = this.simpleCompress(data);
      const compressionRatio = compressed.length / originalSize;
      
      if (compressionRatio < this.COMPRESSION_RATIO_THRESHOLD) {
        return {
          data: compressed,
          isCompressed: true,
          originalSize,
          compressedSize: compressed.length
        };
      }
      
      // Return uncompressed if compression doesn't help
      return {
        data,
        isCompressed: false,
        originalSize,
        compressedSize: originalSize
      };
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return {
        data,
        isCompressed: false,
        originalSize,
        compressedSize: originalSize
      };
    }
  }

  static async decompress(result: CompressionResult): Promise<string> {
    if (!result.isCompressed) {
      return result.data;
    }

    try {
      // Use built-in decompression API if available
      if ('DecompressionStream' in window) {
        return await this.decompressWithStream(result.data);
      }
      
      // Fallback to simple decompression
      return this.simpleDecompress(result.data);
    } catch (error) {
      console.error('Decompression failed:', error);
      throw new Error('Failed to decompress cache data');
    }
  }

  private static async compressWithStream(data: string): Promise<string> {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];
    
    // Start compression
    writer.write(encoder.encode(data));
    writer.close();
    
    // Read compressed data
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(value);
      }
    }
    
    // Convert to base64 string
    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    return btoa(String.fromCharCode(...compressed));
  }

  private static async decompressWithStream(compressedData: string): Promise<string> {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    
    // Convert from base64
    const binaryString = atob(compressedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Start decompression
    writer.write(bytes);
    writer.close();
    
    // Read decompressed data
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(decoder.decode(value, { stream: true }));
      }
    }
    
    return chunks.join('');
  }

  private static simpleCompress(data: string): string {
    // Simple RLE-style compression for repeated patterns
    return data.replace(/(.)\1{3,}/g, (match, char) => {
      return `${char}${match.length}`;
    });
  }

  private static simpleDecompress(data: string): string {
    // Reverse simple compression
    return data.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }
}
