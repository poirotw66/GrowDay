# 自訂上傳印章功能 - 技術規劃

## 📋 功能概述

允許使用者上傳圖片檔案（PNG、JPG、SVG）作為習慣打卡印章，取代預設的 Lucide Icons。

---

## 🎯 功能需求

### 核心功能
1. **圖片上傳**：支援 PNG、JPG、SVG 格式
2. **圖片預覽**：上傳前後可預覽
3. **圖片管理**：查看、刪除已上傳的自訂印章
4. **印章選擇**：在設定中選擇自訂印章或預設圖標
5. **資料同步**：自訂印章需同步到 Firebase Storage（已登入用戶）

### 使用者流程
1. 進入「設定」→「更換打卡樣式」
2. 點擊「上傳自訂印章」按鈕
3. 選擇圖片檔案（支援拖放）
4. 預覽並確認上傳
5. 自動加入印章選單，可立即使用
6. 在日曆中顯示自訂印章

---

## 🏗️ 技術架構

### 1. 資料結構擴充

#### `types.ts` 新增

```typescript
// 自訂印章定義
export interface CustomStamp {
  id: string;              // 唯一 ID（UUID）
  userId?: string;        // Firebase UID（已登入用戶）
  name: string;           // 使用者自訂名稱（選填）
  imageData: string;      // Base64 或 Firebase Storage URL
  storageType: 'base64' | 'firebase';  // 儲存方式
  createdAt: string;      // ISO 日期字串
  fileSize: number;       // 檔案大小（bytes）
  mimeType: string;       // image/png, image/jpeg, image/svg+xml
}

// GameState 擴充
export interface GameState {
  // ... 現有欄位
  customStamps?: Record<string, CustomStamp>;  // Map<stampId, CustomStamp>
}
```

#### `Habit` 介面調整

```typescript
export interface Habit {
  // ... 現有欄位
  stampIcon: string;  // 保持不變，但可以是 'custom:uuid' 格式
  // 或新增 stampType: 'builtin' | 'custom'
  // stampCustomId?: string;  // 當 stampType === 'custom' 時使用
}
```

**建議方案**：使用 `stampIcon` 前綴區分
- 預設圖標：`'star'`, `'heart'`, `'sprout'` 等
- 自訂印章：`'custom:abc123'`（`abc123` 為 CustomStamp.id）

---

### 2. 儲存策略

#### 方案 A：Base64 + localStorage（未登入用戶）
- **優點**：簡單、無需後端、離線可用
- **缺點**：localStorage 限制 5-10MB、無法跨裝置同步
- **適用**：未登入用戶、小檔案（< 500KB）

#### 方案 B：Firebase Storage（已登入用戶）
- **優點**：無大小限制、跨裝置同步、CDN 加速
- **缺點**：需要 Firebase 設定、需要網路連線
- **適用**：已登入用戶、大檔案

#### 混合方案（推薦）
```typescript
// 判斷邏輯
if (isFirebaseEnabled && user) {
  // 上傳到 Firebase Storage
  // 儲存 URL 到 Firestore
} else {
  // 轉換為 Base64
  // 儲存到 localStorage + GameState
}
```

---

### 3. 圖片處理

#### 前端處理流程

```typescript
// 1. 檔案驗證
- 格式：PNG, JPG, SVG
- 大小：< 2MB（Base64）或 < 5MB（Firebase）
- 尺寸：建議 512x512px 以內（自動縮放）

// 2. 圖片優化
- 壓縮（使用 canvas API）
- 轉換為 Base64（未登入）或上傳到 Firebase Storage（已登入）

// 3. 儲存
- 生成 UUID
- 建立 CustomStamp 物件
- 加入 GameState.customStamps
```

#### 圖片壓縮工具

```typescript
// utils/imageProcessor.ts
export async function compressImage(
  file: File,
  maxWidth: number = 512,
  maxHeight: number = 512,
  quality: number = 0.8
): Promise<string> {
  // 使用 Canvas API 壓縮圖片
  // 返回 Base64 字串
}

export async function uploadToFirebaseStorage(
  file: File,
  userId: string,
  stampId: string
): Promise<string> {
  // 上傳到 Firebase Storage
  // 返回公開 URL
}
```

---

### 4. UI 元件

#### 新增元件：`CustomStampUploader.tsx`

