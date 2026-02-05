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

## 4. 授權網域（若部署到自訂網域）

在 **Authentication** → **設定** → **授權網域** 中，確認已加入：

- `localhost`（本機開發）
- 部署後的網域（例如 `username.github.io` 或自訂網域）

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
