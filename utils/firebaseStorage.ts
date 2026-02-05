/**
 * Firebase Storage utilities for custom stamp uploads
 * Handles uploading images to Firebase Storage and retrieving URLs
 */

import { storage, isFirebaseEnabled } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, type UploadResult } from 'firebase/storage';
import { CustomStamp } from '../types';

const STAMPS_PATH = 'users/{userId}/stamps/{stampId}';

/**
 * Upload image file to Firebase Storage
 * @param file Image file to upload
 * @param userId Firebase user ID
 * @param stampId Custom stamp ID (UUID)
 * @returns Public download URL
 */
export async function uploadCustomStampToStorage(
  file: File,
  userId: string,
  stampId: string
): Promise<string> {
  if (!storage || !isFirebaseEnabled) {
    throw new Error('Firebase Storage is not enabled');
  }

  // Validate storage is properly initialized
  if (!storage.app) {
    throw new Error('Firebase Storage 未正確初始化，請檢查環境變數設定');
  }

  const storageRef = ref(storage, `users/${userId}/stamps/${stampId}`);
  
  try {
    const uploadResult: UploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (error: unknown) {
    console.error('Failed to upload custom stamp to Firebase Storage:', error);
    
    // Provide more specific error messages
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code;
      if (code === 'storage/unauthorized') {
        throw new Error('上傳失敗：權限不足，請確認 Firebase Storage 規則已正確設定');
      } else if (code === 'storage/quota-exceeded') {
        throw new Error('上傳失敗：儲存空間已滿');
      } else if (code === 'storage/unauthenticated') {
        throw new Error('上傳失敗：請先登入');
      }
    }
    
    throw new Error(`上傳失敗：${error instanceof Error ? error.message : '未知錯誤，請檢查 Firebase Storage 設定'}`);
  }
}

/**
 * Delete custom stamp from Firebase Storage
 * @param userId Firebase user ID
 * @param stampId Custom stamp ID
 */
export async function deleteCustomStampFromStorage(
  userId: string,
  stampId: string
): Promise<void> {
  if (!storage || !isFirebaseEnabled) {
    return; // Silently fail if Storage is not enabled
  }

  const storageRef = ref(storage, `users/${userId}/stamps/${stampId}`);
  
  try {
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore errors (file might not exist or already deleted)
    console.warn('Failed to delete custom stamp from Storage:', error);
  }
}

/**
 * Migrate Base64 custom stamps to Firebase Storage
 * Uploads all Base64 stamps for a user to Firebase Storage and returns updated stamps
 * @param stamps Map of custom stamps (some may be Base64)
 * @param userId Firebase user ID
 * @returns Updated stamps with Firebase URLs
 */
export async function migrateStampsToFirebase(
  stamps: Record<string, CustomStamp>,
  userId: string
): Promise<Record<string, CustomStamp>> {
  if (!storage || !isFirebaseEnabled) {
    return stamps; // Return unchanged if Storage is not enabled
  }

  const base64Stamps = Object.values(stamps).filter(s => s.storageType === 'base64');
  if (base64Stamps.length === 0) {
    return stamps; // No migration needed
  }

  const updatedStamps = { ...stamps };

  // Process each Base64 stamp
  for (const stamp of base64Stamps) {
    try {
      // Convert Base64 data URL to Blob
      const response = await fetch(stamp.imageData);
      const blob = await response.blob();
      
      // Create a File object from Blob
      const file = new File([blob], `${stamp.id}.png`, { type: stamp.mimeType });
      
      // Upload to Firebase Storage
      const firebaseURL = await uploadCustomStampToStorage(file, userId, stamp.id);
      
      // Update stamp metadata
      updatedStamps[stamp.id] = {
        ...stamp,
        imageData: firebaseURL,
        storageType: 'firebase',
        userId: userId,
      };
    } catch (error) {
      console.error(`Failed to migrate stamp ${stamp.id} to Firebase:`, error);
      // Keep original Base64 stamp if migration fails
    }
  }

  return updatedStamps;
}

/**
 * Check if Firebase Storage is available
 */
export function isStorageAvailable(): boolean {
  return Boolean(storage && isFirebaseEnabled);
}