```typescript
interface CustomStampUploaderProps {
  onUpload: (stamp: CustomStamp) => void;
  onClose: () => void;
}

// 功能：
// - 拖放上傳區域
// - 檔案選擇器
// - 圖片預覽
// - 名稱輸入（選填）
// - 上傳進度（Firebase）
// - 錯誤處理
```

#### 修改元件：`SettingsDropdown.tsx`

```typescript
// 在「更換打卡樣式」區塊新增：
// 1. 「上傳自訂印章」按鈕
// 2. 自訂印章網格顯示（類似現有圖標網格）
// 3. 刪除自訂印章功能
```

#### 修改元件：`CalendarView.tsx` 與 `DailyStampModal.tsx`

```typescript
// 渲染邏輯調整：
const renderStamp = (iconId: string) => {
  if (iconId.startsWith('custom:')) {
    const stampId = iconId.replace('custom:', '');
    const customStamp = gameState.customStamps?.[stampId];
    if (customStamp) {
      return <img src={customStamp.imageData} alt={customStamp.name || '自訂印章'} />;
    }
  }
  // 使用預設 LucideIcon
  const Icon = STAMP_ICONS[iconId] || Star;
  return <Icon size={28} />;
};
```

---

## 🔧 技術難點與解決方案

### 難點 1：圖片格式與大小限制

**問題**：
- localStorage 限制 5-10MB
- Base64 編碼會增加約 33% 大小
- 大圖片影響效能

**解決方案**：
1. **強制壓縮**：上傳前自動壓縮到 512x512px
2. **格式轉換**：統一轉為 WebP（瀏覽器支援）或 PNG
3. **大小限制**：
   - Base64：< 500KB（壓縮後）
   - Firebase：< 2MB（原始檔案）

```typescript
// 壓縮範例
const MAX_SIZE = 512;
const MAX_FILE_SIZE_BASE64 = 500 * 1024; // 500KB

async function processImage(file: File): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      // 計算縮放比例
      const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/png', 0.8);
      resolve(base64);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

---

### 難點 2：Firebase Storage 設定與權限

**問題**：
- 需要設定 Firebase Storage 規則
- 需要處理公開/私有存取
- 跨域（CORS）設定

**解決方案**：

#### Firebase Storage 規則

```javascript
// firebase/storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 自訂印章：users/{userId}/stamps/{stampId}
    match /users/{userId}/stamps/{stampId} {
      // 僅允許該用戶上傳/刪除
      allow write: if request.auth != null && request.auth.uid == userId;
      // 公開讀取（用於日曆顯示）
      allow read: if true;
    }
  }
}
```

#### 上傳實作

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadCustomStamp(
  file: File,
  userId: string,
  stampId: string
): Promise<string> {
  const storage = getStorage();
  const storageRef = ref(storage, `users/${userId}/stamps/${stampId}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
```

---

### 難點 3：資料同步與一致性

**問題**：
- 未登入用戶：Base64 儲存在 localStorage
- 已登入用戶：URL 儲存在 Firestore
- 切換登入狀態時需要遷移資料

**解決方案**：

#### 遷移策略

```typescript
// hooks/useCustomStamps.ts
export function useCustomStamps() {
  const { user, isFirebaseEnabled } = useAuth();
  const { gameState, setGameState } = useHabitEngine();
  
  // 登入時遷移 Base64 → Firebase Storage
  useEffect(() => {
    if (user && gameState.customStamps) {
      const base64Stamps = Object.values(gameState.customStamps)
        .filter(s => s.storageType === 'base64');
      
      if (base64Stamps.length > 0) {
        migrateStampsToFirebase(base64Stamps, user.uid);
      }
    }
  }, [user]);
  
  async function migrateStampsToFirebase(
    stamps: CustomStamp[],
    userId: string
  ) {
    // 1. 上傳每個 Base64 圖片到 Firebase Storage
    // 2. 更新 CustomStamp.storageType = 'firebase'
    // 3. 更新 CustomStamp.imageData = Firebase URL
    // 4. 儲存到 Firestore
  }
}
```

---

### 難點 4：效能優化

**問題**：
- 多個自訂印章載入慢
- Base64 圖片渲染效能差
- 日曆大量渲染時卡頓

**解決方案**：

1. **圖片快取**：
   ```typescript
   // 使用 Map 快取已載入的圖片
   const imageCache = new Map<string, HTMLImageElement>();
   ```

2. **延遲載入**：
   ```typescript
   // 只在可見時載入圖片
   <img loading="lazy" src={stamp.imageData} />
   ```

3. **縮圖預覽**：
   ```typescript
   // 在選單中使用縮圖（64x64px）
   // 在日曆中使用完整尺寸（28x28px）
   ```

4. **Web Worker 處理**：
   ```typescript
   // 圖片壓縮在 Web Worker 中執行，避免阻塞 UI
   ```

---

### 難點 5：跨裝置同步

**問題**：
- 未登入用戶無法同步
- 已登入用戶需要確保 Firestore 與 Storage 同步

**解決方案**：

```typescript
// Firestore 結構
{
  gameState: {
    customStamps: {
      'stamp-123': {
        id: 'stamp-123',
        name: '我的印章',
        imageData: 'https://firebasestorage.../stamp-123.png',  // Firebase URL
        storageType: 'firebase',
        createdAt: '2026-02-02T...',
        // 不儲存 Base64（太大）
      }
    }
  }
}

