# V6｜唯一正式播放順序與可程式化 Scene Manifest

> **文件地位：**本 Manifest 取代先前所有「十場配置總覽」、共通轉場與播放優先規則。完整皮影台詞由 PART I／IV 的穩定台詞 ID 提供；鏡位、側視動作與片長只由本節提供。  
> **唯一性：**本節是開頭、01–08與結尾的唯一播放契約。後文如有其他片長、淡出、直接切黑、重播或自動播放說明，一律降級為美術參考，不得覆寫本節。  
> **版本：**`manifest_version: 6.0.0`｜`experience_id: kaikai-ch01`｜`scene_count: 10`

## 一、V6正式播放決策

### 1. 唯一正式順序

```text
模式選擇與全站內容提醒
→ opening｜序問與〈土掩不住的名字〉
→ 01｜古老的傳說
→ 02｜當孩子必須離開原來的家
→ 03｜越來越多求救，進入制度
→ 04｜隔著布簾的急診記憶
→ 05｜從一紙修法開始
→ 06｜另一間病房裡的孩子
→ 07｜制度留下的接縫
→ 08｜外婆的眼淚
→ ending-a｜〈讓下一扇門更早打開〉65–80秒
→ ending-b｜雙世界主線30–45秒
→ HTML結語、制度追問與守護行動
```

正式主線不再串播3分15秒的〈兩個世界，同一扇門〉。該片完整保留為結尾後的自選附章，按鈕名稱固定為`觀看完整雙世界詩劇｜3分15秒`；使用者主動按下後，先閱讀象徵性對話說明，再另行播放。它不是主線必看片段，也不得在頁面重整後自行啟動。

### 2. 每場唯一狀態機

```text
sourceGate
→ curtainOpening
→ shadowDialogue
→ reactionHold
→ curtainClosing
→ textureMatch
→ sideView
→ evidenceFocus
→ recordCard
→ reading
```

- `sourceGate`與`recordCard`都屬必要資訊，不列入動畫片長，也不能被`略過本場動畫`略過。
- `curtainClosing → textureMatch`是唯一可以短暫鎖定捲動的區段；桌機與手機均不得超過4.5秒。
- `sideView`結束後必須先進`recordCard`，不得從電影畫面直接切入正文。
- 所有事實、日期、數字、司法結果與引文只出現在資料卡與正文；皮影與側視對話只提出問題、辨認來源及引導閱讀。

## 二、四種觀看方式

| 模式 | 入口名稱 | 實際播放內容 | 音訊 | 捲動與記憶 |
|---|---|---|---|---|
| `guided` | 建議導覽 | 開頭52–64秒；01–08各30–46秒；結尾固定65–80秒皮影＋30–45秒雙世界 | 第一次互動後才可啟用；預設靜音 | 每場每次工作階段自動進入一次；完成後不因回捲重播 |
| `cinema` | 完整電影版 | 開頭完整長版；01–08完整皮影＋完整側視；結尾65–80秒皮影後可選30–45秒主線或3分15秒附章 | 使用者明確同意後啟用；不自動循環音樂 | 章與章之間仍回到正文；不可用一支長影片取代網頁來源卡 |
| `reading` | 直接閱讀 | 不播放幕開、皮影、材質變形與側視；顯示來源門牌、靜態章門、資料卡與完整正文 | 不載入音訊 | 立即解除滿版與sticky；焦點移至該篇標題 |
| `reduced` | 減少動態 | 靜態戲臺圖→完整文字對白→靜態主意象→資料卡→正文；所有步驟手動前進 | 預設不載入 | 作業系統偏好優先；可再切`reading`，不得在未同意下切回動態 |

### 模式選擇的固定介面

首屏只能出現以下四個主要選項：`建議導覽`、`完整電影版`、`直接閱讀`、`減少動態`。`開啟聲音`是獨立切換，不得與模式綁定。模式可在頁首工具列隨時改變；切換後只影響尚未開始的場景，正在閱讀的正文不得跳回滿版動畫。

### 正式片長預算

| 場景 | 建議導覽桌機 | 建議導覽手機 | 完整電影版 | Reduced Motion |
|---|---:|---:|---:|---|
| opening | 52–64秒 | 44–56秒 | 210–235秒 | 8張靜態畫面，手動 |
| 01 | 30–38秒 | 26–34秒 | 97–128秒 | 5張靜態畫面，手動 |
| 02 | 30–38秒 | 26–34秒 | 97–128秒 | 5張靜態畫面，手動 |
| 03 | 30–38秒 | 26–34秒 | 97–128秒 | 5張靜態畫面，手動 |
| 04 | 34–42秒 | 28–36秒 | 102–133秒 | 6張靜態畫面，手動 |
| 05 | 30–38秒 | 26–34秒 | 97–128秒 | 5張靜態畫面，手動 |
| 06 | 32–40秒 | 28–36秒 | 97–128秒 | 6張靜態畫面，手動 |
| 07 | 32–40秒 | 28–36秒 | 102–133秒 | 6張靜態畫面，手動 |
| 08 | 36–46秒 | 30–40秒 | 149–169秒 | 7張靜態畫面，手動 |
| ending | 95–125秒 | 95–125秒 | 主線95–125秒；自選附章250–280秒 | 12張靜態畫面，手動 |

以上時間不含使用者閱讀來源牌、資料卡與正文的停留。`cinema`模式的完整動畫不自動跨過正文串成20分鐘影片；讀者抵達下一章後才開始下一場。

### 建議導覽的固定時間分配

01–07沿用同一節奏，04與06可各增加2–4秒來源辨識，08增加4–8秒來源切換；不得任意拉長成完整電影版。

| 狀態 | 01–07建議值 | 04／06／08調整 | 是否可略過 |
|---|---:|---:|---|
| `sourceGate` | 手動，至少完整讀取一次 | 多來源依序顯示，不合併 | 不可 |
| `curtainOpening` | 2.2–2.6秒 | 相同 | 可，直接到資料卡 |
| `shadowDialogue` | 11–15秒 | 04／06為13–17秒；08為15–19秒 | 可 |
| `reactionHold` | 1.0–1.3秒 | 08固定1.5秒 | 可 |
| `curtainClosing` | 1.8–2.2秒 | 相同 | 不在形變中途跳切 |
| `textureMatch` | 1.8–2.2秒 | 相同 | 不在形變中途跳切 |
| `sideView` | 9–13秒 | 04／06為11–15秒；08為12–16秒 | 可 |
| `evidenceFocus` | 1.8–2.4秒 | 多來源場景可至3秒 | 可 |
| `recordCard` | 手動，至少完整讀取一次 | 分層來源逐欄可聚焦 | 不可 |
| `reading` | 不限 | 不限 | 不適用 |

