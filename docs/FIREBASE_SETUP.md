# Firebase 設定（Google 登入 + 雲端存檔）

未設定 Firebase 時，GrowDay 仍可正常使用，資料僅存於本機。設定後可透過 Google 登入，並將進度同步到 Firestore（跨裝置）。

---

## 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點 **新增專案**，輸入專案名稱（例如 `growday`），依指示完成建立
3. 在專案總覽左側進入 **Authentication** → **Sign-in method** → 啟用 **Google**，儲存
4. 左側進入 **Firestore Database** → **建立資料庫** → 選 **正式環境** 或 **測試模式**（正式上線前請改為正式環境並設定規則）
5. 左側 **專案設定**（齒輪）→ **一般** → 往下找到 **您的應用程式** → 點 **</>**（網頁圖示）新增應用程式，註冊一個 Web app，記下 `firebaseConfig` 的數值

---

## 2. 環境變數

在專案根目錄建立 `.env.local`（不會被 git 追蹤），內容範例：

```env
VITE_FIREBASE_API_KEY=你的 apiKey
VITE_FIREBASE_AUTH_DOMAIN=你的專案.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的專案 ID
VITE_FIREBASE_STORAGE_BUCKET=你的專案.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=數字
VITE_FIREBASE_APP_ID=你的 appId
```

**重要**：
- 不要使用引號包圍值（例如：`"growday-87b03.firebasestorage.app"` ❌）
- 不要使用逗號結尾（例如：`growday-87b03.firebasestorage.app,` ❌）
- 正確格式：`VITE_FIREBASE_STORAGE_BUCKET=growday-87b03.firebasestorage.app` ✅
- Storage Bucket 格式通常是 `專案ID.firebasestorage.app`（不是 `.appspot.com`）

可從 `.env.example` 複製後貼上，再從 Firebase 主控台的「應用程式設定」中填入對應值。

---

## 3. Firestore 安全規則

在 Firestore → **規則** 中設定為「僅允許已登入使用者讀寫自己的 `users/{userId}` 文件」：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

儲存後，只有該使用者能讀寫自己的 `users/{userId}` 文件。

---

## 3.5. Firebase Storage 安全規則（自訂印章功能）

### 步驟 1：啟用 Firebase Storage

如果尚未啟用 Storage：

1. 在 Firebase Console 左側選單中，點選 **Storage**（儲存空間）
2. 如果看到「開始使用」按鈕，點擊它
3. 選擇 **正式環境** 或 **測試模式**（建議選擇正式環境）
4. 選擇儲存位置（建議選擇與 Firestore 相同的位置，例如 `asia-east1`）
5. 點擊 **完成**

### 步驟 2：設定 Storage 安全規則

