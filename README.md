# 🌱 GrowDay - 習慣養成應用

**用可愛的電子寵物陪你養成好習慣！每日打卡，看著你的小夥伴一起成長。**

[English](./README_en.md) | [繁體中文](#)


## ✨ 特色功能

### 🐾 電子寵物系統
- **精靈成長**：從蛋孵化到完全體，隨著你的打卡進度進化
- **多種精靈**：不同顏色和屬性的精靈等你收集
- **世代傳承**：精靈達到最高等級後可退休，獲得永久加成並開啟新世代

### 📅 日曆打卡
- **多種風格**：極簡、手繪、新春、日式、美式等日曆主題
- **自訂印章**：選擇喜歡的圖案和顏色作為打卡標記
- **視覺化進度**：一目了然的月曆視圖，追蹤每日習慣

### 🏆 成就系統
- **豐富成就**：解鎖各種里程碑，獲得金幣獎勵
- **成就圖鑑**：查看所有成就進度和解鎖條件

### 📊 統計分析
- **連續天數**：追蹤當前連續打卡紀錄
- **本月達成**：查看當月打卡次數
- **最高紀錄**：記錄最長連續打卡天數
- **統計圖表**：視覺化呈現習慣養成趨勢

### 🎯 目標設定
- **自訂目標**：為習慣設定每日、每週或每月目標
- **進度追蹤**：即時查看目標完成進度

### 🔔 提醒功能
- **每日提醒**：設定提醒時間，不再忘記打卡
- **瀏覽器通知**：支援桌面通知提醒

### 🌍 世界地圖
- **多個區域**：解鎖不同主題的世界區域
- **裝飾系統**：購買和擺設家具，打造專屬世界
- **精靈安置**：將退休的精靈安置在世界中

### 🎨 個人化設定
- **深色模式**：支援亮色/深色主題切換
- **多習慣管理**：同時追蹤多個習慣
- **資料備份**：匯出/匯入資料，隨時備份進度

---

## 🚀 快速開始

### 環境需求

- **Node.js** 18+ 
- **npm** 或 **yarn**

### 安裝步驟

1. **複製專案**
   ```bash
   git clone https://github.com/your-username/GrowDay.git
   cd GrowDay
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. **開啟瀏覽器**
   
   訪問 `http://localhost:3000` 開始使用

### 開發指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 執行測試
npm test

# 執行測試（單次）
npm run test:run

# 測試覆蓋率
npm run test:coverage

# 程式碼檢查
npm run lint

# 自動修復程式碼
npm run lint:fix

# 格式化程式碼
npm run format
```

---

## 📦 技術棧

- **前端框架**：React 19 + TypeScript
- **建置工具**：Vite 6
- **樣式方案**：Tailwind CSS 4
- **圖示庫**：Lucide React
- **測試框架**：Vitest + Testing Library
- **程式碼品質**：ESLint + Prettier

---

## 🌐 部署到 GitHub Pages

### 自動部署（推薦）

1. **推送程式碼到 GitHub**
   ```bash
   git push origin main
   ```

2. **設定 GitHub Pages**
   - 進入 Repository **Settings** → **Pages**
   - **Build and deployment** → **Source**：選擇 **GitHub Actions**

3. **觸發部署**
   - 推送到 `main` 分支會自動觸發部署
   - 或手動執行：**Actions** → **Deploy to GitHub Pages** → **Run workflow**

4. **訪問網站**
   
   部署完成後，網站將在以下網址可用：
   ```
   https://<你的GitHub用戶名>.github.io/GrowDay/
   ```
   
   > 💡 如果 Repository 名稱不同，路徑會自動匹配 Repository 名稱

---

## 📱 PWA 支援

GrowDay 支援 Progressive Web App (PWA)，可以：

- 📲 **安裝到裝置**：在手機或電腦上安裝為應用程式
- 🔌 **離線使用**：部分功能可在離線狀態下使用
- 🔔 **推播通知**：接收每日提醒通知

---

## 🎮 使用指南

### 建立第一個習慣

1. 開啟應用後，輸入習慣名稱（例如：閱讀、運動、喝水）
2. 選擇精靈蛋的顏色（火、水、草、紫）
3. 選擇打卡印章的圖案和顏色
4. 開始每日打卡，看著精靈成長！

### 精靈進化階段

- **孵化期** (Lv.1-4)：精靈還在蛋中
- **幼年期** (Lv.5-9)：精靈開始成長
- **成長期** (Lv.10-19)：精靈逐漸成熟
- **完全體** (Lv.20+)：精靈達到完美型態

### 精靈退休

當精靈達到 Lv.30 時，可以選擇退休：

- ✨ 獲得 **永久金幣加成 +10%**
- 🏛️ 精靈進入榮譽殿堂
- 🥚 習慣繼承意志，孵化新世代精靈

---

## 💡 還能新增什麼功能？

我們整理了 [功能建議清單](./docs/FEATURE_IDEAS.md)，包含遊戲化、統計、提醒、世界裝飾、個人化、多語系、無障礙等方向，並標註難度與建議優先順序，歡迎參考或貢獻點子。

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 📄 授權

本專案採用 MIT 授權條款。

---

## 🙏 致謝

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

**用每一天的堅持，養成更好的自己 🌱**

Made with ❤️ by GrowDay Team

</div>
