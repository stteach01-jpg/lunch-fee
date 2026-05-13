# lunch fee

社頭國中教師營養午餐登記網站，用來統計每個月教師訂購營養午餐的星期、天數與應付金額。

## 目前狀態

- 專案已初始化。
- 已建立 `AGENTS.md`、`README.md`、`.gitignore`。
- 已初始化 Git，並針對 Google Drive 同步資料夾設定 `windows.appendAtomically=false`。
- 尚未建立 GitHub remote。
- 已建立第一版靜態網站：`index.html`、`styles.css`、`script.js`。

## 功能

- 選擇登記月份。
- 自動顯示當月星期一到星期五各有幾天。
- 每月 16 日起，預設改為登記下個月的申請。
- 可手動輸入本月不列入登記的假日或停餐日，系統會從對應星期天數中扣除。
- 教師填入姓名後，勾選當月要訂午餐的星期。
- 以每日 55 元計算每位教師的訂餐天數與應付金額。
- 不同教師送出後會持續累計在同一張月總表。
- 每個月各自保存一張總表。
- 可編輯、刪除、清空本月資料。
- 可匯出 CSV 總表，方便用 Excel 開啟。
- 不同人從不同裝置連入網頁時，會同步看到 Firestore 雲端總表。
- `不列入登記日期` 只開放管理者 Google 帳號修改。

## 使用方式

直接開啟 `index.html` 即可使用，不需要安裝套件或啟動伺服器。

資料會同步到 Firebase Firestore；若雲端暫時無法連線，頁面會先保留本機暫存資料。

不列入登記日期可輸入日期數字或完整日期，例如：`1, 5/20, 2026-05-31`。

管理者帳號：

`shuju.chiang@gmail.com`

## 公開網站

GitHub Pages：

`https://stteach01-jpg.github.io/lunch-fee/`

## Firebase

- Project：`teacherstudy-259b4`
- Collection：`lunch_fee_months/{monthId}/registrations/{registrationId}`
- Firestore rules：一般登入者可讀取總表並新增/更新教師登記；管理者才可修改月份設定與刪除資料。

## 工作方式

- 開工：讀取 `AGENTS.md`、本檔與第二大腦專案儀表板後再開始修改。
- 收工：更新第二大腦專案儀表板與知識庫操作紀錄。
- 目前採用可直接在瀏覽器開啟的靜態網頁工具。

## 第二大腦

專案儀表板：

`G:\我的雲端硬碟\2026codex\secondbrain\知識庫\專案\lunch fee.md`