1. 在 **Storage** 頁面中，點擊頂部的 **規則** 標籤（Rules tab）
2. 如果看到預設規則，將其替換為以下內容：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Custom stamps: users/{userId}/stamps/{stampId}
    match /users/{userId}/stamps/{stampId} {
      // Only the user can upload/delete their own stamps
      allow write: if request.auth != null && request.auth.uid == userId;
      // Public read (for calendar display)
      allow read: if true;
    }
  }
}
```

3. 點擊 **發布**（Publish）按鈕儲存規則

**找不到規則標籤？**
- 確認 Storage 已啟用（步驟 1）
- 確認已升級到 Blaze 方案（見下方說明）
- 重新整理頁面或清除瀏覽器快取

---

### 重要：Blaze 方案需求

**從 2026 年 2 月 3 日起**，Firebase Storage 需要升級到 **Blaze 方案**（隨用隨付）才能使用。

**升級步驟**：
1. 在 Firebase Console → **使用量和帳單** → **方案**
2. 點擊 **升級** 到 Blaze 方案
3. 輸入付款資訊（不會立即收費，只有超出免費額度才付費）

**免費額度**（升級後仍適用）：
- 儲存空間：5 GB（一次性總額）
- 下載流量：1 GB/天
- 上傳操作：20,000 次/天

**設定預算警示**（強烈建議）：
1. 在 Firebase Console → **使用量和帳單** → **預算與警示**
2. 點擊 **新增預算警示**
3. 設定預算上限（例如 $1/月）
4. 設定通知 Email
5. 儲存後，當使用量接近預算時會收到通知

**注意**：Blaze 方案是「隨用隨付」，沒有最低消費。只要在免費額度內就不會收費。

---

## 3.6. 安全性說明 ⚠️

### Firebase 配置信息的安全性

**重要理解**：Firebase 的 API Key 和配置信息在客戶端應用中是**公開可見**的，這是**正常且預期的設計**。

#### 為什麼這是安全的？

1. **真正的安全來自 Security Rules**：
   - Firestore 和 Storage 的安全規則確保只有授權用戶才能訪問數據
   - 即使有人拿到你的 API Key，也無法繞過安全規則
   - 你的安全規則已經設置為：`只有登入用戶才能讀寫自己的數據`

2. **API Key 的限制**：
   - Firebase API Key 本身不是密鑰，它只是識別你的應用
   - 真正的權限控制通過 Security Rules 實現
   - 即使洩漏，也無法直接訪問其他用戶的數據

#### 潛在風險和緩解措施

**風險 1：API 濫用（發送大量請求）**
- **影響**：可能導致費用增加
- **緩解措施**：
  - ✅ 設置 Firebase 預算警示（見下方）
  - ✅ 使用 Firebase App Check（進階保護，可選）
  - ✅ 監控使用量

**風險 2：未授權訪問**
- **影響**：理論上可能嘗試訪問數據
- **緩解措施**：
  - ✅ 嚴格的安全規則（已設置）
  - ✅ 只允許登入用戶訪問自己的數據
  - ✅ 定期檢查安全規則

#### 最佳實踐

1. **✅ 已實施**：
   - 嚴格的安全規則
   - 用戶數據隔離（每個用戶只能訪問自己的數據）
   - 預算警示設置

2. **建議額外措施**（可選）：
   - 啟用 Firebase App Check（需要額外配置）
   - 定期檢查 Firebase Console 的使用量
   - 如果發現異常，可以重新生成 API Key

#### GitHub Secrets 的安全性

- GitHub Secrets 是**加密存儲**的
- 只有有權限的協作者才能查看
- 在 Actions 運行時才會解密使用
- **不會**出現在代碼、日誌或構建產物中

**結論**：使用 GitHub Secrets 存儲 Firebase 配置是**安全且推薦的做法**。真正的安全來自於正確設置的 Security Rules，而不是隱藏 API Key。

---

## 4. 授權網域（重要！部署到 GitHub Pages 必填）

在 **Authentication** → **設定** → **授權網域** 中，確認已加入：

- `localhost`（本機開發）
- `username.github.io`（你的 GitHub Pages 域名，例如 `yourusername.github.io`）
- 如果使用自訂網域，也要加入

**重要**：如果沒有添加 GitHub Pages 域名，登入功能將無法在生產環境中工作！

---

## 4.5. GitHub Pages 部署設定

### 步驟 1：設置 GitHub Secrets

為了在 GitHub Pages 部署時使用 Firebase，需要在 GitHub Repository 中設置 Secrets：

1. 前往你的 GitHub Repository
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret**，添加以下 Secrets：

   - `VITE_FIREBASE_API_KEY`：你的 Firebase API Key
   - `VITE_FIREBASE_AUTH_DOMAIN`：你的 Firebase Auth Domain（例如 `your-project.firebaseapp.com`）
   - `VITE_FIREBASE_PROJECT_ID`：你的 Firebase Project ID
   - `VITE_FIREBASE_STORAGE_BUCKET`：你的 Firebase Storage Bucket（例如 `your-project.firebasestorage.app`）
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`：你的 Firebase Messaging Sender ID
   - `VITE_FIREBASE_APP_ID`：你的 Firebase App ID

4. 每個 Secret 的名稱必須**完全匹配**（包括 `VITE_` 前綴）
5. 值不需要引號，直接貼上即可

### 步驟 2：確認部署工作流程

`.github/workflows/deploy.yml` 已經配置好從 Secrets 讀取環境變數。推送代碼到 `main` 分支後，GitHub Actions 會自動：

1. 從 Secrets 讀取 Firebase 配置
2. 在構建時注入環境變數
3. 部署到 GitHub Pages

### 步驟 3：驗證部署

部署完成後，訪問你的 GitHub Pages 網站，檢查：

1. 瀏覽器控制台是否有 Firebase 相關錯誤
2. 「Google 登入」按鈕是否顯示
3. 點擊登入是否能正常彈出 Google 登入視窗

如果登入失敗，檢查：
- Firebase Console → Authentication → 授權網域是否包含你的 GitHub Pages 域名
- GitHub Secrets 是否正確設置
- 瀏覽器控制台的錯誤訊息

---

## 5. 本機測試

1. `npm install` 後執行 `npm run dev`
2. 點選 **Google 登入**，完成登入
3. 進度會自動寫入 Firestore 的 `users/{uid}` 文件（欄位 `gameState`、`updatedAt`）
4. 換裝置或清除本機後再登入同一 Google 帳號，應會載入雲端進度

---

## 6. 未設定時的行為

若未設定 `VITE_FIREBASE_*` 或未建立 `.env.local`：

- 不會出現「Google 登入」按鈕
- 仍可照常使用，資料僅存於瀏覽器 localStorage
- 之後補上 Firebase 設定並重新建置後，登入與雲端同步即會啟用
