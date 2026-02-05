# GitHub Pages 登入問題排查指南

## 🔍 診斷步驟

### 步驟 1：檢查瀏覽器控制台

1. 打開你的 GitHub Pages 網站
2. 按 `F12` 或右鍵 → **檢查** → **Console**
3. 查看是否有 Firebase 相關錯誤

**常見錯誤**：
- `Firebase: Error (auth/unauthorized-domain)` → 授權域名未設置
- `Firebase: Error (auth/api-key-not-valid)` → API Key 錯誤
- `Firestore is not initialized` → 環境變數未正確注入

### 步驟 2：檢查 Firebase 配置是否載入

在瀏覽器控制台執行：

```javascript
// 檢查環境變數是否注入
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '已設置' : '未設置');
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '已設置' : '未設置');
```

如果顯示「未設置」，說明環境變數沒有正確注入到構建中。

### 步驟 3：檢查 GitHub Secrets

1. 前往你的 GitHub Repository
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 確認以下 Secrets 都存在：
   - ✅ `VITE_FIREBASE_API_KEY`
   - ✅ `VITE_FIREBASE_AUTH_DOMAIN`
   - ✅ `VITE_FIREBASE_PROJECT_ID`
   - ✅ `VITE_FIREBASE_STORAGE_BUCKET`
   - ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - ✅ `VITE_FIREBASE_APP_ID`

**重要**：
- Secret 名稱必須**完全匹配**（包括 `VITE_` 前綴）
- 值不需要引號
- 不要有空格或換行

### 步驟 4：檢查 GitHub Actions 構建日誌

1. 前往你的 GitHub Repository
2. 點擊 **Actions** 標籤
3. 點擊最新的部署工作流程
4. 展開 **Build** 步驟
5. 檢查是否有錯誤訊息

**常見問題**：
- Secrets 未設置 → 會顯示 `${{ secrets.VITE_FIREBASE_API_KEY }}` 為空
- 構建失敗 → 檢查錯誤訊息

### 步驟 5：檢查 Firebase 授權域名

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案
3. 進入 **Authentication** → **設定** → **授權網域**
4. 確認包含：
   - ✅ `localhost`（開發用）
   - ✅ `你的用戶名.github.io`（例如：`cfh00896102.github.io`）
   - ✅ 如果使用自訂域名，也要添加

**重要**：GitHub Pages 的域名格式是 `username.github.io`，不是 `username.github.io/repo-name`。

### 步驟 6：驗證構建產物

構建完成後，環境變數會被注入到 JavaScript 代碼中。檢查方法：

1. 在 GitHub Pages 網站上，按 `F12` → **Network**
2. 重新載入頁面
3. 找到主要的 JavaScript 文件（例如 `index-xxxxx.js`）
4. 點擊該文件 → **Response**
5. 搜索 `VITE_FIREBASE_API_KEY`
6. 如果找到，應該能看到實際的 API Key 值

如果找不到，說明環境變數沒有正確注入。

## 🛠️ 常見問題解決方案

### 問題 1：GitHub Secrets 設置後仍無法登入

**可能原因**：
- Secrets 名稱錯誤
- 值包含引號或空格
- 構建時 Secrets 未正確讀取

**解決方案**：
1. 刪除所有 Secrets
2. 重新添加，確保名稱完全匹配
3. 值直接貼上，不要添加引號
4. 重新觸發部署

### 問題 2：Firebase 初始化失敗

**可能原因**：
- 環境變數為空或格式錯誤
- API Key 或 Project ID 錯誤

**解決方案**：
1. 檢查 `.env` 文件中的值是否正確
2. 確認 GitHub Secrets 的值與 `.env` 一致
3. 重新構建和部署

### 問題 3：授權域名錯誤

**錯誤訊息**：`auth/unauthorized-domain`

**解決方案**：
1. 確認 GitHub Pages 的完整域名（例如：`username.github.io`）
2. 在 Firebase Console 中添加該域名
3. 等待幾分鐘讓更改生效
4. 清除瀏覽器快取後重試

### 問題 4：構建成功但登入按鈕不顯示

**可能原因**：
- Firebase 未正確初始化
- `isFirebaseEnabled` 為 `false`

**解決方案**：
1. 檢查瀏覽器控制台的錯誤訊息
2. 確認環境變數是否正確注入
3. 檢查 `firebase.ts` 中的初始化邏輯

## 📝 檢查清單

在部署前，確認以下項目：

- [ ] GitHub Secrets 已正確設置（6 個 Secrets）
- [ ] Secret 名稱完全匹配（包括 `VITE_` 前綴）
- [ ] Secret 值不包含引號
- [ ] Firebase 授權域名包含 GitHub Pages 域名
- [ ] GitHub Actions 構建成功完成
- [ ] 瀏覽器控制台沒有 Firebase 錯誤
- [ ] 環境變數已注入到構建產物中

## 🆘 如果問題仍然存在

1. **檢查構建日誌**：
   - 前往 GitHub Actions
   - 查看構建步驟的完整日誌
   - 尋找錯誤或警告訊息

2. **本地測試**：
   ```bash
   # 設置環境變數
   export VITE_FIREBASE_API_KEY=你的API_KEY
   export VITE_FIREBASE_PROJECT_ID=你的PROJECT_ID
   # ... 其他變數
   
   # 構建
   npm run build
   
   # 預覽
   npm run preview
   ```
   如果本地可以登入，問題可能在 GitHub Secrets 設置。

3. **重新部署**：
   - 推送一個空 commit 來觸發重新部署：
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin main
   ```

4. **聯繫支援**：
   - 提供瀏覽器控制台的完整錯誤訊息
   - 提供 GitHub Actions 構建日誌
   - 說明你已經完成的檢查步驟
