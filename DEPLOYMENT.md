# 部署檢查表

## 上線前

- [ ] `npm ci`完成，Node版本符合`package.json`。
- [ ] `npm run lint`無錯誤。
- [ ] `npm run build`完成。
- [ ] `npm run validate:artifact`完成。
- [ ] 四種語言都能切換，八篇正文均出現。
- [ ] 四種觀看模式都能進出；「直接閱讀」不顯示動畫場景。
- [ ] 六首原創音樂只能在使用者操作後播放，切篇可暫停。
- [ ] 320、360、390、412、480px手機寬度沒有水平捲動。
- [ ] 鍵盤可操作語言、模式、幕開、台詞節點、音樂與導覽。
- [ ] `prefers-reduced-motion`不執行位移、視差與自動翻句。
- [ ] 急診、外婆、民間傳說與皮影戲來源標籤常駐。
- [ ] 113／110／119資訊與官方連結再次核對。
- [ ] `public/data/sources.json`與Claim Ledger狀態一致。
- [ ] 新增媒體的權利與授權已在`public/docs/ASSET-RIGHTS.md`確認。

## GitHub

- [ ] Repository：`jerryzuhow77/Justice-For-Kaikai`。
- [ ] Default branch：`main`。
- [ ] Actions已允許執行。
- [ ] 未提交`.env*`、Token、`node_modules/`、`dist/`或`.wrangler/`。

## Cloudflare（如採用）

- [ ] GitHub Secrets已設定`CLOUDFLARE_API_TOKEN`。
- [ ] GitHub Secrets已設定`CLOUDFLARE_ACCOUNT_ID`。
- [ ] Worker名稱、正式網域與資產綁定已確認。
- [ ] 正式網域回填metadata canonical、Open Graph與sitemap。