本節所列「建議導覽對話」就是`guided`模式實際播放字句；`cinema`模式改讀PART I／IV各場完整皮影台詞，並依本 Manifest 延長反應與側視動作；`reading`模式將完整逐字稿置於可展開區；`reduced`模式以靜態卡逐句呈現完整對話，不以動作限制閱讀。

## 三、意象收斂表｜八篇各守一件東西

| 場景 | 唯一主意象 | 核心動詞 | 可以回返的輔助物 | 本場禁用或降級 |
|---|---|---|---|---|
| opening | 濕泥中的退紅繡線 | 掩覆、抽出、對位 | 古厝後院器物、法院階線 | 不以空椅作主景；不反覆吟詠春花 |
| 01 | 空竹椅與藤紋 | 拂塵、扶正、鬆結 | 舊屋木牆 | 「門」只作背景出口；不再出現卷宗堆 |
| 02 | 藍白交接帶與六枚繩結 | 交付、接住、確認 | 六個職能牌 | 不把六關做成六次開門；不使用紙海 |
| 03 | 城市窗格中的人形留白 | 排列、對照、走近 | 統計單位「件／人」 | 不再使用繩結、空椅、布簾；不以亮燈代表救援成功 |
| 04 | 月白急診布簾與輪床軌跡 | 停步、傾聽、讓路 | 地磚接縫、醫護鞋步 | 不掀簾、不追床、不呈現兒童身體或儀器歸零 |
| 05 | 活字版框與年份鉛字 | 排字、壓印、抬版 | 法規沿革年份 | 不再放空椅追問；本場是全章唯一以「紙與字」為主隱喻的場景 |
| 06 | 兩扇不同年代病房窗與中央分隔牌 | 並置、分開、核對 | 「平安」春聯一角 | 不以線縫合兩案；不把家屬質疑、機構回應、司法結果混成一張卡 |
| 07 | 一百一十五枚藺草刻度與中斷縫線 | 追跡、停格、留白 | 雙軌標尺 | 不重複卷宗翻頁；不由動畫補出缺失訪視或動機 |
| 08 | 木梳、青絲轉白與未取用的面紙 | 梳理、停手、退鏡 | 證人席麥克風 | 不再使用空椅作高潮；不追拍哭泣、不循環掩面 |
| ending | 「責任」竹榫、八枚徽章與普通門檻 | 穿線、補榫、共同推開 | 01的竹椅只回返一次 | 門只在結尾重新成為主意象；不出現天堂、亡魂團聚或勝利姿勢 |

### 意象使用上限

- **空椅：**只在01建立，在結尾回返一次完成榫接；05、08不得再以空椅作視覺答案。
- **門：**opening僅作時代接縫，02只留職能牌；直到ending才重新成為核心動作。
- **紙：**資料卡屬介面，不算文學意象；只有05可以把紙、活字與印刷當主景。
- **光：**只作曝光與可讀性，不再以「燈亮＝有人得救」作敘事捷徑。
- **花會再開／童年不回：**只在開頭引言與結尾皮影各出現一次，中段八篇不重複。
- **孩子不會說：**04完整表達一次；其他章改寫成「訊號如何被辨認」「交接如何被確認」，避免同句成為口號。

## 四、機器可讀總契約

```yaml
manifest_version: "6.0.0"
experience_id: "kaikai-ch01"
default_mode: "guided"
canonical_sequence:
  - kk-opening
  - kk-01-chair
  - kk-02-handover
  - kk-03-statistics
  - kk-04-er-curtain
  - kk-05-movable-type
  - kk-06-separate-ward
  - kk-07-115-days
  - kk-08-grandmother
  - kk-ending-threshold
required_states:
  - sourceGate
  - curtainOpening
  - shadowDialogue
  - reactionHold
  - curtainClosing
  - textureMatch
  - sideView
  - evidenceFocus
  - recordCard
  - reading
source_policy:
  verified_statuses: [verified_primary, verified_official, verified_attributed]
  disallowed_public_statuses: [todo, pending, assumed, broken_link]
  source_gate_skippable: false
  record_card_skippable: false
audio_policy:
  autoplay_before_user_gesture: false
  loop_bgm: false
  dialogue_duck_db: -8
  target_lufs: -18
  true_peak_dbtp: -1.5
accessibility:
  canvas_contains_required_text: false
  dialogue_dom_required: true
  reduced_motion_is_first_class_mode: true
  transcript_required_locales: [zh-Hant, zh-Hans, en, ja]
```

### 每場資料物件的必要欄位

```yaml
scene_id: string
anchor: string
chapter: string
mode_duration_s:
  guided_desktop: [min, max]
  guided_mobile: [min, max]
  cinema: [min, max]
primary_motif: string
continuity_in: string
continuity_out: string
source_gate:
  labels: [string]
  required_source_ids: [string]
  publishable: boolean
  fallback_if_unverified: string
dialogue:
  shadow_keys: [string]
  sideview_keys: [string]
audio:
  music_asset_id: string | null
  ambience_asset_id: string
  cues: [string]
controls:
  skip_target: string
  replay_policy: string
  direct_read_target: string
responsive:
  desktop_composition: string
  mobile_composition: string
  reduced_panels: number
```

`required_source_ids`不得留`TBD`或空陣列。建置腳本若發現來源不存在、網址失效或`publishable:false`，必須使正式建置失敗；不得把「上線前補來源」輸出到公開頁面。若某項細節本質上是創作，應改標`文學化設定`，而不是假裝等待事實來源。

## 五、十場 Scene Manifest

### S00｜`kk-opening`｜序問與土掩不住的名字

```yaml
scene_id: kk-opening
anchor: "#prologue"
chapter: opening
mode_duration_s:
  guided_desktop: [52, 64]
  guided_mobile: [44, 56]
  cinema: [210, 235]
primary_motif: "濕泥中的退紅繡線"
continuity_in: "首頁刺繡邊框的一段退紅線"
continuity_out: "繡線被抽離泥地，變成01空椅旁的鬆線"
source_gate:
  labels: [LITERARY_SHADOW, LEGEND_RECONSTRUCTION, JUDICIAL_RESULT_ARTISTIC_REENACTMENT]
  required_source_ids: [SRC-EDITORIAL-FOLKLORE, SRC-COURT-DIRECT-1, SRC-PTS-FINAL-1, SRC-PTS-FINAL-2]
  publishable: true
  fallback_if_unverified: "移除姓名、日期、刑度與豬槽細節；只保留已驗證的來源牌與中性古厝轉場"
audio:
  music_asset_id: null
  ambience_asset_id: amb_prologue_old_house_court
controls:
  skip_target: "#record-opening"
  replay_policy: "完成後可手動重播；不得循環快門與驚嚇反應"
  direct_read_target: "#chapter-introduction"
responsive:
  reduced_panels: 8
```

