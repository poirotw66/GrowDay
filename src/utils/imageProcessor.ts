/**
 * Image processing utilities for custom stamp uploads
 * Handles compression, validation, and format conversion
 */

const MAX_SIZE = 512; // Maximum width/height in pixels
const MAX_FILE_SIZE_BASE64 = 500 * 1024; // 500KB limit for Base64
const MAX_FILE_SIZE_FIREBASE = 2 * 1024 * 1024; // 2MB limit for Firebase
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];

export interface ProcessedImage {
  dataUrl: string;      // Base64 data URL
  fileSize: number;     // Size in bytes
  mimeType: string;     // image/png, etc.
  width: number;
  height: number;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `不支援的檔案格式。請上傳 PNG、JPG 或 SVG 檔案。`,
    };
  }

  // Check file size (before compression)
  if (file.size > MAX_FILE_SIZE_FIREBASE) {
    return {
      valid: false,
      error: `檔案太大（${formatFileSize(file.size)}）。請選擇小於 2MB 的圖片。`,
    };
  }

  return { valid: true };
}

/**
 * Compress and process image to Base64
 * Returns compressed image data URL
 */
export async function processImage(
  file: File,
  maxWidth: number = MAX_SIZE,
  maxHeight: number = MAX_SIZE,
  quality: number = 0.8
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // Handle SVG separately (no compression needed)
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({
          dataUrl,
          fileSize: file.size,
          mimeType: file.type,
          width: 512, // Default for SVG
          height: 512,
        });
      };
      reader.onerror = () => reject(new Error('無法讀取 SVG 檔案'));
      reader.readAsDataURL(file);
      return;
    }

    // Process raster images (PNG, JPG, WebP)
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('瀏覽器不支援圖片處理'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate scaling to fit within max dimensions while maintaining aspect ratio
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image to canvas (this performs the resize)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to data URL (PNG format for best quality)
        const mimeType = 'image/png'; // Always convert to PNG for consistency
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Check if compressed size is acceptable
        const base64Size = Math.ceil((dataUrl.length * 3) / 4); // Approximate Base64 size

        if (base64Size > MAX_FILE_SIZE_BASE64) {
          // Try again with lower quality
          if (quality > 0.5) {
            const lowerQuality = Math.max(0.5, quality - 0.1);
            const retryDataUrl = canvas.toDataURL(mimeType, lowerQuality);
            const retrySize = Math.ceil((retryDataUrl.length * 3) / 4);
            
            if (retrySize > MAX_FILE_SIZE_BASE64) {
              reject(new Error(`壓縮後的圖片仍太大（${formatFileSize(retrySize)}）。請選擇較小的圖片。`));
              return;
            }
            
            resolve({
              dataUrl: retryDataUrl,
              fileSize: retrySize,
              mimeType,
              width: canvas.width,
              height: canvas.height,
            });
            return;
          }
          
          reject(new Error(`壓縮後的圖片仍太大（${formatFileSize(base64Size)}）。請選擇較小的圖片。`));
          return;
        }

        resolve({
          dataUrl,
          fileSize: base64Size,
          mimeType,
          width: canvas.width,
          height: canvas.height,
        });
      } catch (error) {
        reject(new Error(`圖片處理失敗：${error instanceof Error ? error.message : '未知錯誤'}`));
      }
    };

    img.onerror = () => {
      reject(new Error('無法載入圖片檔案'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('無法讀取檔案'));
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
