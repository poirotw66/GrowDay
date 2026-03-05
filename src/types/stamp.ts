/**
 * Custom stamp types.
 */

export interface CustomStamp {
  id: string;
  userId?: string;
  name: string;
  imageData: string;
  storageType: 'base64' | 'firebase';
  createdAt: string;
  fileSize: number;
  mimeType: string;
}