**來源牌順序**

1. `原創文學化皮影旁白｜非案件人物對話`。
2. 古厝段開始前切換為`民間傳說演繹｜豬槽細節為本專題文學化版本，非固定史實`。
3. 紅床材質轉為法院階線的第一格，立即切換為`司法結果／象徵性重現｜非實際庭訊影像`；兩牌不能交疊，也不能以同一顏色顯示。

**建議導覽時間軸**

- 00:00–00:03：幕開。女影由退紅線撣去戲臺泥塵；男影把三枚來源牌分開放好。
- 00:03–00:17：序問節錄。只保留一組問答，不播放六段全文。
- 00:17–00:18：兩人回望，音樂全退。
- 00:18–00:22：幕謝與材質匹配；退紅線落入濕泥，不切黑。
- 00:22–00:43：古厝後院、木門自行鬆開、紅床帳褶皺對位法院紅毯。兄嫂只有驚醒、退縮及彼此失散的剪影，不呈現死狀。
- 00:43–00:54：法院階線、兩名現代成人背影與低刺激快門；法庭結果只由已核實資料卡顯示。
- 00:54–00:64：守門人側視走向資料桌，打開`傳說／裁判結果`雙欄卡，進第一章導言。

**建議導覽皮影對話框**

- `kk.opening.shadow.f01` 女：「簷前花謝尚會再開；孩子失去的年歲，卻沒有人能送還。」
- `kk.opening.shadow.m01` 男：「那便先把傳說與裁判分開；讓每一句話，都帶著自己的來源走進人間。」

**側視對話框**

- `kk.opening.side.f01` 女守門人：「戲臺只問到這裡。往後，讓能核對的文字接手。」
- `kk.opening.side.m01` 男守門人：「傳說留在左欄，司法結果放回右欄；別讓同一束影子替兩者作證。」

**音訊 cue**

- `0.0s`單次低梆；`17.0s`撤去音床；`18.8s`古厝風聲J-cut；`39.5s`風聲退成法院空調；`43.0s`局部快門至多每秒兩次。
- 無閃光模式以鏡頭微停與快門機械聲取代曝光；所有模式禁用兒童哭聲、死亡喘息與恐怖反轉音。

**桌機／手機**

- 桌機24mm緩推，古厝、床帳與法院階線只在同一水平構圖內換材質；不使用三段獨立影片。
- 手機採獨立9:16母版：泥地在下方25svh、人物在中段、來源牌在上方；紅床只呈帷帳與床腳，不塞入橫向大全景。
- `略過本場`仍須先讀完三類來源牌，才進雙欄資料卡。完整電影版的〈土掩不住的名字〉為145–160秒，另加完整序問與側視，因此整場總預算為210–235秒。

### S01｜`kk-01-chair`｜古老的傳說

```yaml
scene_id: kk-01-chair
anchor: "#chapter-01"
chapter: "01"
mode_duration_s: {guided_desktop: [30, 38], guided_mobile: [26, 34], cinema: [97, 128]}
primary_motif: "空竹椅與藤紋"
continuity_in: "opening退紅線成為椅腳旁的鬆線"
continuity_out: "鬆線染成02藍白交接帶"
source_gate:
  labels: [FOLKLORE_MULTIPLE_VERSIONS, LITERARY_RECONSTRUCTION]
  required_source_ids: [SRC-EDITORIAL-FOLKLORE]
  publishable: true
  fallback_if_unverified: "保留傳說版本互異說明；刪除任何被寫成唯一史實的細節"
audio: {music_asset_id: bgm_01_flower_no_return, ambience_asset_id: amb_old_room_wood}
controls: {skip_target: "#record-01", replay_policy: "可重播，不循環椅上孩童畫面", direct_read_target: "#copy-01"}
responsive: {reduced_panels: 5}
```

**正式轉接**

- 幕開：女影拂去椅背薄塵、鬆開抽象細線；男影捲起傳說卷，不把卷放在椅上。
- 幕謝：只留下椅背藤紋與鬆線；藤紋匹配舊屋木牆，鬆線貼地延伸。
- 側視：兩名守門人繞過空椅，沒有任何人坐上去；女影扶正一隻椅腳，男影把`傳說版本互異`牌立於牆邊。
- 資料焦點：`傳說退場｜紀錄開始`。資料卡列「可知：傳說有多個版本」「不可知：確切年代、人物與細節」「本專題用途：文化序問」。
- 正文入口：卡片上緣成為`01｜古老的傳說：綁在椅子上的孩子`眉題。

**建議導覽對話**

- `kk.01.shadow.f01` 女：「舊屋把一個孩子留在椅上，後人便把無法回答的痛，說成了傳說。」
- `kk.01.shadow.m01` 男：「傳說可以保存記憶，不能替真實案件作證；先留下問題，不留下鬼影。」
- `kk.01.side.f01` 女守門人：「椅子仍在；我們只扶正它，不替故事補上一個確定的答案。」
- `kk.01.side.m01` 男守門人：「從來源牌開始，讀者會知道哪裡是傳聞，哪裡才進入紀錄。」

**音訊與構圖**

- 〈花開無歸期〉只播一次12–16秒節錄，對話時降8dB；後半只留木材伸縮與極低室內風。
- 桌機椅子位於畫面38%水平位置；手機椅高不超過畫面34%，上方保留完整來源牌。不得用幽靈、血跡或繩索勒痕補強氣氛。

### S02｜`kk-02-handover`｜離開原來的家

```yaml
scene_id: kk-02-handover
anchor: "#chapter-02"
chapter: "02"
mode_duration_s: {guided_desktop: [30, 38], guided_mobile: [26, 34], cinema: [97, 128]}
primary_motif: "藍白交接帶與六枚繩結"
continuity_in: "01鬆線染成藍白交接帶"
continuity_out: "第六枚繩結展開為03城市窗格的交叉點"
source_gate:
  labels: [LEGAL_EXPLAINER, INSTITUTIONAL_PROCESS, EDITORIAL_QUESTION]
  required_source_ids: [SRC-GAZETTE-ADOPTION-2025, SRC-MOHW-REFORM-2024]
  publishable: true
  fallback_if_unverified: "不合併三種制度；隱藏欠缺依據的定義，只保留已核實項目"
audio: {music_asset_id: bgm_02_sleepless_vigil, ambience_asset_id: amb_handover_corridor}
controls: {skip_target: "#record-02", replay_policy: "可重播；交接帶不得掉落作驚嚇", direct_read_target: "#copy-02"}
responsive: {reduced_panels: 5}
```

**正式轉接**

