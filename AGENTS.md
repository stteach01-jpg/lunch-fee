# lunch fee - AGENTS.md

## 專案入口

- 專案資料夾：`G:\我的雲端硬碟\lunch fee`
- 第二大腦專案儀表板：`G:\我的雲端硬碟\2026codex\secondbrain\知識庫\專案\lunch fee.md`
- 使用語言：繁體中文

## 工作流程

- 開工時先讀本檔、`README.md` 與第二大腦專案儀表板，再檢查 Git 狀態。
- 收工時整理本次變更、更新第二大腦專案儀表板與 `知識庫/log.md`。
- 重要規則放在本檔；進度、決策與待辦放在第二大腦。
- 本專案位於 Google Drive 同步資料夾，Git 已設定 `windows.appendAtomically=false` 以降低同步鎖檔問題。

## 主要檔案

- `README.md`：專案說明、目前狀態與使用方式。
- `.gitignore`：排除系統檔、敏感資料、AI agent 本地設定、依賴與建置輸出。
- `index.html`：社頭國中教師營養午餐登記網站主頁。
- `styles.css`：網站版面與視覺樣式。
- `script.js`：月份星期天數計算、教師登記、金額統計、Firebase 雲端同步與 CSV 匯出。
- `firestore.rules`：Firestore 權限規則；管理者 email 為 `shuju.chiang@gmail.com`。
- `firebase.json` / `.firebaserc`：Firebase rules 部署設定，專案為 `teacherstudy-259b4`。

## 安全規則

- 不提交 API key、token、密碼、`.env` 或管理員憑證。
- 本工具會記錄教師姓名；若未來加入學生資料，僅使用班級代碼、座號或匿名識別，不記錄學生真實姓名。
- 不列入登記日期只允許管理者 Google 帳號修改；不能退回純前端密碼控管。
- 不覆寫既有功能或資料；若檔案已有內容，先理解現況再修改。
- 未經明確要求，不自動建立 GitHub remote、commit 或 push。
