# Justice-For-Kaikai｜剴剴案特別專題

第一章〈沒有父母的孤兒〉可建置網站原始碼。正式專案連結：

https://github.com/jerryzuhow77/Justice-For-Kaikai

版本：V6.1.0  
案件資料與司法狀態核對至：2026-08-16  
角色動畫規格更新：2026-08-18

## 本包已包含

- 繁體中文、簡體中文、英文、日文完整正文。
- 唯一正式播放順序：序問 → 八篇篇章 → 結尾皮影戲 → 守護行動。
- 幕開／幕謝、陰翳側視篇章轉場、互動對話卡與「青絲變白頭」視覺變化。
- 女守門人、男守門人、外婆各12個原創透明WebP姿勢與PNG母表；序幕／結尾各12個表演節拍，八篇轉場各10個不同動作。
- 完整角色表演、六種鏡位、前後景視差、對話同步、暫停／繼續與低動態備援。
- 建議導覽、完整電影版、直接閱讀、減少動態四種模式。
- 第一至第六篇原創音樂：六支原始MP4與六個網頁版M4A音檔。
- 兩張主視覺、10場Scene Manifest、資產Manifest、來源清單。
- V6.1.0製作母稿、完整動畫片化逐鏡規格、事實／證據架構、四語與資產規格、製作Scene Manifest。
- 手機版、列印版、鍵盤操作、跳至正文、`prefers-reduced-motion`與無自動播放。

## 目錄

```text
app/                    React/Vinext頁面、四語UI、Markdown轉譯、動畫與CSS
public/content/         四語完整公開文案與結語
public/media/           圖片、36張角色姿勢、三張姿勢表、六首原創音樂與M4A網頁版
public/data/            Scene、資產與來源JSON
public/docs/            V6.1.0製作母稿、動畫片化逐鏡規格與查證文件
.github/workflows/      CI與選用的Cloudflare部署流程
scripts/                可重現建置與產物驗證
tests/                  Worker輸出測試
```

## 本機預覽

需求：Node.js 22.13以上、npm。

```bash
npm ci
npm run dev
```

瀏覽終端顯示的本機網址。第一次開啟不會自動播放音訊；音樂必須由讀者按下播放。

## 正式建置與驗證

```bash
npm ci
npm run lint
npm run build
npm run validate:artifact
```

正式產物會出現在`dist/`：

- `dist/server/index.js`：Cloudflare Worker入口。
- `dist/client/`：網站靜態資產。
- `dist/.openai/hosting.json`：建置後網站Manifest。

## 上傳到GitHub

1. 在GitHub建立或開啟`jerryzuhow77/Justice-For-Kaikai`。
2. 解壓縮本包，把`Justice-For-Kaikai/`資料夾內所有檔案放到儲存庫根目錄。
3. 不要上傳`node_modules/`、`dist/`、`.wrangler/`或`.env*`。
4. 提交後，`.github/workflows/ci.yml`會執行Lint與正式建置檢查。

若使用命令列：

```bash
git init
git add .
git commit -m "feat: publish Justice-For-Kaikai V6.1.0"
git branch -M main
git remote add origin https://github.com/jerryzuhow77/Justice-For-Kaikai.git
git push -u origin main
```

## 部署

專案以Vinext輸出Cloudflare Worker。`wrangler.jsonc`已綁定`dist/client`靜態資產；在Cloudflare建立API Token後，可手動執行：

```bash
npm run build
npx wrangler deploy
```

也可在GitHub Actions設定`CLOUDFLARE_API_TOKEN`與`CLOUDFLARE_ACCOUNT_ID`兩個Repository Secrets，再手動啟動`Deploy to Cloudflare`工作流程。

> GitHub儲存庫網址是本專題的專案連結，不等同正式公開網域。正式網域確定後，請另外補上canonical與Open Graph完整URL。

## 編輯規則

- 公開正文只改`public/content/`；不要在動畫元件另存第二份正文。
- 篇章順序、秒碼、資產與狀態改動同步更新`public/data/scene-manifest.json`。
- 案件事實、司法狀態或數據改動前，先依`public/docs/evidence-architecture.md`更新Claim Ledger與來源狀態。
- 急診段永久標示「未具名讀者來函／情境重構」；外婆段永久標示「公開說法／間接引述／本專題整理」。
- 民間傳說、文學對白、家屬說法、機構說明、媒體報導與法院認定不得混成同一來源層。
- 新增圖片或音樂前，先完成`public/docs/ASSET-RIGHTS.md`的權利確認。

## 重要安全資訊

若你此刻看見現實中的孩子正處於危險：立即暴力或需要警察到場請撥110；緊急傷病請撥119；疑似兒少虐待、疏忽或不當照顧，可撥113保護專線。

官方說明：https://www.mohw.gov.tw/cp-2704-46193-1.html