- 幕開：男女皮影各握交接帶一端，依序在六枚職能牌旁打結；每一結均由兩人共同確認後才鬆手。
- 幕謝：人物被幕遮住，交接帶持續橫跨臺口；布纖維匹配為側視空間的扶手。
- 側視：兩人不開六扇門，而是沿六個職能牌前行；第四結下滑時，兩人同時接住。
- 資料焦點：三張並列定義卡——`收出養`、`法定家外安置`、`出養等待期間全日托育`；任何語言版本都不得合併。
- 正文入口：交接帶收束成章名下方單一細線，正文回到一般閱讀流。

**建議導覽對話**

- `kk.02.shadow.f01` 女：「孩子被交出去時，手很小；制度替這場離別取的名字，卻一個比一個長。」
- `kk.02.shadow.m01` 男：「交接不是前一雙手放開，而是後一雙手接住以後，仍有人回頭確認。」
- `kk.02.side.f01` 女守門人：「第六個結還在手裡；我們先核對每個名稱，不讓孩子落在名詞之間。」
- `kk.02.side.m01` 男守門人：「三種安排各有邊界，責任也必須各自寫清。」

**音訊與構圖**

- BGM播12–16秒；每完成一結只有棉布摩擦，不用門扣六連響。
- 桌機六牌沿景深排列而非六個巨大門洞；手機改為三組雙牌縱向前行，交接帶全程不被字幕遮住。

### S03｜`kk-03-statistics`｜越來越多求救，進入制度

```yaml
scene_id: kk-03-statistics
anchor: "#chapter-03"
chapter: "03"
mode_duration_s: {guided_desktop: [30, 38], guided_mobile: [26, 34], cinema: [97, 128]}
primary_motif: "城市窗格中的人形留白"
continuity_in: "02第六枚繩結展開成窗格交叉點"
continuity_out: "一條窗框直線下垂，成為04布簾軌道"
source_gate:
  labels: [OFFICIAL_STATISTICS, DEFINITION_NOTE]
  required_source_ids: [SRC-CRC-STATS-2024]
  publishable: true
  fallback_if_unverified: "移除未核實數值與增幅；保留統計口徑教學，不以動畫猜測"
audio: {music_asset_id: bgm_03_inventory_of_shadows, ambience_asset_id: amb_city_roomtone}
controls: {skip_target: "#record-03", replay_policy: "可重播；數字不快速跳動", direct_read_target: "#copy-03"}
responsive: {reduced_panels: 5}
```

**正式轉接**

- 幕開：男影展開四個統計單位牌；女影將`件`與`人`分置兩側，中間留出孩子形狀的空白。
- 幕謝：臺口鏤空格紋向遠處複製為城市窗格；不以窗戶全亮作勝利圖像。
- 側視：鏡頭先看全城，再走近唯一沒有填入肖像的留白；守門人停下閱讀口徑，不伸手把空白「補滿」。
- 資料焦點：四個最終數字、年份、單位、來源、更新日期與`案件數不等於兒少人數`固定可見。
- 正文入口：數字卡縮為文內figure；章名與第一段在其下自然出現。

**建議導覽對話**

- `kk.03.shadow.m01` 男：「數字排得整齊，像城市的窗格；它證明訊息抵達，卻不證明保護已經完成。」
- `kk.03.shadow.f01` 女：「所以先分清『件』與『人』，再從表格退後一步，看見每個單位後面的生活。」
- `kk.03.side.m01` 男守門人：「這裡不缺一個漂亮的計數動畫；缺的是正確口徑與可回查的來源。」
- `kk.03.side.f01` 女守門人：「讓留白留著。它提醒我們，統計不是孩子的肖像。」

**音訊與構圖**

- BGM只取低音弦與木質敲擊12–16秒；禁用警報、計數器連響與成功提示。
- 桌機城市五層景深但視差總幅不超過20px；手機用單列三層窗格，最終數字直接出現，不逐位滾動。

### S04｜`kk-04-er-curtain`｜隔著布簾的急診記憶

```yaml
scene_id: kk-04-er-curtain
anchor: "#chapter-04"
chapter: "04"
mode_duration_s: {guided_desktop: [34, 42], guided_mobile: [28, 36], cinema: [102, 133]}
primary_motif: "月白急診布簾與輪床軌跡"
continuity_in: "03窗框直線下垂成布簾軌道"
continuity_out: "布簾下緣的三個固定點化為05三枚年份鉛字"
source_gate:
  labels: [ANONYMOUS_SUBMISSION, EDITORIAL_SCENE_RECONSTRUCTION, NOT_MEDICAL_RECORD, NOT_AUDIO_TRANSCRIPT]
  required_source_ids: [SRC-ER-LETTER, SRC-COURT-SW-1]
  publishable: true
  fallback_if_unverified: "移除逐句對話與可識別細節；只保留公開送醫時序及來源界線"
audio: {music_asset_id: bgm_04_white_curtain, ambience_asset_id: amb_er_outside_curtain}
controls: {skip_target: "#record-04", replay_policy: "敏感場景每工作階段自動進入一次；重播須主動確認", direct_read_target: "#copy-04"}
responsive: {reduced_panels: 6}
```

**正式轉接**

- 幕開：戲臺靛青布退色為月白；女影聽見輪聲後讓出通道，男影伸手至簾前又收回。
- 幕謝與匹配：使用同一塊布完成戲臺幕→急診隔簾，不另切一張醫院圖。
- 側視：鏡頭全程在簾外。輪床只有床輪與醫護鞋步的影子，守門人不追、不掀、不窺視。
- 資料焦點：先出四層來源牌，再出`公開送醫時序`與`匿名來函記憶`雙欄；重構對話獨立置於第三欄。
- 正文入口：布簾緩慢停住，資料卡上緣成為篇章眉題；聲場於3秒內退去。

**建議導覽對話**

- `kk.04.shadow.f01` 女：「布簾把病床遮住，不是把疑問抹去；看不見的地方，更不能由想像補成事實。」
- `kk.04.shadow.m01` 男：「孩子未必能完整陳述；身體、退縮與生活變化，仍可能是大人必須辨認的訊號。」
- `kk.04.side.f01` 女守門人：「輪子過去了，我們留在簾外。見證先從尊重邊界開始。」
- `kk.04.side.m01` 男守門人：「先讀公開時序，再讀來函；情境重構永遠另掛一張牌。」

**音訊與構圖**

- 〈The White Curtain〉12–18秒後完全退出；輪床聲由遠至近再遠，不使用心電歸零、哭喊、急救口令或擬真喘息。
- 桌機鏡頭沿布簾水平移動最多12vw；手機以簾軌垂直構圖，紅藍反光只掃過地磚且亮度差低於10%。
- 對話框不得遮住來源牌；`略過本場`直接聚焦資料卡，不閃過任何床內畫面。

### S05｜`kk-05-movable-type`｜從一紙修法開始