// 載入時：
// 1. 從 Firestore 讀取 customStamps（僅 metadata + URL）
// 2. 圖片從 Firebase Storage 載入（CDN 快取）
```

---

## 📊 可行性評估

### ✅ 高度可行

1. **技術成熟度**：所有技術（Canvas API、Firebase Storage、Base64）都很成熟
2. **現有架構支援**：GameState 可擴充，Firebase 已設定
3. **使用者體驗**：符合使用者需求，提升個人化

### ⚠️ 需要注意

1. **儲存成本**：
   - **Firebase Storage**：
     - 免費額度：**5 GB**（一次性總額，非每月）
     - 超出後：**$0.10/GB**（需升級到 Blaze 方案）
     - ⚠️ **重要**：2026 年 2 月 3 日起，Firebase Storage 需要升級到 Blaze 方案才能使用（但免費額度仍適用）
   - **Firestore**：
     - 免費額度：**1 GiB 儲存**、**50,000 讀取/天**、**20,000 寫入/天**
     - 自訂印章 metadata 很小（< 1KB），幾乎不影響
   - **建議限制**：每個用戶最多 5 個自訂印章（每個 < 500KB，總計 < 2.5MB）

2. **效能影響**：
   - Base64 圖片會增加 GameState 大小
   - 需要壓縮與快取機制

3. **瀏覽器相容性**：
   - Canvas API：IE 11+（已淘汰，不影響）
   - File API：現代瀏覽器皆支援

### ❌ 潛在風險

1. **惡意檔案上傳**：
   - **風險**：上傳惡意 SVG（XSS）或超大檔案
   - **緩解**：檔案驗證、大小限制、SVG 清理

2. **資料遺失**：
   - **風險**：未登入用戶清除瀏覽器資料
   - **緩解**：提示匯出備份、鼓勵登入

---

## 🚀 實作步驟

### Phase 1：基礎功能（MVP）
1. ✅ 擴充 `types.ts`（CustomStamp 介面）
2. ✅ 建立 `utils/imageProcessor.ts`（圖片壓縮）
3. ✅ 建立 `components/CustomStampUploader.tsx`
4. ✅ 修改 `SettingsDropdown.tsx`（加入上傳按鈕）
5. ✅ 修改 `CalendarView.tsx`（支援自訂印章渲染）

### Phase 2：Firebase 整合
6. ✅ 設定 Firebase Storage 規則
7. ✅ 建立 `utils/firebaseStorage.ts`（上傳/下載）
8. ✅ 修改 `hooks/useHabitEngine.ts`（同步邏輯）
9. ✅ 實作 Base64 → Firebase 遷移

### Phase 3：優化與測試
10. ✅ 圖片快取機制
11. ✅ 錯誤處理與使用者提示
12. ✅ 效能測試與優化
13. ✅ 跨裝置同步測試

---

## 📝 檔案清單

### 新增檔案
- `components/CustomStampUploader.tsx` - 上傳元件
- `components/CustomStampManager.tsx` - 管理元件（選填）
- `utils/imageProcessor.ts` - 圖片處理工具
- `utils/firebaseStorage.ts` - Firebase Storage 工具
- `hooks/useCustomStamps.ts` - 自訂印章 Hook（選填）

### 修改檔案
- `types.ts` - 新增 CustomStamp 介面
- `components/SettingsDropdown.tsx` - 加入上傳功能
- `components/CalendarView.tsx` - 支援自訂印章渲染
- `components/DailyStampModal.tsx` - 支援自訂印章顯示
- `hooks/useHabitEngine.ts` - 同步邏輯
- `firebase.ts` - 新增 Storage 初始化（如需要）

---

## 🎨 UI/UX 建議

### 上傳流程
1. **拖放區域**：大面積、視覺明確
2. **預覽**：即時預覽，可取消
3. **進度條**：Firebase 上傳時顯示
4. **錯誤提示**：檔案格式錯誤、大小超限等

### 印章選擇
1. **網格顯示**：與現有圖標一致
2. **刪除功能**：長按或右鍵選單
3. **名稱顯示**：hover 時顯示自訂名稱

---

## 💰 Firebase 成本分析（免費方案）

### Firebase Storage

| 項目 | 免費額度 | 超出後費用 |
|------|---------|-----------|
| **儲存空間** | 5 GB（一次性總額） | $0.10/GB |
| **下載流量** | 1 GB/天 | $0.12/GB |
| **上傳操作** | 20,000 次/天 | $0.05/10,000 次 |

**成本估算（假設 100 個活躍用戶）：**
- 每個用戶 5 個印章 × 500KB = 2.5MB/用戶
- 總計：100 × 2.5MB = **250MB**（遠低於 5GB 免費額度 ✅）
- 下載流量：假設每個用戶每天查看日曆 5 次，每次載入 5 個印章縮圖（64x64px，約 10KB）
  - 100 用戶 × 5 次 × 5KB = **2.5MB/天**（遠低於 1GB/天 ✅）

**結論**：在免費額度內，完全不需要付費。

### Firestore

| 項目 | 免費額度 | 超出後費用 |
|------|---------|-----------|
| **儲存空間** | 1 GiB | $0.18/GiB/月 |
| **讀取** | 50,000 次/天 | $0.03/100,000 次 |
| **寫入** | 20,000 次/天 | $0.09/100,000 次 |

**成本估算：**
- 每個 CustomStamp metadata：約 500 bytes（ID、名稱、URL、時間戳）
- 100 用戶 × 5 印章 = 500 個印章 = **250KB**（遠低於 1 GiB ✅）
- 讀取：載入 GameState 時讀取一次，幾乎不影響
- 寫入：上傳新印章時寫入一次，遠低於 20,000/天 ✅

**結論**：Firestore 成本可忽略不計。

### ⚠️ 重要提醒：2026 年 2 月 3 日變更

Firebase Storage 從 2026 年 2 月 3 日起，**需要升級到 Blaze 方案**才能使用 Storage 功能。但這不意味著會收費：

- ✅ **免費額度仍然適用**：5GB 儲存、1GB/天下載流量
- ✅ **只有超出免費額度才付費**
- ✅ **Blaze 方案是「隨用隨付」**，沒有最低消費

**建議**：
1. 升級到 Blaze 方案（不會立即收費）
2. 設定預算警示（例如 $1/月），避免意外超支
3. 監控使用量，確保在免費額度內

---

## 📈 後續擴充

1. **印章編輯**：裁剪、旋轉、濾鏡
2. **印章分享**：匯出/匯入自訂印章
3. **印章商店**：官方提供的精美印章
4. **動態印章**：GIF 動畫支援（需評估效能）

---

## ✅ 總結

**可行性**：⭐⭐⭐⭐⭐（5/5）

**技術難度**：中等（需要 Firebase Storage 設定與圖片處理）

**開發時間預估**：
- MVP（Base64 + localStorage）：2-3 天
- Firebase 整合：1-2 天
- 優化與測試：1-2 天
- **總計**：4-7 天

**建議優先順序**：
1. 先實作 Base64 + localStorage 版本（快速驗證）
2. 再整合 Firebase Storage（跨裝置同步）
3. 最後優化效能與 UX

**成本結論**：
- ✅ **Firebase 免費方案完全足夠**：100 個用戶以內幾乎不會超出免費額度
- ✅ **需要升級到 Blaze 方案**（2026/2/3 起），但免費額度仍適用
- ✅ **建議設定預算警示**（$1/月）作為安全網
- ✅ **每個用戶限制 5 個印章**可確保長期使用在免費額度內
