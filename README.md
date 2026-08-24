# Justice-For-Kaikai｜剴剴案特別專題

第一章〈沒有父母的孤兒〉公開互動長卷。

## ⚠️ 發布來源｜Source of Truth

**GitHub Pages 正式網站唯一以儲存庫根目錄的靜態版本為準。**

正式發布入口：

- `index.html` — GitHub Pages 首頁／互動長卷
- `story.html`、`story-zh-hans.html`、`story-en.html`、`story-ja.html` — 四語文字版
- `assets/` — 正式網站 CSS、JavaScript、GSAP、場景及圖片資產

正式網站：https://jerryzuhow77.github.io/Justice-For-Kaikai/

### 編輯正式網站時

1. 首頁結構、第二章預告、導覽與靜態 HTML：修改根目錄 `index.html`。
2. GSAP／ScrollTrigger 與正式互動：修改 `assets/js/`。
3. 正式視覺與手機版樣式：修改 `assets/css/`。
4. 四語文字版：修改根目錄 `story*.html` 及其實際引用內容。
5. 修改後應直接檢查 GitHub Pages 公開網址，不以 `app/` 預覽結果判定發布成功。

## 動畫製作 Source of Truth｜V8.0

第一章動畫文案與五幕製作已於 2026-08-24 收斂為 V8.0。後續維護依下列優先順序：

1. `docs/V6.2-mother-script.md` — 第一章母稿與來源分層。
2. `assets/data/film-productions.js` — 四部電影實際播放的五幕、時間碼、cue、來源標籤與配樂。
3. `assets/data/scenes.js` — 24 場場景註冊、皮影／側視場次資料。
4. `docs/V8.0-animation-closeout.md` — 最新正式片名、角色限制、配樂與結案規格。
5. `docs/films/` — 四部電影各自的五幕 GSAP 製作稿。

**不得另以 closeout／polish JavaScript 二次改寫角色台詞。** 若需修改播放文字，應回到母稿與 `film-productions.js` 依來源層級正式改版。

### 四部五幕電影正式名稱

- `FM-A`｜**土掩埋不住的清朝民間傳說**
- `FM-D`｜**無法再相見▪︎天涯各自分**
- `FM-B`｜**青絲變白髮**
- `FM-C`｜**兩個朝代▪︎不同世界▪︎同一扇門**

## 非 GitHub Pages 發布來源

`app/`、`public/`、Vinext／React、Cloudflare Worker 相關檔案目前保留作為**製作母稿、實驗版與歷史建置來源**，不是 `jerryzuhow77.github.io/Justice-For-Kaikai/` 的直接發布來源。

**禁止只修改 `app/` 後宣稱 GitHub Pages 已更新。** 若未來重新啟用 React/Vinext 作為正式建置流程，必須先建立明確的 build → Pages deploy workflow，並同步修改本 README 的 Source of Truth。

## 目前公開版重點

- 第一章：〈沒有父母的孤兒〉。
- 開場四句：**花有重開日，人無再少年。應須惜兒孫，安樂是天倫。**
- 第二章預告：〈沒人要的孩子〉／**孩子被選擇的人生**。
- 第二章預告採孩子視角：大人一次次做決定，而孩子承受每一次決定的結果。
- 正式靜態版已使用 GSAP + ScrollTrigger；相關腳本由 `assets/vendor/gsap/` 與 `assets/js/` 載入。
- 主頁包含**四部五幕電影長卷**、20 場隨文劇場、完整正文、來源分層與守護行動。
- 支援手機版、鍵盤操作、`prefers-reduced-motion` 與低動態模式。

## 維護規則

- 修改前先確認目標是「GitHub Pages 正式版」還是「React/Vinext 製作母稿」。
- GitHub Pages 正式版修改一律以根目錄 `index.html` + `assets/` 為主。
- 不刪除 `app/`，避免遺失既有 React/Vinext 製作成果；但不得讓它與正式版的發布責任混淆。
- 若同一功能同時存在於靜態版與 React 版，**正式網站行為以靜態版為準**。
- 重要視覺修改後，同時檢查桌機與手機版。
- 動畫必須保留減少動態備援，不以動畫作為取得核心資訊的唯一方式。
- 文學／藝術重構、家屬說法、機構說明、媒體報導與法院認定維持來源分層，不互相冒充。
- 四部電影逐句播放文字以 `film-productions.js` 為 runtime 準據；製作文檔不得建立另一套易漂移台詞。

## 目錄角色

```text
index.html              GitHub Pages 正式首頁【正式】
story*.html             GitHub Pages 四語文字版【正式】
assets/                  GitHub Pages CSS / JS / GSAP / images【正式】
docs/V8.0-animation-closeout.md   第一章動畫 V8 結案規格
docs/films/             四部五幕電影獨立製作稿
app/                     React/Vinext 製作母稿【非 Pages 直接來源】
public/                  React/Vinext 內容與資產來源【非 Pages 直接來源】
.github/workflows/       CI／離線建置／驗證流程
scripts/                 建置與驗證工具
tests/                   測試
Justice-For-Kaikai/      歷史／封裝副本；勿作為 Pages 日常編輯入口
```

## 提交前檢查

- [ ] 修改的是正確發布來源。
- [ ] `index.html` 保留開場四句詩。
- [ ] 第二章預告仍為「孩子被選擇的人生」。
- [ ] 四部電影正式片名與 `film-productions.js`／V8 文件一致。
- [ ] 不存在額外 JavaScript 覆蓋正式電影 cue。
- [ ] GSAP 載入失敗時，核心文字仍可閱讀。
- [ ] 手機 320–430px 不裁切四句詩與主要按鈕。
- [ ] `prefers-reduced-motion` 可正常使用。
- [ ] 正式公開網址實際顯示本次修改。

## 重要安全資訊

若現實中的孩子正處於危險：立即暴力或需要警察到場請撥 110；緊急傷病請撥 119；疑似兒少虐待、疏忽或不當照顧，可撥 113 保護專線。