```yaml
scene_id: kk-05-movable-type
anchor: "#chapter-05"
chapter: "05"
mode_duration_s: {guided_desktop: [30, 38], guided_mobile: [26, 34], cinema: [97, 128]}
primary_motif: "活字版框與年份鉛字"
continuity_in: "04布簾下緣三點變為年份鉛字"
continuity_out: "印版抬起後留下兩個矩形凹痕，成為06兩扇病房窗"
source_gate:
  labels: [STATUTORY_HISTORY, ORGANIZATION_PUBLIC_HISTORY, EDITORIAL_QUESTION]
  required_source_ids: [SRC-GAZETTE-ADOPTION-2025, SRC-CWLF-HISTORY]
  publishable: true
  fallback_if_unverified: "只顯示有官方依據的年份；機構自述與法規沿革分欄"
audio: {music_asset_id: bgm_05_tuesdays_empty_chair, ambience_asset_id: amb_print_shop}
controls: {skip_target: "#record-05", replay_policy: "可重播；印版不做法槌聲", direct_read_target: "#copy-05"}
responsive: {reduced_panels: 5}
```

**正式轉接**

- 幕開：男女皮影共同排入三枚年份字模；女影刷去多餘墨痕，男影校正版框，不放空椅。
- 幕謝：戲臺下緣平移成印刷桌；紙張只承載可核實沿革，不飄成壓迫性紙海。
- 側視：守門人經過三站——法規沿革、機構公開歷史、專題提問；每一站各自著色，不混成單一官方敘事。
- 資料焦點：三欄卡固定顯示`誰說的／何時發布／原始連結`。
- 正文入口：最後一枚鉛字升高，成為章名首字；印刷聲停止後才進第一段。

**建議導覽對話**

- `kk.05.shadow.m01` 男：「理想被刻成字，年代也一枚枚留下；制度因此有了可以追索的來處。」
- `kk.05.shadow.f01` 女：「字能保存承諾，不能自己完成照護；還要有人把它帶進孩子每天生活的地方。」
- `kk.05.side.m01` 男守門人：「法規、機構自述與本專題提問，各用一個版框。」
- `kk.05.side.f01` 女守門人：「先看它們如何建立，再問落到現場時，哪一步仍需被確認。」

**音訊與構圖**

- BGM12–16秒；鉛字只用低幅木質落版聲，不用法槌、巨響或金屬撞擊。
- 桌機俯拍與側視各半，手機改為縱向三站；年份與來源文字均為HTML，不烙入鉛字貼圖。

### S06｜`kk-06-separate-ward`｜另一間病房裡的孩子

```yaml
scene_id: kk-06-separate-ward
anchor: "#chapter-06"
chapter: "06"
mode_duration_s: {guided_desktop: [32, 40], guided_mobile: [28, 36], cinema: [97, 128]}
primary_motif: "兩扇不同年代病房窗與中央分隔牌"
continuity_in: "05印版留下的兩個凹痕成為病房窗"
continuity_out: "中央分隔牌下緣延伸成07雙軌標尺"
source_gate:
  labels: [SEPARATE_CASE, FAMILY_QUESTION, ORGANIZATION_RESPONSE, PROSECUTORIAL_DISPOSITION]
  required_source_ids: [SRC-PEIPEI-FAMILY, SRC-PEIPEI-NEWS, SRC-PEIPEI-ORG]
  publishable: true
  fallback_if_unverified: "隱藏缺乏來源的單欄；不得以其餘兩欄推論缺失內容"
audio: {music_asset_id: bgm_06_unfinished_note, ambience_asset_id: amb_two_wards}
controls: {skip_target: "#record-06", replay_policy: "可重播；兩案不得疊影", direct_read_target: "#copy-06"}
responsive: {reduced_panels: 6}
```

**正式轉接**

- 幕開：左、右病房窗同時出現，但年代、日期與案件名稱牌先行；男女皮影各守一側，從不跨越中央分隔牌。
- 幕謝：退紅幕角變成「平安」春聯的一角；兩窗位置保持固定，不以變形讓兩名孩子重合。
- 側視：同一鏡高依序閱讀家屬疑問、機構公開回應、檢方處分三站；每站離場前，前一站標籤仍保留。
- 資料焦點：三欄來源卡下方另設`可以比較：制度接縫`與`不能合併：死因、證據、司法認定`。
- 正文入口：中央分隔牌保持到正文第一屏結束，避免轉場完成後失去案件界線。

**建議導覽對話**

- `kk.06.shadow.f01` 女：「兩扇病房窗在不同年份映著同一種冷色；悲傷可以相望，事實不能相混。」
- `kk.06.shadow.m01` 男：「家屬的疑問、機構的回應、司法的結果，必須各自站在有來源的位置。」
- `kk.06.side.f01` 女守門人：「我們只沿同一鏡高觀看，不把兩個孩子縫成一個故事。」
- `kk.06.side.m01` 男守門人：「分隔牌不是疏遠，而是對每一份證據最基本的尊重。」

**音訊與構圖**

- 〈The Unfinished Note〉12–16秒後，左右只留不同頻率的空調聲；中央維持近乎無聲，禁止兩側同時升高營造對決。
- 桌機左右各44%、中央12%來源區；手機仍左右並置但可由使用者切換焦點，中央分隔至少6vw且固定可見。

### S07｜`kk-07-115-days`｜制度留下的接縫

```yaml
scene_id: kk-07-115-days
anchor: "#chapter-07"
chapter: "07"
mode_duration_s: {guided_desktop: [32, 40], guided_mobile: [28, 36], cinema: [102, 133]}
primary_motif: "一百一十五枚藺草刻度與中斷縫線"
continuity_in: "06中央分隔牌下緣成為雙軌標尺"
continuity_out: "最後一段鬆線轉為08木梳上的一縷青絲"
source_gate:
  labels: [CONTEMPORANEOUS_RECORD, JUDICIAL_FINDING, POST_CASE_REFORM]
  required_source_ids: [SRC-COURT-SW-1, SRC-COURT-DIRECT-1, SRC-MOHW-REFORM-2024]
  publishable: true
  fallback_if_unverified: "缺失節點維持空白；事後改革不得倒寫成案發當時已有措施"
audio: {music_asset_id: null, ambience_asset_id: amb_timeline_thread_room}
controls: {skip_target: "#record-07", replay_policy: "可重播；不以紅叉標記未完成節點", direct_read_target: "#copy-07"}
responsive: {reduced_panels: 6}
```

**正式轉接**

