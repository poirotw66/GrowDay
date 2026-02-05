import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check, Cloud } from 'lucide-react';
import { CustomStamp } from '../types';
import { processImage, validateImageFile, formatFileSize, generateUUID } from '../utils/imageProcessor';
import { uploadCustomStampToStorage, isStorageAvailable } from '../utils/firebaseStorage';

interface CustomStampUploaderProps {
  onUpload: (stamp: CustomStamp) => void;
  onClose: () => void;
  existingStamps?: Record<string, CustomStamp>;
  userId?: string | null; // Firebase user ID
  isFirebaseEnabled?: boolean;
}

// Limit: 5 stamps for logged-in users, 5 for guests (same limit for simplicity)
const MAX_CUSTOM_STAMPS = 5;

const CustomStampUploader: React.FC<CustomStampUploaderProps> = ({
  onUpload,
  onClose,
  existingStamps = {},
  userId = null,
  isFirebaseEnabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stampName, setStampName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const useFirebase = isFirebaseEnabled && isStorageAvailable() && userId;

  const existingCount = Object.keys(existingStamps).length;
  const canUpload = existingCount < MAX_CUSTOM_STAMPS;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!canUpload) {
      setError(`最多只能上傳 ${MAX_CUSTOM_STAMPS} 個自訂印章`);
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [canUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUpload) {
      setError(`最多只能上傳 ${MAX_CUSTOM_STAMPS} 個自訂印章`);
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [canUpload]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSelectedFile(file);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '檔案驗證失敗');
      setSelectedFile(null);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;

    setProcessing(true);
    setError(null);
    setUploadProgress('');

    try {
      const stampId = generateUUID();
      let imageData: string;
      let storageType: 'base64' | 'firebase';
      let finalFileSize: number;

      if (useFirebase && userId) {
        // Upload to Firebase Storage
        setUploadProgress('正在上傳到雲端...');
        
        // For Firebase, we can upload the original file (or compressed version)
        // Compress first to save storage space
        const processed = await processImage(selectedFile);
        
        // Convert Base64 to Blob for upload
        const response = await fetch(processed.dataUrl);
        const blob = await response.blob();
        const fileToUpload = new File([blob], `${stampId}.png`, { type: processed.mimeType });
        
        imageData = await uploadCustomStampToStorage(fileToUpload, userId, stampId);
        storageType = 'firebase';
        finalFileSize = processed.fileSize;
        setUploadProgress('上傳完成！');
      } else {
        // Use Base64 for non-logged-in users
        setUploadProgress('正在處理圖片...');
        const processed = await processImage(selectedFile);
        imageData = processed.dataUrl;
        storageType = 'base64';
        finalFileSize = processed.fileSize;
        setUploadProgress('處理完成！');
      }

      // Create CustomStamp object
      const stamp: CustomStamp = {
        id: stampId,
        name: stampName.trim() || `自訂印章 ${existingCount + 1}`,
        imageData,
        storageType,
        createdAt: new Date().toISOString(),
        fileSize: finalFileSize,
        mimeType: selectedFile.type,
        userId: userId || undefined,
      };

      // Call parent callback
      onUpload(stamp);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setStampName('');
      setProcessing(false);
      setUploadProgress('');
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗，請重試');
      setProcessing(false);
      setUploadProgress('');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setStampName('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!canUpload) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">上傳自訂印章</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors duration-200 cursor-pointer"
              aria-label="關閉"
            >
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              已達到自訂印章上限（{MAX_CUSTOM_STAMPS} 個）
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              請先刪除現有的自訂印章後再上傳新的
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">上傳自訂印章</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Upload Area */}
        {!preview ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 cursor-pointer
              ${dragActive
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary-light'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload
              size={48}
              className={`mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
            />
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
              拖放圖片到此處，或點擊選擇檔案
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              支援 PNG、JPG、SVG 格式，最大 2MB
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              圖片會自動壓縮至 512x512px
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-center aspect-square max-h-64">
                <img
                  src={preview}
                  alt="預覽"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {selectedFile && (
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                印章名稱（選填）
              </label>
              <input
                type="text"
                value={stampName}
                onChange={(e) => setStampName(e.target.value)}
                placeholder={`自訂印章 ${existingCount + 1}`}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={20}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={processing}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                重新選擇
              </button>
              <button
                onClick={handleUpload}
                disabled={processing}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-dark transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {uploadProgress || '處理中...'}
                  </>
                ) : (
                  <>
                    {useFirebase ? <Cloud size={16} /> : <Check size={16} />}
                    確認上傳
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-xs text-slate-500 dark:text-slate-400">
          <p className="mb-1">💡 提示：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>圖片會自動壓縮以節省空間</li>
            <li>建議使用透明背景的 PNG 圖片效果最佳</li>
            <li>目前可上傳 {MAX_CUSTOM_STAMPS - existingCount} 個自訂印章</li>
            {useFirebase && (
              <li className="text-primary dark:text-primary-light font-medium">
                ☁️ 已登入：圖片將上傳到雲端，可跨裝置同步
              </li>
            )}
            {!useFirebase && isFirebaseEnabled && (
              <li className="text-amber-600 dark:text-amber-400">
                ⚠️ 未登入：圖片僅存於本機，登入後可同步到雲端
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomStampUploader;
