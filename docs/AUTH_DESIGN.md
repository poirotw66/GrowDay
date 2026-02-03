# 登入系統設計：Google 登入 vs 自建

## 目標

讓 GrowDay 可供**網路上的所有人**使用，並能**跨裝置同步**（同一帳號在不同裝置看到相同進度）。

---

## 選項比較

| 項目 | Google 登入 | 自建（Email + 密碼） |
|------|-------------|------------------------|
| **實作難度** | 低（用 Firebase / Supabase 約 1–2 天） | 中高（註冊、登入、忘記密碼、驗證信） |
| **使用者門檻** | 要有 Google 帳號 | 任何人可註冊 |
| **安全性** | 密碼由 Google 管，你不管個資 | 你要處理密碼雜湊、重設、防暴力破解 |
| **維護** | 幾乎不用維護登入邏輯 | 要維護註冊／登入／重設流程 |
| **適合** | 先上線、快速驗證 | 想完全掌控或無第三方依賴時 |

**建議：先做「只用 Google 登入」**，之後若要涵蓋沒 Google 的人，再加「Email + 密碼」或「以 Email 註冊、用魔法連結登入」。

---

## 重要觀念：登入 ≠ 資料同步

現在資料都在 **localStorage**，就算加了「登入」按鈕，若沒有後端或雲端資料庫：

- 登入只會知道「這個人是誰」
- 進度還是存在**本機**，換裝置或換瀏覽器就看不到

所以要讓「所有人用、跨裝置同步」，需要兩塊：

1. **登入（Auth）**：辨識使用者（例如 Google OAuth）
2. **資料存哪裡（Backend / BaaS）**：以「使用者 ID」為 key 存/讀 `GameState`

下面用「Google 登入 + 雲端存檔」當目標來設計。

---

## 方案 A：Google 登入 + Firebase（最簡單）

- **Auth**：Firebase Authentication，支援「用 Google 登入」。
- **存檔**：Firestore 以 `users/{uid}/gameState` 存一份 `GameState`，登入後讀取／寫入。

優點：文件多、免費額度夠小專案用、前端 SDK 簡單。  
缺點：依賴 Google / Firebase，資料在 Firebase。

實作大略：

1. 在 [Firebase Console](https://console.firebase.google.com/) 建立專案，開通 Authentication（Google 登入）與 Firestore。
2. 前端：`npm i firebase`，設定 Firebase，用 `signInWithPopup` 或 `signInWithRedirect` 做 Google 登入。
3. 登入後用 `user.uid` 當 key，把目前 `GameState` 寫入 Firestore；啟動時若已登入則從 Firestore 讀取並覆蓋本地 state。
4. 可選：離線時仍寫 localStorage，上線後再 sync 到 Firestore（衝突策略可先「以雲端為準」或「以最新時間戳為準」）。

---

## 方案 B：Google 登入 + Supabase

- **Auth**：Supabase Auth 支援 Google OAuth。
- **存檔**：Supabase（PostgreSQL）開一張表，例如 `user_game_state (user_id, game_state_json, updated_at)`，以 `user_id` 讀寫。

優點：開源、可自架、SQL 好查；若之後要自建後端也容易遷移。  
缺點：要自己設計表結構與 RLS（權限）。

實作大略：

1. [Supabase](https://supabase.com/) 建立專案，在 Auth 裡啟用 Google。
2. 前端：`npm i @supabase/supabase-js`，登入後用 `supabase.from('user_game_state').upsert(...)` 寫入，啟動時 `select` 讀取。
3. 同上，可搭配 localStorage 做離線緩存與同步策略。

---

## 方案 C：自建後端 + Google 或 自建帳密

- 後端：Node（Express）/ Python（FastAPI）等，提供：
  - `POST /auth/google`：用 Google ID token 驗證，回傳你自己的 JWT。
  - `GET/PUT /api/me/game-state`：依 JWT 的 user id 讀寫 GameState。
- 前端：登入後把 JWT 存起來（例如 memory + 可選 httpOnly cookie），請求時帶上 JWT。
- 若要做「自建帳密」：後端要實作註冊、登入、忘記密碼、信箱驗證等；密碼需雜湊（如 bcrypt）、防暴力破解。

適合：想完全掌控、已有或打算自建後端的情況。

---

## 建議路線（簡單且可給所有人用）

1. **第一階段：只用 Google 登入 + Firebase**
   - 實作快、維護少、多數人都有 Google 帳號。
   - 上線後可寫在說明：「目前支援使用 Google 帳號登入，登入後資料會安全保存在雲端並可跨裝置使用。」

2. **第二階段（可選）：加「訪客 / 本機模式」**
   - 未登入時維持現狀（只用 localStorage），不強制登入。
   - 登入後可選擇「將目前本機資料上傳到雲端」或「改載入雲端資料」，避免誤蓋。

3. **第三階段（可選）：加 Email 登入或魔法連結**
   - 用 Firebase 或 Supabase 的 Email 登入／魔法連結，給沒有 Google 的人用。
   - 或改採「自建後端 + JWT」再慢慢加這些方式。

---

## 小結

- **「簡單一點、支援 Google 登入」** → 建議用 **Google 登入（Firebase 或 Supabase）**，不要先自建帳密。
- **「給網路上的所有人用」** → 一定要有 **登入 + 雲端存檔**（Firebase / Supabase / 自建後端擇一）；只加登入按鈕而不存雲端，無法跨裝置共用。
- 若你願意採用 **Firebase（Google + Firestore）**，我可以下一步幫你寫：  
  - 前端 Auth 與「登入 / 登出 / 讀寫 GameState」的架構（例如 `AuthContext` + 與現有 `useHabitEngine` 的整合方式），  
  - 以及 Firestore 的資料結構與安全規則要點。

你要先做 **Firebase 版**，還是 **Supabase 版**？回覆一個我就依那個方案寫具體步驟與程式碼位置建議。