- 幕開：男影沿藺草標尺放下日期刻度，女影把當時紀錄與後來改革分成上下兩軌；缺失處不填色。
- 幕謝：中央一段線頭保留，貼近後形成115日時間軸；不翻飛整疊卷宗。
- 側視：守門人沿刻度平行前進，在中斷處同時停下；男影伸手後收回，女影將雙軌距離拉開。
- 資料焦點：`案發當時紀錄`、`法院認定／司法資料`、`事件後改革`三層；每項節點有來源ID與核實日期。
- 正文入口：時間軸縮為可操作的sticky側欄，但關閉JavaScript時仍依日期順序完整顯示。

**建議導覽對話**

- `kk.07.shadow.m01` 男：「一百一十五枚刻度都在，紙面看似沒有失去一天。」
- `kk.07.shadow.f01` 女：「可記錄曾經存在，不等於孩子曾被完整看見；中斷的地方，不能由後來替當時補寫。」
- `kk.07.side.m01` 男守門人：「這一格沒有足夠資料，我們便讓它空著。」
- `kk.07.side.f01` 女守門人：「把當時與後來分開，才看得見制度究竟在哪裡改變，又在哪裡仍待回答。」

**音訊與構圖**

- 無旋律。只用藺草纖維、遠處空調與一次低音木響；每個日期不得配一個節拍，避免時間軸變成倒數。
- 桌機時間軸水平側移；手機改為垂直刻度，當時／後來左右雙軌並排，不用縮小橫向桌機畫面。

### S08｜`kk-08-grandmother`｜外婆的眼淚

```yaml
scene_id: kk-08-grandmother
anchor: "#chapter-08"
chapter: "08"
mode_duration_s: {guided_desktop: [36, 46], guided_mobile: [30, 40], cinema: [149, 169]}
primary_motif: "木梳、青絲轉白與未取用的面紙"
continuity_in: "07最後一段鬆線落入木梳，成為青絲"
continuity_out: "一縷白線穿入ending第一枚竹編徽章"
source_gate:
  labels: [VERIFIED_COURT_STATEMENT, ATTRIBUTED_REPORT, EDITORIAL_LITERARY_BRIDGE]
  required_source_ids: [SRC-CNA-GRANDMOTHER-1, SRC-EDITORIAL-COURT-NOTES]
  publishable: true
  fallback_if_unverified: "未能逐字核實的句子一律改成間接引述，不使用引號；文學橋段另牌標示"
audio: {music_asset_id: null, ambience_asset_id: amb_courtroom_after_session}
controls: {skip_target: "#record-08", replay_policy: "不自動循環；重播前顯示悲傷內容提醒；不得重演掩面", direct_read_target: "#copy-08"}
responsive: {reduced_panels: 7}
```

**正式轉接**

- 幕開：女影以木梳緩慢梳理青絲，男影停在戲臺外緣，不展卷；兩人說完文學對話後立即退到來源牌之外。
- 幕謝與匹配：青絲依序匹配急診布簾纖維、時間軸線與白髮；建議導覽壓縮成16–20秒，完整電影版才播放〈青絲變白頭〉73秒長鏡。
- 側視：不追外婆，不製作落淚特寫。鏡頭停在木梳、麥克風與未取用的面紙；空椅不再出現。
- 資料焦點：來源牌由`文學化皮影旁白`明確切成`外婆庭上陳述`；逐字核實、報導轉述、文學承接三者分三層。
- 正文入口：所有詩劇對話框先消失，焦點才移至外婆陳述；不可讓文學句與真實引文使用相同框色。

**建議導覽對話**

- `kk.08.shadow.f01` 女：「青絲可以在一個鏡頭裡變白；失去孩子的人，卻要用餘生承受那段時間。」
- `kk.08.shadow.m01` 男：「那便把詩句停在證人席外；她說過的話，只按能核對的來源呈現。」
- `kk.08.side.f01` 女守門人：「不要追她的眼淚。讓鏡頭留在她停手以後仍未被回答的地方。」
- `kk.08.side.m01` 男守門人：「引號只給逐字核實的句子；其餘，清楚寫明是轉述或文學承接。」

**音訊與構圖**

- 無旋律；只留法院空調、極輕衣料與一次木梳放下聲。開始顯示外婆文字前完全靜音0.8秒。
- 桌機從24mm群像慢推至50mm物件特寫，但不推向臉；手機頭頂安全區18svh，木梳與面紙置於下方可見區，字幕不蓋麥克風。

### S09｜`kk-ending-threshold`｜讓下一扇門更早打開

```yaml
scene_id: kk-ending-threshold
anchor: "#ending"
chapter: ending
mode_duration_s:
  guided_desktop: [95, 125]
  guided_mobile: [95, 125]
  cinema: [95, 125]
  cinema_optional_extended: [250, 280]
primary_motif: "責任竹榫、八枚竹編徽章與普通門檻"
continuity_in: "08白線穿入第一枚徽章"
continuity_out: "門檻水平線成為HTML守護行動區上緣"
source_gate:
  labels: [ORIGINAL_LITERARY_SHADOW, SYMBOLIC_DUAL_WORLD, NOT_REAL_PERSON_DIALOGUE]
  required_source_ids: [SRC-EDITORIAL-FOLKLORE]
  publishable: true
  fallback_if_unverified: "不適用；本場不得承載任何未在前文核實的新事實"
audio: {music_asset_id: bgm_01_flower_no_return_reprise, ambience_asset_id: amb_ordinary_morning}
controls:
  skip_target: "#ending-action"
  replay_policy: "主線可手動重播一次；不自動循環；3分15秒附章另行確認"
  direct_read_target: "#ending-action"
responsive: {reduced_panels: 12}
```

#### A段｜結尾皮影戲〈讓下一扇門更早打開〉｜65–80秒

本段是正式主線，完整保留，不得為縮短預設模式而抽句。右上角全程標示：

> **原創文學化皮影旁白｜男女皮影為守門人｜非案件人物對話｜非真實錄音｜不代表法院認定**

**人物動作與運鏡**

女影從左側帶回08留下的白線；線在穿過第一枚徽章後逐漸恢復退紅，依序穿過八枚徽章。男影從右側把卷宗端正闔上，俯身查看01回返的竹椅；他不只是「扶正」，而將刻有「責任」二字的竹榫補入鬆動榫接，使椅子第一次不再晃動。兩人走到門檻兩側，先回頭看椅，再共同推開。鏡頭由24mm慢推至50mm，不作勝利仰角。

**原創對話｜逐字保留**

**女：**戲將散了，燈也將熄。我們走過傳說、病房與法庭，留下來的，難道只能是一個孩子再也回不來的名字？

**男：**若卷宗只在悲劇以後證明誰曾經做錯，它便仍少了一頁；那一頁應當寫著，在危險成為結局以前，誰有責任依法啟動保護、及時把門打開。

**女：**花會重開，春天會回來。可是孩子失去的年歲，不能由下一季花期替他補還。

**男：**所以記住他，不是把他永遠留在最後一夜；是讓下一次傷痕出現時，有人相信，有人追問，有人不把今日寄放到明日。

**女：**也不要把保護交給傳說、運氣或某一個孤單的好人。讓每一次交接都能被確認，每一份職責都能走進門內。

**男：**那麼，請把這扇門推開。不是為了觀看悲傷，而是為了讓下一個孩子還來得及長大時，門外已經有人。

**音訊**

- 〈花開無歸期〉只以20%–25%音量回歸；第五句開始下降，最後一句前完全退去。
- 最後一句只留木門受力與普通清晨環境；不得用高潮弦樂、鐘聲、兒童合唱或掌聲。

#### B段｜雙世界主線｜30–45秒

幕謝只合至70%，中央摺痕對位為左右世界接縫。左側是無人物受難畫面的古厝，右側是醫院與法院共用的冷灰長廊；兩名成年守門人分走兩側，亡者不以第一人稱說話，也不出現天堂、鬼魂或相擁。

**正式主線對話**

- `kk.ending.side.f01` 女守門人：「古厝那一端，門閂曾比孩子的聲音更重。」
- `kk.ending.side.m01` 男守門人：「長廊這一端，訊息走得更快，責任卻仍可能停在途中。」
- `kk.ending.side.f02` 女守門人：「時代若只替制度添上名字，沒有替孩子縮短等待，進步便還欠著一段路。」
- `kk.ending.side.m02` 男守門人：「把門打開吧。不是讓悲傷重演，而是讓下一個孩子在今日就被接住。」

最後由兩人退到畫面兩側。門外只見淡蟹青天空、遠樹及可繼續前行的普通走廊；HTML接管以下文字：

> **記住他，不只是記住一場悲劇。**  
> **願下一個孩子，在傷害發生以前，就有人伸手接住。**

#### C段｜3分15秒完整雙世界詩劇｜自選附章

- 入口只在B段完成與HTML結語後出現：`觀看完整雙世界詩劇｜3分15秒`。
- 按下後先顯示`原創文學寓言｜非亡者真實話語｜成年旁白代讀，不模仿幼兒`；使用者再次確認才播放。
- 完整腳本見本總冊PART III-D〈兩個世界，同一扇門〉五段腳本；不自動接在B段後，不在回到頁面時續播，不納入建議導覽完成條件。
- `略過附章`直接返回守護行動區；完整逐字稿與四語譯文始終可讀。

**桌機／手機**

- 桌機A段保留24mm→50mm推鏡；B段左右各50%，接縫3vw。角色高度不超過52%，不作臉部煽情特寫。
- 手機A段使用獨立9:16戲臺，八枚徽章排成兩列四枚；B段仍維持左右世界，不改上下切割。說話側以900ms擴至56%，另一側退到44%，句末回到各半。
- 手機對話框位於下方獨立安全區，每張最多四行；人物頭頂至少18svh。結語一定是HTML，不烙在影片。

## 六、對話框與四語程式契約

### 對話key與長版引用表

```yaml
dialogue_registry:
  kk-opening:
    guided_shadow: [kk.opening.shadow.f01, kk.opening.shadow.m01]
    guided_sideview: [kk.opening.side.f01, kk.opening.side.m01]
    cinema_ref: "PART-IV#S00-L01..S00-L06 + PART-III-B#kk-opening"
  kk-01-chair:
    guided_shadow: [kk.01.shadow.f01, kk.01.shadow.m01]
    guided_sideview: [kk.01.side.f01, kk.01.side.m01]
    cinema_ref: "PART-I#S01-L01..S01-L06 + PART-III-B#kk-01-chair"
  kk-02-handover:
    guided_shadow: [kk.02.shadow.f01, kk.02.shadow.m01]
    guided_sideview: [kk.02.side.f01, kk.02.side.m01]
    cinema_ref: "PART-I#S02-L01..S02-L06 + PART-III-B#kk-02-handover"
  kk-03-statistics:
    guided_shadow: [kk.03.shadow.m01, kk.03.shadow.f01]
    guided_sideview: [kk.03.side.m01, kk.03.side.f01]
    cinema_ref: "PART-I#S03-L01..S03-L06 + PART-III-B#kk-03-statistics"
  kk-04-er-curtain:
    guided_shadow: [kk.04.shadow.f01, kk.04.shadow.m01]
    guided_sideview: [kk.04.side.f01, kk.04.side.m01]
    cinema_ref: "PART-I#S04-L01..S04-L06 + PART-III-B#kk-04-er-curtain"
  kk-05-movable-type:
    guided_shadow: [kk.05.shadow.m01, kk.05.shadow.f01]
    guided_sideview: [kk.05.side.m01, kk.05.side.f01]
    cinema_ref: "PART-I#S05-L01..S05-L06 + PART-III-B#kk-05-movable-type"
  kk-06-separate-ward:
    guided_shadow: [kk.06.shadow.f01, kk.06.shadow.m01]
    guided_sideview: [kk.06.side.f01, kk.06.side.m01]
    cinema_ref: "PART-I#S06-L01..S06-L06 + PART-III-B#kk-06-separate-ward"
  kk-07-115-days:
    guided_shadow: [kk.07.shadow.m01, kk.07.shadow.f01]
    guided_sideview: [kk.07.side.m01, kk.07.side.f01]
    cinema_ref: "PART-I#S07-L01..S07-L06 + PART-III-B#kk-07-115-days"
  kk-08-grandmother:
    guided_shadow: [kk.08.shadow.f01, kk.08.shadow.m01]
    guided_sideview: [kk.08.side.f01, kk.08.side.m01]
    cinema_ref: "PART-I#S08-L01..S08-L05 + PART-III-B#kk-08-grandmother"
  kk-ending-threshold:
    guided_shadow: [kk.ending.shadow.f01, kk.ending.shadow.m01, kk.ending.shadow.f02, kk.ending.shadow.m02, kk.ending.shadow.f03, kk.ending.shadow.m03]
    guided_sideview: [kk.ending.side.f01, kk.ending.side.m01, kk.ending.side.f02, kk.ending.side.m02]
    cinema_ref: "PART-I#S09-L01..S09-L06 + 本節B段；附章見PART-III-D"
```

結尾六句雖在Markdown中直接列出，locale檔仍需建立上列六個`kk.ending.shadow.*` key。`cinema_ref`只作編輯引用，前端不得以標題文字作DOM selector；正式建置時應把長版逐字稿寫入同一locale資料結構。

### 固定DOM結構

```html
<section class="kk-scene" data-scene-id="kk-04-er-curtain" data-state="sourceGate">
  <div class="kk-scene__visual" aria-hidden="true"></div>
  <div class="kk-source-gate" role="note"></div>
  <div class="kk-dialogue" role="group" aria-live="polite">
    <p data-dialogue-id="kk.04.shadow.f01"></p>
  </div>
  <article class="kk-record-card" id="record-04"></article>
  <article class="kk-reading" id="copy-04"></article>
</section>
```

- 四語文字由locale檔依相同key載入：`zh-Hant`、`zh-Hans`、`en`、`ja`；不得在JavaScript內硬寫繁中文字串。
- 每句另有`aria_label`、`speaker`、`source_label`、`min_read_ms`。繁／簡以字數、英語以單字數、日語以字元與標點重新計算停留時間，不共用繁中秒碼。
- 建議最低閱讀時間：繁簡`max(3200, 字數÷7×1000)`；英文`max(3600, 單字數÷2.7×1000)`；日文`max(3400, 字元數÷6.5×1000)`。使用者按`下一句`可提早前進；螢幕閱讀器模式不自動翻頁。
- 女皮影使用藕荷宣紙框與退紅細線；男皮影使用蟹青卷宗框與黛青細線；側視守門人統一用煙墨半透明框，但須以姓名標籤與圖形標籤雙重辨識，不能只靠顏色。
- 桌機每框寬`min(34rem, 38vw)`、最多兩行；手機寬`calc(100vw - 32px)`、最多四行，置於18–32svh的底部安全區。文字溢出時增加卡高，不縮字低於16px。

## 七、播放、略過、重播與深連結

### 控制規則

- `略過本場動畫`：從任何動畫狀態跳到該場`recordCard`，保留來源門牌焦點順序。
- `略過全部動畫`：切換`reading`模式，取消後續預載音訊與影片；不刪除逐字稿。
- `重播本場`：只在`reading`開始後出現；保存目前捲動位置，重播完回到原段落。
- `重播04／08`：先顯示敏感內容提醒；不重演床內急救、哭泣臉部、掩面或死亡反應。
- `重播ending`：A＋B最多一次連播，不自動進C；C永遠由另一按鈕啟動。
- `靜音`：立即停止BGM、環境、動作與旁白四軌，但字幕與人物動作繼續。重新開啟時只恢復當前場，不追播已錯過的cue。

### 工作階段狀態

```text
sessionStorage.kk_v6_mode
sessionStorage.kk_v6_audio_consent
sessionStorage.kk_v6_completed_scenes
sessionStorage.kk_v6_sensitive_replay_ack
```

- 回捲已完成場景只顯示靜態章門與`重播本場`，不再強迫幕開。
- 以`#chapter-04`等深連結進站時，先顯示該場來源牌；不補播opening與前面三場。
- 瀏覽器返回時恢復正文位置；不得因history navigation重新全螢幕播放。
- JavaScript失效時，順序仍為來源牌→完整對白文字→資料卡→正文；Canvas與影片只是漸進增強。

## 八、桌機、手機與 Reduced Motion共同規格

### 桌機16:9

- 戲臺與側視共用`100svh`容器，建議畫布1920×1080；DOM資料卡預先存在，不在轉場時重新掛載。
- 人物腳底基線72–76svh；章名安全區12–22svh；來源牌固定上方，不與對話框共享層級。
- 最多四層2.5D視差：前景8px、中景14px、後景20px、氣氛層4px；禁止滑鼠追蹤造成暈動。
- 材質匹配前後的同構物位置差不超過畫面寬3%；禁止全黑或全白過場。

### 手機9:16

- 每場必須有獨立1080×1920構圖或等比例圖層；不得裁切1920×1080桌機母版。
- 人物高度36%–42%，頭頂安全區至少18svh；瀏覽器工具列出現時仍不得裁掉髮髻、上簷與來源牌。
- 側視以一次短步行、一次回望、一次觸物完成；不做大幅橫向視差。素材匹配完成後立即解除捲動鎖定。
- 觸控目標至少44×44 CSS px；`略過`、`靜音`、`文字版`固定可見，但不能壓住對話。
- 不得出現OBS、時間碼、錄影框、游標、除錯狀態或播放軟體浮水印。

### Reduced Motion

- 取消幕布位移、材質形變、橫移、視差、閃光、髮絲飄動、數字動態與門扇運動。
- 以400–600ms透明度淡入切換靜態圖；同一畫面亮度差不超過8%。
- 完整對白不是縮寫；由`上一段／下一段`手動控制，來源牌和資料卡不可略過。
- 所有影片設`aria-hidden="true"`，完整文字、alt、來源與操作狀態都在DOM；焦點不能落入不可見場景。

## 九、Scene事件與驗收介面

```text
kk:scene:source-open
kk:scene:source-accepted
kk:scene:start
kk:scene:dialogue-change
kk:scene:skip
kk:scene:record-open
kk:scene:reading
kk:scene:complete
kk:scene:replay
kk:audio:mute
kk:mode:change
```

事件payload至少包含`scene_id`、`mode`、`locale`、`source_status`、`elapsed_ms`，但不得收集使用者閱讀急診或外婆段落的內容選擇作個人剖析。分析工具只記錄場景完成與模式，不記錄對話逐句停留。

## 十、V6播放驗收清單

- [ ] 全站只有本節一份`canonical_sequence`；舊版播放規則不再被前端引用。
- [ ] 十場均可依穩定`scene_id`找到，且順序與`canonical_sequence`一致。
- [ ] 每場都有來源門牌、幕開、皮影對話、反應停留、幕謝、材質匹配、側視對話、資料焦點、資料卡與正文入口。
- [ ] `略過本場`永遠落在資料卡，不會越過來源資訊。
- [ ] opening內的民間傳說與司法結果在畫面切換時同步換牌；不共享來源色。
- [ ] 04來函、公開時序與情境重構分層；06兩案分隔；07當時／後來分軌；08逐字引文／報導轉述／文學承接分層。
- [ ] 01–08各自遵守主意象，不以門、紙、光、空椅重複製造同一種高潮。
- [ ] 結尾A段完整保留65–80秒六段對話；B段30–45秒；3分15秒版本只作主動選播。
- [ ] 結尾最後一句前音樂完全退去；普通清晨後由HTML結語接管。
- [ ] 四語均能由相同dialogue key載入，且每語字幕不溢出、不共用繁中秒碼。
- [ ] 桌機與手機使用獨立構圖；手機人物頭頂至少18svh，無OBS或開發UI。
- [ ] Reduced Motion沒有位移、閃光與自動翻頁；直接閱讀可完全不載入影片與音訊。
- [ ] 重播不循環急救、外婆哭泣、亡者形象、兄嫂死亡或記者閃光。
- [ ] 所有`required_source_ids`均存在、可開啟且狀態合格；建置產物中不存在`TBD`、`上線前補`、空連結或待查字樣。
- [ ] 正文始終是唯一完整敘事層；動畫不新增未核實事實，不取代法院認定、引文、數字、日期與編輯警語。
