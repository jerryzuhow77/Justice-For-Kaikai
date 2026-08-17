# V6 合併模組｜四語文案、效能與正式資產交付規格

> **用途：**本節可直接合併至《剴剴案特別專題｜第一章：沒有父母的孤兒》V6 製作母稿。它是四語介面、四語核心文案、SEO、無障礙文字、正式資產、載入策略與聲音交付的唯一準據。正文事實、司法狀態與 Scene Manifest 仍分別由「上站正文」與「查證／場景資料檔」管理，不在翻譯檔內重複寫死。
>
> **版本：**V6｜2026-08-16  
> **專題代碼：**`kaikai-ch01`  
> **前端根節點：**`[data-feature="kaikai-ch01"][data-version="v6"]`  
> **共用瀏覽計數鍵：**`case-kaikai-chair-bound-child-shared`

---

## A. 四語發布架構與單一文字來源

### A.1 語言、路由與字體

| 語言 | `lang` | 正式呈現 | 路由／切換 | 標題字體 | 正文字體 |
|---|---|---|---|---|---|
| 繁體中文 | `zh-Hant` | 實體 HTML，預設語言 | `/cases/kaikai/features/chair-bound-child/` | `Noto Serif TC`, `Source Han Serif TC`, serif | `Noto Sans TC`, system-ui, sans-serif |
| 簡體中文 | `zh-Hans` | 與繁中共用實體頁，由人工校對字表切換 | 同一 URL；`localStorage.siteLang=zh-Hans`，可接受 `?lang=zh-Hans` 作分享入口，但 canonical 仍指向無參數網址 | `Noto Serif SC`, `Source Han Serif SC`, serif | `Noto Sans SC`, system-ui, sans-serif |
| English | `en` | 獨立 HTML、人工在地化 | `/en/cases/kaikai/features/chair-bound-child/` | `Source Serif 4`, `Noto Serif`, serif | `Inter`, system-ui, sans-serif |
| 日本語 | `ja` | 獨立 HTML、人工在地化 | `/ja/cases/kaikai/features/chair-bound-child/` | `Noto Serif JP`, serif | `Noto Sans JP`, system-ui, sans-serif |

實作規則：

1. 四語共用同一組無字圖片、皮影人物、音效與音樂，不製作燒字圖片。
2. `title`、`meta description`、Open Graph、Twitter Card、JSON-LD、`alt`、`aria-label`、`title`、`placeholder`、按鈕狀態與錯誤訊息都必須進入 i18n 字典；不可只轉換畫面上的正文。
3. 切換簡體時同步更新 `<html lang="zh-Hans">`、`document.title`、description、Open Graph、分享文案與所有無障礙屬性。臺語原句、羅馬字、姓名、裁判字號、URL、程式鍵與檔名列入 `translate="no"`。
4. 英文與日文是語意在地化，不由繁中執行即時機翻。英文正文寬度上限 `68ch`；日文套用 `line-break: strict; word-break: normal; overflow-wrap: anywhere;`，避免標點置於行首。
5. `hreflang` 至少輸出 `zh-Hant`、`en`、`ja` 與 `x-default`。現行簡中沒有獨立可索引 URL，不能輸出虛構的 `zh-Hans hreflang`；日後若建立 `/zh-cn/` 實體頁，再補上。
6. 四語切換保留目前章節錨點與閱讀模式，例如由繁中 `#chapter-04` 切到英文時仍落在 `#chapter-04`，不得把讀者送回頁首或重新自動播放動畫。

### A.2 四語正式頁名、章名與專題副標

| key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `case.name` | 剴剴案 | 剴剴案 | The Kai-Kai Case | 剴剴事件 |
| `feature.eyebrow` | 剴剴案特別專題｜第一章 | 剴剴案特别专题｜第一章 | The Kai-Kai Case — Special Feature, Chapter One | 剴剴事件 特別企画｜第1章 |
| `feature.title` | 沒有父母的孤兒 | 没有父母的孤儿 | An Orphan in All but Name | 親のいない孤児のように |
| `feature.subtitle` | 從一張舊木椅，到一道沒有及時打開的門 | 从一张旧木椅，到一道没有及时打开的门 | From an old wooden chair to a door that did not open in time | 古い木の椅子から、間に合わなかった一枚の扉へ |
| `feature.form` | 觀察式紀錄片 × 文學化轉場 × 司法檔案查證 × 互動長卷 | 观察式纪录片 × 文学化转场 × 司法档案查证 × 互动长卷 | Observational documentary × literary transitions × verified court records × interactive scroll | 観察型ドキュメンタリー × 文学的転換 × 司法資料の検証 × インタラクティブ長巻 |
| `feature.legal_title_note` | 「沒有父母的孤兒」是文學命題，不是法律身分認定。 | “没有父母的孤儿”是文学命题，不是法律身份认定。 | “An Orphan in All but Name” is a literary framing, not a legal determination of the child’s status. | 「親のいない孤児のように」は文学的な表現であり、法的身分を認定するものではありません。 |

### A.3 八篇章正式名稱

| scene／anchor | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `ch01` / `#chapter-01` | 01｜古老的傳說：綁在椅子上的孩子 | 01｜古老的传说：绑在椅子上的孩子 | 01 — An Old Legend: The Child Bound to a Chair | 01｜古い伝承――椅子に縛られた子ども |
| `ch02` / `#chapter-02` | 02｜當孩子必須離開原來的家 | 02｜当孩子必须离开原来的家 | 02 — When a Child Must Leave Home | 02｜子どもが元の家を離れなければならないとき |
| `ch03` / `#chapter-03` | 03｜越來越多求救，進入制度 | 03｜越来越多求救，进入制度 | 03 — More Cries for Help Enter the System | 03｜増え続ける助けを求める声、その先にある制度 |
| `ch04` / `#chapter-04` | 04｜隔著布簾的急診記憶 | 04｜隔着布帘的急诊记忆 | 04 — An Emergency-Room Memory Beyond the Curtain | 04｜カーテン越しに残った救急室の記憶 |
| `ch05` / `#chapter-05` | 05｜從一紙修法開始：兒福聯盟的誕生 | 05｜从一纸修法开始：儿福联盟的诞生 | 05 — From a Single Amendment: The Birth of the Child Welfare League Foundation | 05｜一枚の法改正案から――児童福祉連盟の誕生 |
| `ch06` / `#chapter-06` | 06｜珮珮：另一間病房裡的孩子 | 06｜珮珮：另一间病房里的孩子 | 06 — Pei-Pei: The Child in Another Hospital Room | 06｜珮珮――もう一つの病室にいた子ども |
| `ch07` / `#chapter-07` | 07｜從珮珮到剴剴：制度留下的接縫 | 07｜从珮珮到剴剴：制度留下的接缝 | 07 — From Pei-Pei to Kai-Kai: The Gaps the System Left Behind | 07｜珮珮から剴剴へ――制度に残された継ぎ目 |
| `ch08` / `#chapter-08` | 08｜外婆的眼淚：第二章前夜 | 08｜外婆的眼泪：第二章前夜 | 08 — A Grandmother’s Tears: On the Eve of Chapter Two | 08｜祖母の涙――第2章前夜 |

姓名原則：繁、簡頁均保留「剴剴」「珮珮」原字；英文採 `Kai-Kai`、`Pei-Pei`；日文正文首次出現時寫作「剴剴（カイカイ）」「珮珮（ペイペイ）」，其後保留漢字，不擅自改成其他姓名。

---

## B. 四語核心導言與結尾文案

### B.1 繁體中文｜核心導言

> **花有重開日，人無再少年。**  
> **應須惜兒孫，安樂是天倫。**

花謝了，尚有下一個春天；人的童年一旦過去，卻沒有誰能替他重新活過。所謂天倫，不只是把孩子留在一個屋簷下，而是在他還不會替自己說話時，有人肯俯下身，辨認他的沉默；在傷痕還沒有成為結局以前，有人願意把門真正打開。

這一章從民間傳說的一張木椅開始，沿著制度的六扇門、城市裡愈來愈多的求救、一道急診布簾、兩個孩子的名字、一本本訪視紀錄，走到法院裡外婆低垂的白髮。它不是要把悲劇寫得更奇異，而是把每一段仍可核對的文字放回原位：哪些是傳說，哪些是來函，哪些是機構說明，哪些是檢辯主張，哪些才是法院認定。

> **囝仔人，有耳無喙。**  
> *Gín-á-lâng, ū hīnn bô tshuì.*  
> 孩子往往聽得懂大人的世界，卻沒有足夠的語言與力量說明自己的處境。「沒有說」不等於「沒有受傷」；越是無法完整陳述的孩子，越需要大人從身體、情緒與生活變化裡，讀懂他來不及說出的話。

**首頁案件導覽：**

一張空著的竹椅，一雙來不及穿大的鞋，三扇通往老宅、醫院與法院的門。剴剴短短的一生，留下訪視紀錄、訊息、急診布簾與法庭證詞。紙面並非全然空白；真正空下來的，是那張本應有人坐在孩子身旁、仔細看著他的椅子。

本章沿著留下來的紀錄，重新走過生命最後的一百一十五天。不是為了把孩子留在悲劇裡，而是追問：當一個孩子被交進龐大而分散的制度，誰應該從第一扇門開始，陪他走到安全的明天？

### B.2 簡體中文｜核心导言

> **花有重开日，人无再少年。**  
> **应须惜儿孙，安乐是天伦。**

花谢了，尚有下一个春天；人的童年一旦过去，却没有谁能替他重新活过。所谓天伦，不只是把孩子留在一个屋檐下，而是在他还不会替自己说话时，有人肯俯下身，辨认他的沉默；在伤痕还没有成为结局以前，有人愿意把门真正打开。

这一章从民间传说的一张木椅开始，沿着制度的六扇门、城市里越来越多的求救、一道急诊布帘、两个孩子的名字、一本本访视记录，走到法院里外婆低垂的白发。它不是要把悲剧写得更奇异，而是把每一段仍可核对的文字放回原位：哪些是传说，哪些是来函，哪些是机构说明，哪些是检辩主张，哪些才是法院认定。

> **囝仔人，有耳無喙。**  
> *Gín-á-lâng, ū hīnn bô tshuì.*  
> 孩子往往听得懂大人的世界，却没有足够的语言与力量说明自己的处境。“没有说”不等于“没有受伤”；越是无法完整陈述的孩子，越需要大人从身体、情绪与生活变化里，读懂他来不及说出的话。

**首页案件导览：**

一张空着的竹椅，一双来不及穿大的鞋，三扇通往老宅、医院与法院的门。剴剴短短的一生，留下访视记录、讯息、急诊布帘与法庭证词。纸面并非全然空白；真正空下来的，是那张本应有人坐在孩子身旁、仔细看着他的椅子。

本章沿着留下来的记录，重新走过生命最后的一百一十五天。不是为了把孩子留在悲剧里，而是追问：当一个孩子被交进庞大而分散的制度，谁应该从第一扇门开始，陪他走到安全的明天？

### B.3 English｜Core introduction

> **Flowers may bloom again, but childhood does not return.**  
> **Cherish the children; a peaceful family life is among our deepest blessings.**

After a flower falls, another spring may come. Once a childhood has passed, however, no one can live it again on a child’s behalf. Family care means more than keeping a child beneath a roof. It means bending down to read a child’s silence before that child has the words to speak, and opening the door before an injury becomes an ending.

This chapter begins with a wooden chair from a folk legend. It moves through six institutional doors, the growing number of calls for help across the city, an emergency-room curtain, the names of two children, and page after page of visit records, before arriving at a grandmother’s bowed, whitening hair in court. Its purpose is not to make tragedy stranger or more dramatic. It is to return every verifiable statement to its proper place: what belongs to legend, what came from a reader’s letter, what an organization stated, what prosecutors and defendants argued, and what a court actually found.

> **“A child has ears, but no mouth.” — Taiwanese Hokkien saying**  
> *Gín-á-lâng, ū hīnn bô tshuì.*  
> Children often understand more of the adult world than they have the language or power to explain. Not speaking is not the same as being unharmed. The less able a child is to give a complete account, the more carefully adults must read changes in the child’s body, emotions, and daily life.

**Case guide:**

An empty bamboo chair. A pair of shoes the child never had time to outgrow. Three doors leading toward an old house, a hospital, and a courthouse. Kai-Kai’s short life left behind visit records, messages, an emergency-room curtain, and courtroom testimony. The paper trail was not entirely blank. What remained truly empty was the chair where an adult should have sat beside him and looked closely enough to see.

Following the records that remain, this chapter retraces the final 115 days of his life. It does not keep a child suspended inside tragedy. It asks a harder question: when a child is handed into a vast and fragmented system, who must begin at the first door and stay with that child all the way to safety?

### B.4 日本語｜中核導入文

> **花は再び咲く日があっても、人に二度目の少年時代はない。**  
> **子や孫を慈しみ、安らかな団らんを尊ぶべきだ。**

花が散っても、次の春は訪れます。しかし、一度過ぎた子ども時代を、その子に代わって生き直せる人はいません。家族のぬくもりとは、ただ同じ屋根の下に子どもを置くことではありません。まだ自分の言葉で訴えられないときに身をかがめ、その沈黙を読み取り、傷が結末になる前に扉を本当に開くことです。

この章は、民間伝承に残る一脚の木の椅子から始まります。制度の六つの扉、街で増え続ける助けを求める声、救急室のカーテン、二人の子どもの名、何冊もの訪問記録をたどり、法廷でうつむく祖母の白髪へと進みます。悲劇をより奇異に描くためではありません。今も確かめられる言葉を、本来あるべき場所へ戻すためです。何が伝承で、何が寄せられた手紙で、何が機関の説明で、何が検察・弁護側の主張であり、何が裁判所の認定なのかを区別します。

> **「子どもには耳があっても、口がない」――台湾語のことわざ**  
> *Gín-á-lâng, ū hīnn bô tshuì.*  
> 子どもは大人の世界を理解していても、自分の置かれた状況を説明する言葉や力を十分に持っていないことがあります。「話さなかった」ことは「傷ついていなかった」ことを意味しません。自分で十分に語れない子どもほど、身体、感情、暮らしの変化から、間に合わなかった言葉を大人が読み取る必要があります。

**事件への案内：**

空いたままの竹の椅子。履きつぶすほど大きくなる時間のなかった一足の靴。古い家、病院、裁判所へ続く三つの扉。剴剴の短い生涯は、訪問記録、メッセージ、救急室のカーテン、法廷での証言を残しました。書類がすべて空白だったわけではありません。本当に空いたままだったのは、本来なら大人が子どものそばに腰を下ろし、注意深く見守るはずだった椅子です。

この章は、残された記録をたどりながら、人生最後の115日間を歩き直します。子どもを悲劇の中に閉じ込めるためではありません。広大で分断された制度へ子どもが委ねられたとき、誰が最初の扉から安全な明日まで、その子とともに歩くべきだったのかを問い直すためです。

### B.5 四語結尾核心句

**繁體中文**

> **記住他，不只是記住一場悲劇。**  
> **願下一個孩子，在傷害發生以前，就有人伸手接住。**

**簡體中文**

> **记住他，不只是记住一场悲剧。**  
> **愿下一个孩子，在伤害发生以前，就有人伸手接住。**

**English**

> **To remember him is not merely to remember a tragedy.**  
> **May the next child be met by an outstretched hand before harm can happen.**

**日本語**

> **あの子を記憶することは、一つの悲劇を記憶するだけではありません。**  
> **次の子どもが傷つけられる前に、差し伸べられる手がありますように。**

---

## C. 四語全站介面字典

### C.1 導覽、閱讀與章節控制

| i18n key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `nav.home` | 首頁 | 首页 | Home | ホーム |
| `nav.special_features` | 特別專題 | 特别专题 | Special Features | 特別企画 |
| `nav.project_link` | 專案網站 | 项目网站 | Project website | プロジェクトサイト |
| `nav.kaikai` | 剴剴案 | 剴剴案 | The Kai-Kai Case | 剴剴事件 |
| `nav.prologue` | 序幕｜從古老傳說走進現代案件 | 序幕｜从古老传说走进现代案件 | Prologue — From an Old Legend to a Modern Case | 序幕｜古い伝承から現代の事件へ |
| `nav.chapter_one` | 第一章｜沒有父母的孤兒 | 第一章｜没有父母的孤儿 | Chapter One — An Orphan in All but Name | 第1章｜親のいない孤児のように |
| `nav.reading_map` | 閱讀地圖 | 阅读地图 | Reading map | 読書マップ |
| `nav.case_quick_read` | 案件速讀 | 案件速读 | Case at a glance | 事件の要点 |
| `nav.timeline` | 一百一十五天時間軸 | 一百一十五天时间轴 | The final 115 days | 最後の115日間 |
| `nav.judicial_progress` | 司法進度 | 司法进度 | Judicial status | 司法手続の状況 |
| `nav.sources` | 資料來源與編輯說明 | 资料来源与编辑说明 | Sources and editorial notes | 資料・編集方針 |
| `nav.action` | 守護行動 | 守护行动 | Protection in action | 子どもを守るために |
| `nav.next_feature` | 進入第二章｜沒人要的孩子 | 进入第二章｜没人要的孩子 | Continue to Chapter Two — The Child No One Wanted | 第2章へ｜「誰にも望まれなかった子」 |
| `nav.back_to_top` | 回到頁首 | 回到页首 | Back to top | ページ上部へ |
| `nav.back_to_prologue` | 回到序幕 | 回到序幕 | Back to the prologue | 序幕へ戻る |
| `nav.previous_section` | 上一篇 | 上一篇 | Previous section | 前の節へ |
| `nav.next_section` | 下一篇 | 下一篇 | Next section | 次の節へ |
| `nav.open_chapter_menu` | 開啟篇章選單 | 打开篇章菜单 | Open chapter menu | 章メニューを開く |
| `nav.close_chapter_menu` | 關閉篇章選單 | 关闭篇章菜单 | Close chapter menu | 章メニューを閉じる |
| `nav.current_section` | 目前篇章 | 当前篇章 | Current section | 現在の節 |
| `nav.reading_progress` | 閱讀進度 | 阅读进度 | Reading progress | 読了進捗 |
| `nav.section_of_total` | 第 {current} 篇，共 {total} 篇 | 第 {current} 篇，共 {total} 篇 | Section {current} of {total} | 全{total}節中{current}節 |
| `nav.share` | 分享本專題 | 分享本专题 | Share this feature | この特集を共有 |
| `nav.copy_link` | 複製目前段落連結 | 复制当前段落链接 | Copy link to this section | この節のリンクをコピー |
| `nav.link_copied` | 連結已複製 | 链接已复制 | Link copied | リンクをコピーしました |
| `nav.print` | 列印／儲存純文字版 | 打印／保存纯文字版 | Print or save the text edition | テキスト版を印刷・保存 |

### C.2 四種閱讀模式

| i18n key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `mode.heading` | 選擇閱讀方式 | 选择阅读方式 | Choose how to read | 読み方を選ぶ |
| `mode.guided.name` | 導覽閱讀｜建議 | 导览阅读｜推荐 | Guided reading — recommended | ガイド付きで読む｜推奨 |
| `mode.guided.desc` | 依唯一正式順序播放短版開場、篇章轉場與結尾；完整正文與來源皆保留。 | 按唯一正式顺序播放短版开场、篇章转场与结尾；保留完整正文与来源。 | Follows the official sequence with the short opening, chapter transitions, and ending. All text and sources remain available. | 正式な順序に沿って短いオープニング、各節の転換、エンディングを再生します。本文と資料はすべて読めます。 |
| `mode.cinematic.name` | 完整電影模式 | 完整电影模式 | Full cinematic mode | 完全映像モード |
| `mode.cinematic.desc` | 播放完整開場、八篇皮影與陰翳側視動畫，以及延伸結尾；可隨時略過、暫停或退出。 | 播放完整开场、八篇皮影与阴翳侧视动画，以及延伸结尾；可随时跳过、暂停或退出。 | Plays the full opening, all eight shadow-play and side-view sequences, and the extended ending. You can pause, skip, or leave at any time. | 完全版オープニング、全8節の影絵と横視点映像、拡張エンディングを再生します。いつでも一時停止・スキップ・終了できます。 |
| `mode.text.name` | 直接閱讀｜無動畫 | 直接阅读｜无动画 | Read the text — no animation | テキストで読む｜アニメーションなし |
| `mode.text.desc` | 直接顯示案件速讀、完整正文、司法狀態與來源；不播放動畫或聲音。 | 直接显示案件速读、完整正文、司法状态与来源；不播放动画或声音。 | Goes directly to the case summary, full text, judicial status, and sources, with no animation or sound. | 事件の要点、本文、司法手続の状況、資料を直接表示します。映像と音声は再生しません。 |
| `mode.reduced.name` | 減少動態 | 减少动态 | Reduced motion | 動きを減らす |
| `mode.reduced.desc` | 以靜態戲臺、完整文字對白與手動前進的圖卡取代位移、閃光與自動翻頁。 | 以静态戏台、完整文字对白与手动前进的图卡，取代位移、闪光与自动翻页。 | Replaces movement, flashes, and automatic progression with static stage images, complete text dialogue, and manually advanced cards. | 移動・点滅・自動送りを使わず、静止した舞台画像、全文の台詞、手動で進むカードを表示します。 |
| `mode.remember_choice` | 在這台裝置記住我的選擇 | 在此设备上记住我的选择 | Remember my choice on this device | この端末で選択を記憶する |
| `mode.change` | 更改閱讀方式 | 更改阅读方式 | Change reading mode | 読み方を変更 |
| `mode.active_guided` | 目前為導覽閱讀 | 当前为导览阅读 | Guided reading is active | ガイド付き表示中 |
| `mode.active_cinematic` | 目前為完整電影模式 | 当前为完整电影模式 | Full cinematic mode is active | 完全映像モードで表示中 |
| `mode.active_text` | 目前為直接閱讀模式 | 当前为直接阅读模式 | Text-only reading is active | テキスト表示中 |
| `mode.active_reduced` | 目前為減少動態模式 | 当前为减少动态模式 | Reduced-motion mode is active | 動きを減らすモードで表示中 |

### C.3 動畫、字幕與音訊控制

| i18n key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `control.start` | 開始導覽 | 开始导览 | Begin | 開始する |
| `control.continue` | 繼續觀看 | 继续观看 | Continue | 続ける |
| `control.pause` | 暫停動畫 | 暂停动画 | Pause animation | アニメーションを一時停止 |
| `control.resume` | 繼續動畫 | 继续动画 | Resume animation | アニメーションを再開 |
| `control.skip_opening` | 略過開場 | 跳过开场 | Skip opening | オープニングをスキップ |
| `control.skip_scene` | 略過本段動畫 | 跳过本段动画 | Skip this sequence | この映像をスキップ |
| `control.exit_cinematic` | 退出沉浸動畫 | 退出沉浸动画 | Exit cinematic mode | 映像モードを終了 |
| `control.replay_opening` | 重新觀看開場 | 重新观看开场 | Replay opening | オープニングをもう一度見る |
| `control.replay_scene` | 重看本段動畫 | 重看本段动画 | Replay this sequence | この映像をもう一度見る |
| `control.next_frame` | 下一張靜態畫面 | 下一张静态画面 | Next still | 次の静止画 |
| `control.previous_frame` | 上一張靜態畫面 | 上一张静态画面 | Previous still | 前の静止画 |
| `control.open_transcript` | 閱讀動畫逐字稿 | 阅读动画逐字稿 | Read animation transcript | 映像の全文を読む |
| `control.close_transcript` | 關閉逐字稿 | 关闭逐字稿 | Close transcript | 全文を閉じる |
| `control.sound_on` | 開啟配樂與音效 | 开启配乐与音效 | Enable music and sound | 音楽と効果音をオン |
| `control.sound_off` | 關閉配樂與音效 | 关闭配乐与音效 | Mute music and sound | 音楽と効果音をオフ |
| `control.sound_state_on` | 配樂與音效：開 | 配乐与音效：开 | Music and sound: On | 音楽と効果音：オン |
| `control.sound_state_off` | 配樂與音效：關 | 配乐与音效：关 | Music and sound: Off | 音楽と効果音：オフ |
| `control.sound_unavailable` | 目前無法播放音訊；文章與聲音文字說明仍可閱讀。 | 当前无法播放音频；文章与声音文字说明仍可阅读。 | Audio is unavailable. The article and written sound descriptions remain available. | 音声を再生できません。本文と音の説明文はそのまま読めます。 |
| `control.sound_description` | 閱讀聲音文字說明 | 阅读声音文字说明 | Read sound description | 音の説明を読む |
| `control.reduce_effects` | 減少動態與閃光 | 减少动态与闪光 | Reduce motion and flashes | 動きと点滅を抑える |
| `control.effects_reduced` | 已改用靜態轉場 | 已改用静态转场 | Static transitions are active | 静止画による転換に切り替えました |
| `control.fullscreen` | 全螢幕觀看 | 全屏观看 | Enter full screen | 全画面で見る |
| `control.exit_fullscreen` | 離開全螢幕 | 退出全屏 | Exit full screen | 全画面を終了 |
| `control.close` | 關閉 | 关闭 | Close | 閉じる |

### C.4 資料、司法與行動按鈕

| i18n key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `action.open_quick_read` | 先看案件速讀 | 先看案件速读 | Read the case summary first | まず事件の要点を読む |
| `action.open_sources` | 先閱讀資料來源 | 先阅读资料来源 | Review sources first | 先に資料を確認 |
| `action.read_full_text` | 展開完整正文 | 展开完整正文 | Read the full text | 本文をすべて読む |
| `action.open_source` | 開啟原始來源 | 打开原始来源 | Open original source | 原資料を開く |
| `action.source_details` | 查看來源層級與核對日期 | 查看来源层级与核对日期 | View source level and verification date | 資料区分と確認日を見る |
| `action.compare_claims` | 對照各方說法 | 对照各方说法 | Compare the accounts | 各者の説明を照合 |
| `action.view_ruling` | 閱讀公開裁判資料 | 阅读公开裁判资料 | Read the public court record | 公開裁判資料を読む |
| `action.view_legal_tracks` | 分開查看兩條司法程序 | 分开查看两条司法程序 | View the two proceedings separately | 二つの司法手続を分けて見る |
| `action.view_intervention_points` | 查看可能介入時點 | 查看可能介入时点 | View possible intervention points | 介入できた可能性のある時点を見る |
| `action.protection_steps` | 看見以後，可以怎麼做 | 看见以后，可以怎么做 | What to do after noticing a warning sign | 兆候に気づいたときにできること |
| `action.help_resources` | 開啟兒少保護求助資訊 | 打开儿童保护求助信息 | Open child-protection help resources | 子どもの保護に関する相談先を開く |
| `action.continue_ch2` | 進入第二章 | 进入第二章 | Continue to Chapter Two | 第2章へ進む |

---

## D. 四語來源牌、內容提醒與司法警語

### D.1 來源層級牌

每一張敘事卡只能綁定一個主來源牌；若同一句涉及多層來源，拆卡呈現，不以一排五個徽章掩蓋來源差異。色彩僅為輔助，牌面必須有完整文字。

| source key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `source.court_finding` | 法院認定 | 法院认定 | Court finding | 裁判所の認定 |
| `source.final_judgment` | 終局裁判 | 终局裁判 | Final judgment | 確定判決 |
| `source.public_judgment` | 公開裁判資料 | 公开裁判资料 | Public court record | 公開裁判資料 |
| `source.procedural_status` | 司法程序進度 | 司法程序进度 | Procedural status | 司法手続の状況 |
| `source.prosecution_claim` | 檢方主張 | 检方主张 | Prosecution position | 検察側の主張 |
| `source.defense_claim` | 辯方主張 | 辩方主张 | Defense position | 弁護側の主張 |
| `source.disputed` | 各方有爭議 | 各方有争议 | Disputed | 当事者間で争いあり |
| `source.not_court_found` | 公開裁判未認定 | 公开裁判未认定 | Not established by the public court record | 公開裁判資料では認定されていません |
| `source.official_statistics` | 官方統計 | 官方统计 | Official statistics | 公的統計 |
| `source.government_statement` | 政府機關說明 | 政府机关说明 | Government statement | 行政機関の説明 |
| `source.organization_statement` | 機構公開說明 | 机构公开说明 | Organization’s public statement | 団体の公表説明 |
| `source.court_reporting` | 庭審報導 | 庭审报道 | Court reporting | 公判報道 |
| `source.observation_notes` | 旁聽／採訪筆記 | 旁听／采访笔记 | Observation or interview notes | 傍聴・取材メモ |
| `source.family_account` | 家屬陳述 | 家属陈述 | Family account | 家族の説明 |
| `source.reader_letter` | 未具名讀者來函 | 未具名读者来函 | Anonymous reader’s letter | 匿名読者からの手紙 |
| `source.personal_memory` | 個人記憶 | 个人记忆 | Personal recollection | 個人の記憶 |
| `source.media_report` | 媒體報導 | 媒体报道 | Media report | 報道 |
| `source.folk_legend` | 民間傳說 | 民间传说 | Folk legend | 民間伝承 |
| `source.literary_reconstruction` | 文學化情境重構 | 文学化情境重构 | Literary reconstruction | 文学的な場面再構成 |
| `source.original_shadow_play` | 原創皮影詩劇 | 原创皮影诗剧 | Original shadow-play verse | オリジナル影絵詩劇 |
| `source.symbolic_dialogue` | 象徵性原創對白 | 象征性原创对白 | Original symbolic dialogue | 象徴的な創作対話 |
| `source.not_recording` | 非錄音逐字稿 | 非录音逐字稿 | Not a recording or verbatim transcript | 録音・逐語記録ではありません |
| `source.not_independently_verified` | 本站無法獨立核實 | 本站无法独立核实 | Not independently verified by this site | 当サイトでは独自に確認できていません |
| `source.updated` | 已更新 | 已更新 | Updated | 更新済み |
| `source.corrected` | 已更正 | 已更正 | Corrected | 訂正済み |
| `source.last_verified` | 最後核對：{date} | 最后核对：{date} | Last verified: {date} | 最終確認：{date} |

### D.2 全頁內容提醒

**繁體中文**

> **閱讀前提醒**  
> 本專題涉及兒童受虐、死亡、急救與司法程序。頁面不展示兒童傷勢、遺體或施虐過程，但部分文字可能令人不適。你可以選擇「直接閱讀」、略過任何動畫，或隨時離開。若你正在陪伴兒童閱讀，建議先由成人查看案件速讀與內容來源。

**簡體中文**

> **阅读前提醒**  
> 本专题涉及儿童受虐、死亡、急救与司法程序。页面不展示儿童伤势、遗体或施虐过程，但部分文字可能令人不适。你可以选择“直接阅读”、跳过任何动画，或随时离开。如果你正在陪伴儿童阅读，建议先由成人查看案件速读与内容来源。

**English**

> **Before you continue**  
> This feature discusses child abuse, death, emergency treatment, and legal proceedings. It does not show a child’s injuries, remains, or acts of abuse, but some passages may still be distressing. You may choose the text edition, skip any animation, or leave at any time. If you are reading with a child, an adult should review the case summary and source notes first.

**日本語**

> **お読みになる前に**  
> この特集には、児童虐待、死亡、救急医療、司法手続に関する記述があります。子どもの傷、遺体、虐待行為そのものを映像で示すことはありませんが、つらく感じられる文章が含まれます。テキスト版を選び、映像をスキップし、いつでもページを離れることができます。子どもと一緒に読む場合は、まず大人が事件の要点と資料注記を確認してください。

### D.3 重構與急診段落專用提醒

**繁體中文**

> 以下急診段落依未具名讀者來函進行情境重構，並參照一般急診空間與工作流程安排鏡頭。它不是錄音逐字稿、病歷、法庭認定或對任何醫護人員言行的事實判斷。可核對的送醫時序、來函記憶與文學化承接，均以不同來源牌分開呈現。

**簡體中文**

> 以下急诊段落依据未具名读者来函进行情境重构，并参照一般急诊空间与工作流程安排镜头。它不是录音逐字稿、病历、法院认定，也不是对任何医护人员言行的事实判断。可核对的送医时序、来函记忆与文学化承接，均以不同来源牌分开呈现。

**English**

> The following emergency-room sequence is a staged reconstruction based on an anonymous reader’s letter and the ordinary layout and workflow of an emergency department. It is not a recording, a verbatim transcript, a medical record, a court finding, or a factual judgment about any healthcare worker’s conduct. The verifiable transport timeline, the writer’s recollection, and the literary bridge are presented under separate source labels.

**日本語**

> 以下の救急室場面は、匿名の読者から寄せられた手紙をもとに、一般的な救急部門の空間と業務の流れを参照して再構成したものです。録音、逐語記録、診療記録、裁判所の認定ではなく、医療従事者の言動を事実として判断するものでもありません。確認可能な搬送時系列、手紙に記された記憶、文学的なつなぎは、異なる資料ラベルで分けて表示します。

### D.4 民間傳說與象徵性對話提醒

| 語言 | 正式文字 |
|---|---|
| 繁體中文 | 椅仔姑故事屬民間傳說的原創演繹，不是剴剴案的原因、證據或司法類比。跨時空人物的臺詞為象徵性原創對白，不代表亡者、家屬或案件關係人的實際言語。 |
| 簡體中文 | 椅仔姑故事属于民间传说的原创演绎，不是剴剴案的原因、证据或司法类比。跨时空人物的台词是象征性原创对白，不代表逝者、家属或案件关系人的实际言语。 |
| English | The legend of Chair Maiden is an original interpretation of a folk tale. It is not a cause of, evidence in, or legal analogy for the Kai-Kai case. Dialogue spoken across time is symbolic and fictional; it does not represent the actual words of the deceased, family members, or anyone involved in the proceedings. |
| 日本語 | 「椅仔姑」の物語は民間伝承をもとにした創作的な演出であり、剴剴事件の原因、証拠、司法上の類例ではありません。時代を越えて交わされる台詞は象徴的な創作であり、亡くなった子ども、家族、事件関係者の実際の発言を表すものではありません。 |

### D.5 四語司法警語｜全站共用正式版

**繁體中文**

> **司法閱讀說明**  
> 本頁同時整理直接施虐者的刑事裁判，以及其他照顧、轉介與專業責任所涉的司法程序；兩者不是同一案件，審級、被告、證據與法院認定均須分開閱讀。已終局的裁判只依正式主文與裁判理由表述，不得延伸為法院對其他個人或機構的認定。尚未終局的程序，在有罪判決確定前均應推定無罪。頁面所示狀態以各司法卡片的「最後核對」日期為準；本專題提供公共議題整理，不構成法律意見。

**簡體中文**

> **司法阅读说明**  
> 本页同时整理直接施虐者的刑事裁判，以及其他照护、转介与专业责任涉及的司法程序；两者不是同一案件，审级、被告、证据与法院认定都必须分开阅读。已经终局的裁判只依据正式主文与裁判理由表述，不得延伸为法院对其他个人或机构的认定。尚未终局的程序，在有罪判决确定前均应推定无罪。页面所示状态以各司法卡片的“最后核对”日期为准；本专题用于公共议题整理，不构成法律意见。

**English**

> **How to read the legal record**  
> This page covers both the criminal judgments concerning the direct abusers and separate proceedings involving care, placement, referral, or professional responsibility. They are not the same case. The defendants, procedural stages, evidence, and judicial findings must be read separately. A final judgment is described only through its official disposition and reasons; it must not be extended into a finding about any other person or organization. Anyone in proceedings that are not final is presumed innocent unless and until a conviction becomes final. The status shown on each legal card is current only through its “last verified” date. This feature is a public-interest account, not legal advice.

**日本語**

> **司法資料の読み方**  
> このページでは、直接虐待を行った者に対する刑事裁判と、養育、措置、引継ぎ、専門職としての責任に関する別の司法手続を扱います。両者は同じ事件ではなく、被告人、審級、証拠、裁判所の認定を分けて読む必要があります。確定判決については、正式な主文と判決理由の範囲でのみ記載し、他の個人や団体について裁判所が認定したかのように拡張してはなりません。確定していない手続の当事者には、有罪判決が確定するまで無罪の推定が及びます。各司法カードの情報は「最終確認」日現在のものです。本特集は公共的な論点を整理するもので、法律上の助言ではありません。

### D.6 動態狀態訊息｜`aria-live="polite"`

| state key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `status.scene_started` | 動畫開始：{sceneTitle} | 动画开始：{sceneTitle} | Animation started: {sceneTitle} | 映像を開始しました：{sceneTitle} |
| `status.scene_paused` | 動畫已暫停 | 动画已暂停 | Animation paused | 映像を一時停止しました |
| `status.scene_skipped` | 已略過動畫，正文接續顯示 | 已跳过动画，正文继续显示 | Animation skipped. The article continues below. | 映像をスキップしました。続けて本文を表示します。 |
| `status.scene_complete` | 動畫結束，已進入正文 | 动画结束，已进入正文 | Animation complete. The article is now in focus. | 映像が終了し、本文へ移動しました。 |
| `status.sources_opened` | 資料來源已展開 | 资料来源已展开 | Sources expanded | 資料を開きました |
| `status.language_changed` | 語言已切換為繁體中文 | 语言已切换为简体中文 | Language changed to English | 表示言語を日本語に変更しました |
| `status.offline` | 目前為離線狀態；已載入的正文仍可閱讀。 | 当前为离线状态；已加载的正文仍可阅读。 | You are offline. Text already loaded remains available. | オフラインです。読み込み済みの本文は引き続き読めます。 |
| `status.asset_failed` | 部分視覺素材未載入；完整文字仍可閱讀。 | 部分视觉素材未加载；完整文字仍可阅读。 | Some visual assets did not load. The full text remains available. | 一部の画像を読み込めませんでした。本文はすべて読めます。 |

---

## E. SEO、分享摘要與索引規格

### E.1 繁體中文

- `title`：`剴剴案特別專題｜沒有父母的孤兒：從傳說、急診到法庭`
- `description`：`沿著剴剴生命最後一百一十五天留下的紀錄，分辨民間傳說、急診來函、機構說明、檢辯主張與法院認定，追問孩子如何在照顧與制度的接縫中失去安全。`
- `og:title`：`沒有父母的孤兒｜剴剴案特別專題・第一章`
- `og:description`：`一張空椅、六扇制度之門、一道急診布簾與外婆的白髮。從可查證的資料重新走過最後一百一十五天。`
- 分享短句：`花會再開，童年不會重來。記住剴剴，不只是記住一場悲劇。`

### E.2 簡體中文

- `title`：`剴剴案特别专题｜没有父母的孤儿：从传说、急诊到法庭`
- `description`：`沿着剴剴生命最后一百一十五天留下的记录，区分民间传说、急诊来函、机构说明、检辩主张与法院认定，追问孩子如何在照护与制度的接缝中失去安全。`
- `og:title`：`没有父母的孤儿｜剴剴案特别专题・第一章`
- `og:description`：`一张空椅、六扇制度之门、一道急诊布帘与外婆的白发。从可查证的资料重新走过最后一百一十五天。`
- 分享短句：`花会再开，童年不会重来。记住剴剴，不只是记住一场悲剧。`

### E.3 English

- `title`：`The Kai-Kai Case | From an Old Legend to the Emergency Room and Court`
- `description`：`Tracing the final 115 days of Kai-Kai’s life, this feature separates folk legend, an emergency-room recollection, institutional statements, legal arguments, and judicial findings—and asks where protection failed.`
- `og:title`：`An Orphan in All but Name | The Kai-Kai Case, Chapter One`
- `og:description`：`An empty chair, six institutional doors, an emergency-room curtain, and a grandmother’s whitening hair. Follow the verifiable record of the final 115 days.`
- Share text：`Flowers may bloom again; childhood does not return. Remembering Kai-Kai means remembering more than a tragedy.`

### E.4 日本語

- `title`：`剴剴事件特別企画｜伝承、救急室、法廷をたどる`
- `description`：`剴剴の生涯最後の115日間をたどり、民間伝承、救急室の記憶、団体の説明、検察・弁護側の主張、裁判所の認定を分けて検証し、保護がどこで届かなかったのかを問います。`
- `og:title`：`親のいない孤児のように｜剴剴事件・第1章`
- `og:description`：`空いた椅子、制度の六つの扉、救急室のカーテン、祖母の白髪。確認できる資料から最後の115日間をたどります。`
- 共有文：`花は再び咲いても、子ども時代は戻りません。剴剴を記憶することは、一つの悲劇を記憶するだけではありません。`

### E.5 技術性 SEO

**全語系共用網站／專案連結：**`https://github.com/jerryzuhow77/Justice-For-Kaikai`

1. 每個實體頁只設一個 `<h1>`；八篇為 `<h2>`，場內標題依序為 `<h3>`，不為視覺大小跳級。
2. `canonical` 指向各語言自己的實體 URL；簡中切換仍沿用繁中 canonical。英文、日文不得 canonical 回繁中。
3. `og:image` 使用無字共用圖 `kk01-v6-og-case-guide-1200x630.jpg`；四語靠 `og:title`、`og:description` 在平台顯示，不各自燒字。
4. JSON-LD 使用 `Article`，`headline`、`description`、`inLanguage`、`dateModified` 隨語言切換；`about` 為兒少保護與司法紀錄，不能把象徵性皮影角色列為真實人物。
5. 四語頁與首頁案件卡共用 `data-counter-key="case-kaikai-chair-bound-child-shared"`；一次頁面工作階段只 increment 一次，語言切換與重播動畫不得重複計數。
6. 分享錨點只使用穩定 ID：`#case-quick-read`、`#timeline-115-days`、`#chapter-01` 至 `#chapter-08`、`#judicial-status`、`#sources`、`#protection-action`。

---

## F. 圖像 ALT、場景 ARIA 與字幕規格

### F.1 主要圖像 ALT 四語表

`alt`只描述畫面，不在替代文字中偷渡案情判斷；相鄰正文已完整說明者，ALT保持精簡。純紙紋、角花、霧、雨與光斑使用`alt="" aria-hidden="true"`。

| asset key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `alt.hero.case_guide` | 暖色臺灣老宅、空竹椅與藍白童鞋位於前景，中央黛青門通向冷白醫院走廊，右側卷宗連接法院入口。 | 暖色台湾老宅、空竹椅与蓝白童鞋位于前景，中央黛青门通向冷白医院走廊，右侧卷宗连接法院入口。 | A warm-toned Taiwanese old house with an empty bamboo chair and blue-and-white child’s shoes; a dark teal door leads to a cold hospital corridor, while case files open toward a courthouse at right. | 暖色の台湾の古い家。手前に空の竹椅子と青白い子どもの靴があり、中央の濃い青緑の扉は白い病院の廊下へ、右側の資料は裁判所の入口へ続く。 |
| `alt.hero.corridor` | 清代木門、日治醫院拱廊與現代急診布簾層層相接，形成一條跨越年代的長廊。 | 清代木门、日治医院拱廊与现代急诊布帘层层相接，形成一条跨越年代的长廊。 | A Qing-era wooden doorway, a Japanese-period hospital arcade, and a modern emergency-room curtain form one corridor across time. | 清代の木の扉、日本統治期の病院回廊、現代の救急室のカーテンが重なり、時代を越える一本の廊下を形づくる。 |
| `alt.hero.chapter_gate` | 空竹椅停在臺灣古宅與冷白急診室的交界。 | 空竹椅停在台湾古宅与冷白急诊室的交界。 | An empty bamboo chair stands at the threshold between a Taiwanese old house and a cold white emergency room. | 空の竹椅子が、台湾の古い家と白く冷たい救急室の境に置かれている。 |
| `alt.scene.opening_stage` | 空皮影戲臺中央放著竹椅，黛青幕後只留一道月白門縫。 | 空皮影戏台中央放着竹椅，黛青幕后只留一道月白门缝。 | An empty shadow-play stage holds a bamboo chair, with a narrow pale doorway behind the dark teal curtain. | 誰もいない影絵舞台の中央に竹椅子があり、濃い青緑の幕の奥に白い扉の隙間が一本だけ残る。 |
| `alt.scene.ch01` | 潮濕老屋裡留著一張空椅，門外的天色正在轉暗。 | 潮湿老屋里留着一张空椅，门外天色正在变暗。 | An empty chair remains inside a damp old house as daylight fades beyond the door. | 湿った古い家に空の椅子が残り、扉の外では日が暮れかけている。 |
| `alt.scene.ch02` | 六扇深淺不同的門沿長廊排列，藍白交接帶穿過門縫。 | 六扇深浅不同的门沿长廊排列，蓝白交接带穿过门缝。 | Six doors line a corridor, connected by a blue-and-white handover ribbon passing through their gaps. | 廊下に六枚の扉が並び、青白い引継ぎの帯が扉の隙間を通っている。 |
| `alt.scene.ch03` | 夜色中的城市窗格依次亮起，統計數字浮在窗前，遠處留著一扇未亮的窗。 | 夜色中的城市窗格依次亮起，统计数字浮在窗前，远处留着一扇未亮的窗。 | City windows light one by one at night as statistics appear in front; one distant window remains dark. | 夜の街で窓が一つずつ灯り、手前に統計数字が浮かぶ。遠くに一つだけ暗い窓が残る。 |
| `alt.scene.ch04` | 冷白急診走廊盡頭垂著一面布簾，鏡頭停在簾外，沒有呈現病童或傷勢。 | 冷白急诊走廊尽头垂着一面布帘，镜头停在帘外，没有呈现病童或伤势。 | A curtain hangs at the end of a cold white emergency corridor; the view remains outside and shows neither the child nor injuries. | 白く冷たい救急廊下の奥にカーテンが下がり、視点は外側にとどまる。子どもや傷は描かれない。 |
| `alt.scene.ch05` | 泛黃紙張、活字與年份排在木桌上，版框邊線映在壓花玻璃裡。 | 泛黄纸张、活字与年份排在木桌上，版框边线映在压花玻璃里。 | Yellowed papers, movable type, and dates are arranged on a wooden table; the printing frame is reflected in patterned glass. | 黄ばんだ紙、活字、年代が木の机に並び、版枠が型押しガラスに映っている。 |
| `alt.scene.ch06` | 同一視角下的兩間空病房由案件分隔卡隔開，兩側資料沒有相互重疊。 | 同一视角下的两间空病房由案件分隔卡隔开，两侧资料没有相互重叠。 | Two empty hospital rooms seen from the same angle are separated by a case divider; their records do not overlap. | 同じ構図の二つの無人病室が事件区分カードで隔てられ、両側の資料は重ならない。 |
| `alt.scene.ch07` | 訪視日期、訊息與文件排成調查牆，幾段縫線在未確認處中止。 | 访视日期、讯息与文件排成调查墙，几段缝线在未确认处中止。 | Visit dates, messages, and documents form an investigation wall; several stitched lines stop where verification is missing. | 訪問日、メッセージ、書類が調査壁に並び、未確認の箇所で何本かの縫い糸が途切れる。 |
| `alt.scene.ch08` | 空證人席前放著麥克風與面紙，一縷黑髮在冷光中逐漸轉白。 | 空证人席前放着麦克风与纸巾，一缕黑发在冷光中渐渐变白。 | A microphone and tissue sit before an empty witness chair as a strand of dark hair slowly turns white in cold light. | 空の証言席の前にマイクとティッシュが置かれ、冷たい光の中で黒髪の一房がゆっくり白くなる。 |
| `alt.scene.ending` | 男女皮影分立於敞開的黛青門兩側，暖光照著已修穩的竹椅，門外是普通清晨的走廊。 | 男女皮影分立于敞开的黛青门两侧，暖光照着已经修稳的竹椅，门外是普通清晨的走廊。 | Two shadow figures stand on either side of an open dark teal door; warm light falls on the repaired bamboo chair, and an ordinary morning corridor lies beyond. | 男女の影絵が開いた濃い青緑の扉の両側に立ち、直された竹椅子を暖かな光が照らす。扉の外には朝の廊下が続く。 |

### F.2 場景區域與互動元件 ARIA

| key | 繁體中文 | 簡體中文 | English | 日本語 |
|---|---|---|---|---|
| `aria.feature` | 剴剴案特別專題第一章互動長卷 | 剴剴案特别专题第一章互动长卷 | Interactive Chapter One of the Kai-Kai case feature | 剴剴事件特別企画・第1章インタラクティブ長巻 |
| `aria.mode_dialog` | 選擇閱讀方式的對話框 | 选择阅读方式的对话框 | Reading mode dialog | 読み方を選ぶダイアログ |
| `aria.chapter_nav` | 八篇章導覽 | 八篇章导览 | Navigation for the eight sections | 全8節のナビゲーション |
| `aria.scene_region` | 動畫場景：{sceneTitle} | 动画场景：{sceneTitle} | Animated scene: {sceneTitle} | 映像場面：{sceneTitle} |
| `aria.source_badge` | 來源類型：{sourceType} | 来源类型：{sourceType} | Source type: {sourceType} | 資料区分：{sourceType} |
| `aria.progress` | 已讀完整專題的 {percent}% | 已阅读完整专题的 {percent}% | {percent}% of the feature read | 特集の{percent}%を読みました |
| `aria.audio_toggle_on` | 關閉本專題的配樂與音效 | 关闭本专题的配乐与音效 | Turn off music and sound for this feature | この特集の音楽と効果音をオフにする |
| `aria.audio_toggle_off` | 開啟本專題的配樂與音效 | 开启本专题的配乐与音效 | Turn on music and sound for this feature | この特集の音楽と効果音をオンにする |
| `aria.dialogue_current` | 目前對白，第 {current} 句，共 {total} 句 | 当前对白，第 {current} 句，共 {total} 句 | Current line, {current} of {total} | 現在の台詞、全{total}行中{current}行 |
| `aria.transcript` | {sceneTitle}完整逐字稿 | {sceneTitle}完整逐字稿 | Full transcript for {sceneTitle} | {sceneTitle}の全文 |
| `aria.close_overlay` | 關閉疊加視窗並回到剛才的按鈕 | 关闭叠加窗口并返回刚才的按钮 | Close the overlay and return to the previous control | オーバーレイを閉じて直前の操作に戻る |

無障礙執行：

- 動畫不可逐幀對螢幕閱讀器廣播；只在開始、暫停、略過、結束與來源層級切換時更新 `aria-live`。
- 對話框視覺字幕使用真正的 DOM 文字。完整逐字稿在動畫開始前已存在 DOM，預設以 `<details>` 收合，不以 `display:none` 永久藏住。
- 模態視窗開啟後移入焦點，關閉後回到觸發按鈕；Escape 可關閉。所有按鈕使用 `<button>`，來源連結使用 `<a>`。
- `prefers-reduced-motion: reduce`、頁面內「減少動態」及純文字模式三者任一成立，即以靜態關鍵畫面、完整字幕與正文替代，且不再初始化場景動畫。

---

## G. 正式資產命名、格式與載入策略

### G.1 目錄與命名規則

正式網站只引用下列目錄；原始 PSD、分層繪圖、未壓縮 WAV 與使用者上傳的音樂 MP4 放在離線保存區，不部署至 public：

```text
assets/features/kaikai/ch01/v6/
├── images/
│   ├── hero/
│   ├── scenes/
│   ├── puppets/
│   ├── textures/
│   └── social/
├── icons/
├── audio/
│   ├── music/
│   ├── ambience/
│   └── sfx/
├── fonts/
└── manifests/
```

命名格式：

```text
kk01-v6-{類型}-{場次}-{內容}-{版型}-{寬}x{高}.{副檔名}
```

- 類型：`hero`、`bg`、`fg`、`puppet`、`texture`、`icon`、`poster`、`og`。
- 場次：`sc00-opening`、`sc01-legend`、`sc02-handover`、`sc03-signals`、`sc04-er`、`sc05-reform`、`sc06-peipei`、`sc07-seams`、`sc08-grandmother`、`sc09-ending`。
- 版型：`d`桌機寬幅、`t`平板、`m`手機直幅、`sq`方形；不使用「final」「最新版」「new2」等無法追蹤的字串。
- 更換內容時檔名維持語意名稱，透過 manifest 的 `revision` 與檔案 hash 更新；不可用同名檔覆蓋後期待瀏覽器自行失效。
- 四語圖片不得帶文字；案件名、來源牌、臺詞與按鈕一律是 HTML。

### G.2 圖像正式資產表

| asset id | 正式檔名 | 尺寸／格式 | 壓縮上限 | 載入 | 用途與備援 |
|---|---|---|---:|---|---|
| `hero.caseGuide.desktop` | `kk01-v6-hero-case-guide-d-2400x1350.avif` | 2400×1350 AVIF；WebP同尺寸備援 | AVIF 420KB；WebP 620KB | 首屏唯一 `preload`、`fetchpriority="high"`、`loading="eager"` | 首頁案件入口／專題首屏；失敗時顯示黛青至灰米漸層、竹編線框與完整圖說 |
| `hero.caseGuide.mobile` | `kk01-v6-hero-case-guide-m-1080x1440.avif` | 1080×1440 AVIF；WebP備援 | 300KB／450KB | `media="(max-width:767px)"`首屏預載 | 保留竹椅、童鞋、門洞；不是桌機中央裁切 |
| `hero.corridor.desktop` | `kk01-v6-hero-era-corridor-d-2400x1029.avif` | 2400×1029 AVIF；WebP備援 | 430KB／650KB | 首屏後 `loading="lazy"`；進入前 `rootMargin:100%` | 三時代門框長廊 |
| `hero.corridor.mobile` | `kk01-v6-hero-era-corridor-m-1080x1440.avif` | 1080×1440 AVIF；WebP備援 | 300KB／450KB | lazy | 重新構圖，醫院門洞置中，不用超寬圖硬裁 |
| `hero.chapterGate.desktop` | `kk01-v6-hero-chapter-gate-d-1530x2040.avif` | 1530×2040 AVIF；WebP備援 | 380KB／560KB | 首屏完成後 idle 預取 | 沉浸章門靜態底圖 |
| `hero.chapterGate.mobile` | `kk01-v6-hero-chapter-gate-m-1080x1440.avif` | 1080×1440 AVIF；WebP備援 | 300KB／450KB | lazy | 手機安全區上方18%，空椅與門洞不可被標題遮住 |
| `opening.poster` | `kk01-v6-poster-sc00-opening-d-1920x1080.avif`、`...-m-1080x1440.avif` | 桌機16:9；手機3:4 | 320KB／260KB | 選擇導覽或電影模式後預取 | 動畫尚未初始化、失敗或Reduced Motion時顯示 |
| `scene.backgrounds` | `kk01-v6-bg-sc{01..09}-{slug}-d-1920x1080.avif`、`...-m-1080x1440.avif` | AVIF；WebP備援 | 每張桌機350KB、手機260KB | 當前場景前1幕預取；其餘lazy | 八篇與結尾背景；每一場必有對應poster |
| `scene.foregrounds` | `kk01-v6-fg-sc{00..09}-{object}-d-1920x1080.webp`、`...-m-1080x1440.webp` | 透明 WebP；必要時PNG備援 | 每層180KB；單場總和≤650KB | 選定動態模式後依場次載入 | 門、布簾、卷宗、椅子、繡線等2.5D前景；PNG不作首選 |
| `puppet.female` | `kk01-v6-puppet-gatekeeper-f-{pose}-sq-1024x1024.webp` | 透明WebP 1024×1024 | 每姿勢160KB | 開場或第一場前載入；後續共享cache | `idle`、`turn`、`thread`、`open-door`四姿勢 |
| `puppet.male` | `kk01-v6-puppet-gatekeeper-m-{pose}-sq-1024x1024.webp` | 透明WebP 1024×1024 | 每姿勢160KB | 同上 | `idle`、`ledger`、`repair-chair`、`open-door`四姿勢 |
| `puppet.groups` | `kk01-v6-puppet-{qing-women,nurses,observers,grandmother}-{pose}-sq-1024x1024.webp` | 透明WebP | 每姿勢160KB | 到第8篇前才載入 | 群像均為象徵人物，不照真實照片塑形 |
| `craft.badges` | `kk01-v6-icon-bamboo-badge-{01..08}.svg` | 純向量 SVG | 每枚≤12KB | inline sprite；首次需要時載入一次 | 清理 metadata、script、外部引用；提供可見文字標籤 |
| `craft.line` | `kk01-v6-icon-rush-line.svg`、`kk01-v6-icon-red-thread.svg` | SVG | 各≤20KB | CSS mask或inline | 只作進度／關係，不單靠顏色表示狀態 |
| `texture.paper` | `kk01-v6-texture-rice-paper-sq-1024x1024.avif` | 1024×1024可平鋪AVIF | ≤90KB | 低優先lazy | 裝飾性；失敗不影響可讀性 |
| `texture.terrazzo` | `kk01-v6-texture-terrazzo-sq-1024x1024.avif` | 1024×1024可平鋪AVIF | ≤100KB | 低優先lazy | 日治醫院材質；透明度≤8% |
| `social.og` | `kk01-v6-og-case-guide-1200x630.jpg` | 1200×630 JPEG，sRGB | ≤300KB | 不進正文；供平台抓取 | 無燒字、無兒童傷勢、重要主體位於中央安全區 |

`<picture>`範例：

```html
<picture class="kk01__media kk01__media--hero">
  <source media="(max-width: 767px)" type="image/avif"
          srcset="/assets/features/kaikai/ch01/v6/images/hero/kk01-v6-hero-case-guide-m-1080x1440.avif">
  <source media="(max-width: 767px)" type="image/webp"
          srcset="/assets/features/kaikai/ch01/v6/images/hero/kk01-v6-hero-case-guide-m-1080x1440.webp">
  <source type="image/avif"
          srcset="/assets/features/kaikai/ch01/v6/images/hero/kk01-v6-hero-case-guide-d-2400x1350.avif">
  <img src="/assets/features/kaikai/ch01/v6/images/hero/kk01-v6-hero-case-guide-d-2400x1350.webp"
       width="2400" height="1350" fetchpriority="high" loading="eager" decoding="async"
       alt="暖色臺灣老宅、空竹椅與藍白童鞋位於前景，中央黛青門通向冷白醫院走廊，右側卷宗連接法院入口。">
</picture>
```

### G.3 資產 manifest 必填欄位

正式清單：`assets/features/kaikai/ch01/v6/manifests/assets.v6.json`。每一列必須包含：

```json
{
  "id": "hero.caseGuide.desktop",
  "revision": 1,
  "src": "images/hero/kk01-v6-hero-case-guide-d-2400x1350.avif",
  "fallback": "images/hero/kk01-v6-hero-case-guide-d-2400x1350.webp",
  "width": 2400,
  "height": 1350,
  "bytes": 0,
  "bytesMax": 430080,
  "role": "meaningful",
  "critical": true,
  "loading": "eager",
  "rightsStatus": "cleared",
  "creator": "",
  "sourceRef": "",
  "sha256": ""
}
```

`bytes`、`creator`、`sourceRef`、`sha256`不得留空後標示production-ready。AI生成或編修圖片仍須記錄生成／編修日期、人工修改者、使用的參考圖與是否含第三方素材；`rightsStatus`只能是`cleared`、`restricted`、`pending`，正式站只建置`cleared`。

### G.4 載入、解碼與回收

1. 首屏只預載一張符合目前斷點的Hero、核心CSS與一套正文字型；不要同時預載桌機及手機圖。
2. 圖B、圖C在Hero完成後以`requestIdleCallback`預取；八篇場景使用`IntersectionObserver({rootMargin:"120% 0px"})`，只準備下一場，不一次下載全章。
3. 使用者在閱讀模式選擇「直接閱讀」後，不下載皮影姿勢、2.5D前景、音訊與場景控制程式。
4. 所有非首屏圖片指定固有`width`、`height`、`loading="lazy"`、`decoding="async"`。有語意的圖片用`<img>`；CSS背景只放裝飾材質。
5. 每幕離開可見範圍兩個場次後，停止RAF、Canvas與觀察器；DOM可保留poster，像素層釋放引用。頁籤隱藏時暫停動畫及音訊。
6. `Save-Data:on`或`effectiveType`為`2g/slow-2g`時，預設純文字／靜態導覽；不得自行下載原MP4、完整電影資產或MP3備援。
7. Service Worker更新採content hash；不得使用「刪除全站cache」處理單一專題。V6資產只失效`kaikai/ch01/v6/`命名空間。

---

## H. CSS 命名空間、斷點與四語排版

### H.1 嚴格命名空間

```html
<main class="kk01" data-feature="kaikai-ch01" data-version="v6" data-locale="zh-Hant" data-reading-mode="guided">
```

- 元件：`.kk01__hero`、`.kk01__mode-picker`、`.kk01__scene`、`.kk01__source-badge`、`.kk01__dialogue`、`.kk01__chapter-nav`、`.kk01__audio-control`、`.kk01__transcript`。
- 修飾：`.kk01__scene--er`、`.kk01__source-badge--court`、`.kk01__dialogue--female`。
- 狀態：`.is-loading`、`.is-ready`、`.is-active`、`.is-paused`、`.is-complete`、`.has-error`；狀態必須同時有`data-state`供測試讀取。
- 自訂屬性一律`--kk01-*`：`--kk01-ink`、`--kk01-indigo`、`--kk01-paper`、`--kk01-motion-scale`、`--kk01-safe-top`。
- JS hook使用`data-kk01-*`，不可依視覺class查找：`data-kk01-scene`、`data-kk01-action`、`data-kk01-i18n`。
- 禁止在專題樣式中直接改寫`body`、`html`、`h1`、`img`、`.button`、`.modal`、`.container`、`:root`。若需鎖定模態捲動，只可由全站既有工具類管理，關閉後必須完整復原。
- 所有選擇器以`:where(.kk01)`或`[data-feature="kaikai-ch01"]`起始；樣式檔名`kaikai-ch01.v6.css`，腳本`kaikai-ch01.v6.js`，i18n檔`kaikai-ch01.{locale}.v6.json`。

建議色彩變數：

```css
:where(.kk01) {
  --kk01-indigo: #2f4145;
  --kk01-moon: #d9e3e1;
  --kk01-crab: #8c9a97;
  --kk01-lotus: #b89ba3;
  --kk01-clove: #a59aae;
  --kk01-faded-red: #d9a39a;
  --kk01-cinnabar: #a34a3f;
  --kk01-gold: #c2a36b;
  --kk01-ink: #252525;
  --kk01-paper: #c5beb2;
  --kk01-focus: #f0ca7a;
}
```

文字與資料卡須達WCAG 2.2 AA：一般字至少4.5:1，大字3:1；來源牌、爭議狀態與按鈕不得只靠退紅、暖金或黛青區分。`:focus-visible`使用3px `--kk01-focus`外框，offset 3px。

### H.2 正式斷點

| 範圍 | 版面 | 場景與控制 | 文字規格 |
|---|---|---|---|
| `0–359px` | 極窄單欄；左右內距16px | 不開啟2.5D視差；靜態關鍵畫面；浮動控制最多兩顆，其餘收進「更多」 | 中文／日文正文17px、行高1.9；英文17px、行高1.75；標題使用`clamp(1.75rem,9vw,2.35rem)` |
| `360–479px` | 手機單欄；左右內距20px | 使用獨立3:4構圖；皮影頭頂安全區18%；字幕置於圖下，不壓人物 | 中文／日文18px、行高1.9；英文18px、行高1.78；資料牌16px以上 |
| `480–767px` | 大手機／小平板單欄 | 可啟用低幅度分層，總位移≤12px；對話仍單欄 | 正文18px；標題最多3行；英／日長標不截斷 |
| `768–1023px` | 平板；正文單欄、資料可雙欄 | 16:10或4:3場景；總視差≤18px；控制列固定底部但不遮字幕 | 正文19px；內容寬度中文/日文42rem、英文64ch |
| `1024–1439px` | 桌機雙區：正文＋資料欄 | 16:9舞臺；總視差≤24px；對話框不超過畫面寬38% | 正文19–20px；中文/日文42rem、英文68ch |
| `1440px以上` | 寬桌機，主體最大1440px置中 | 場景可延伸至1920px但關鍵內容守在中央1440px | 不隨螢幕無限放大；正文最大20px，行長不變 |

補充規則：

- 直式手機使用`min-height:100svh`，僅在支援時採`100dvh`；上下控制加入`env(safe-area-inset-top/bottom)`。
- 橫向手機高度低於500px時，動畫舞臺退成poster＋字幕，不鎖住`body`，控制列改頁內排列。
- 200%瀏覽器縮放與文字放大200%時，不得水平捲動；資料表轉成卡片，來源限定語不可被省略號截斷。
- 中文與日文引言每行建議16–24字；英文段落不做兩端對齊。日文不以空格模擬分行。
- 手機版不使用桌機圖`object-position:center`草率裁切；每張關鍵圖均交付獨立`m`版本及焦點資料。

---

## I. 效能預算與驗收門檻

### I.1 使用情境

驗收基準為中階Android手機、4G網路、4倍CPU slowdown與冷cache。桌機漂亮並不代表通過；四語實體頁均須各自測量。

| 指標 | V6 上限／目標 | 驗收說明 |
|---|---:|---|
| LCP | p75 ≤2.5秒 | 首屏Hero或主標；行動網路實測，不用本機file結果 |
| INP | p75 ≤200ms | 閱讀模式、略過、開聲、章節導覽均納入 |
| CLS | ≤0.05 | 圖片先給尺寸，字型交換不可推動主標 |
| 首屏傳輸量 | ≤700KB | 不含使用者尚未開啟的音訊；含HTML、critical CSS、初始JS、首屏圖與必要字型 |
| HTML（Brotli） | ≤55KB | 長文可串流；不可為隱藏動畫複製整份正文 |
| Critical CSS（Brotli） | ≤45KB | 完整專題CSS總量≤85KB Brotli |
| 初始JS（Brotli） | ≤95KB | 不含按需載入Scene engine；JS失敗正文仍在 |
| Scene engine（Brotli） | ≤80KB | 只在導覽／電影模式動態import |
| 首屏Hero | 手機AVIF≤300KB；桌機AVIF≤420KB | 只載當前媒體條件一張 |
| 單場圖像傳輸 | 手機≤900KB；桌機≤1.25MB | 背景＋前景＋人物＋poster合計，不含共享cache |
| 全頁逐步圖像 | AVIF/WebP合計≤7MB | 讀完整頁才可能載完；直接閱讀不得下載完整電影素材 |
| 字型首屏 | ≤250KB | 中日文優先系統字或子集；只載實際使用字重 |
| 音效包 | Opus合計≤350KB | UI與環境短音，不含六首音樂 |
| 單首音樂 | Opus≤560KB；MP3≤820KB | 約27–31秒；`preload="none"` |
| 長任務 | 單次<50ms | 2.5D更新批次至RAF；不在scroll handler直接重排 |
| 動畫刷新 | 目標60fps，最低不持續低於45fps | 低階裝置降級至poster，不犧牲操作 |

### I.2 強制降級條件

- `prefers-reduced-motion:reduce`：不載入Scene engine；顯示六張或更少的關鍵畫面、完整字幕與正文。
- `Save-Data:on`、`2g/slow-2g`、裝置記憶體≤2GB或連續兩秒低於30fps：由電影模式提示降級為導覽靜態版；仍可由讀者主動恢復。
- 圖片解碼失敗、Canvas context遺失或記憶體壓力：保留場景poster與DOM字幕，不白屏、不重整頁面。
- 音訊永遠不是理解正文的必要條件；沒有聲音時不阻擋播放、閱讀、來源或求助資訊。

### I.3 自動化檢查

CI至少執行：

1. 檢查asset manifest所有檔案存在、大小未超預算、尺寸與宣告一致、hash非空、`rightsStatus=cleared`。
2. 以繁中、簡中、英文、日文逐頁跑Lighthouse mobile；任一語言LCP>3.0秒、CLS>0.1或可存取性<95即阻擋發布。
3. 用axe檢查按鈕名稱、對話框焦點、標題層級、來源牌對比、`aria-live`與語言屬性。
4. 在320×568、390×844、768×1024、1366×768、1920×1080及200%縮放擷取視覺快照；英／日長標、手機皮影頭頂、急診來源牌是固定比對區。
5. 無JS、停用圖片、阻擋音訊、離線回訪各測一次；四種狀態都必須讀到完整正文、司法警語、來源與求助入口。

---

## J. 無 JS、圖片、音訊與語言失敗備援

### J.1 無 JavaScript

- `<html class="no-js">`預設顯示全部案件速讀、八篇正文、皮影逐字稿、司法警語、來源與行動區；JS啟動後才加`.js`並增強互動。
- 閱讀模式選擇不遮住正文。無JS時以普通錨點導覽，所有`<details>`可手動開關；第一個內容提醒保持展開。
- 不以JS注入唯一一份關鍵文字，不以Canvas畫來源牌，不以動畫結束事件才解除正文`opacity:0`。
- 章節網址與語言網址均可直接開啟，沒有JS也落在正確錨點。

建議`<noscript>`四語文字：

| 語言 | 文字 |
|---|---|
| 繁體中文 | 你的瀏覽器目前未執行JavaScript。完整文章、來源與司法說明仍可閱讀；動畫、音訊與閱讀進度不會啟用。 |
| 簡體中文 | 你的浏览器当前未运行JavaScript。完整文章、来源与司法说明仍可阅读；动画、音频与阅读进度不会启用。 |
| English | JavaScript is not running. The full article, sources, and legal notes remain available; animation, audio, and reading progress are disabled. |
| 日本語 | JavaScriptが動作していません。本文、資料、司法上の注記はすべて読めますが、映像、音声、読了進捗は利用できません。 |

### J.2 圖片或動畫失敗

- `<picture>`的最後一層一定是廣泛支援的WebP或JPEG；所有有意義圖片保留ALT及可見`<figcaption>`。
- `error`後為figure加`.has-error`，顯示黛青／灰米CSS底與以下四語提示，不重複嘗試造成閃爍：
  - 繁中：`這張場景圖目前未載入；下方圖說與正文包含完整資訊。`
  - 簡中：`这张场景图当前未加载；下方图注与正文包含完整信息。`
  - English：`This scene image did not load. Its caption and the article provide the complete information.`
  - 日本語：`場面画像を読み込めませんでした。画像説明と本文で内容をすべて確認できます。`
- 動畫模組失敗即切poster，不重新載入整頁；`aria-live`只通知一次。

### J.3 音訊失敗

- 每首音訊使用Opus第一來源、MP3備援；兩者失敗時停用按鈕但保留可見文字，不顯示瀏覽器原生破損播放器。
- 場景旁的「聲音文字說明」描述門軸、紙張、空調、遠處腳步等作用；它不是歌詞，也不模擬受害者聲音。
- 音訊錯誤、分頁切換、來電、鎖屏、耳機拔除、模式改成純文字或離開場景時立即暫停；恢復頁面不自行續播。

### J.4 字型、翻譯與路由失敗

- Webfont失敗時使用系統字型；不得用隱形文字等待字型。`font-display:swap`，標題字型fallback的量度需預先校正以控制CLS。
- i18n鍵缺失時回退繁體中文，並在開發環境記錄缺鍵；正式頁不可直接顯示`[missing:key]`。
- 語言切換路由不存在時，保留原頁並顯示：
  - 繁中：`這個段落的所選語言版本尚未載入，已保留目前語言。`
  - 簡中：`这个段落的所选语言版本尚未加载，已保留当前语言。`
  - English：`The selected language version is unavailable for this section. Your current language has been retained.`
  - 日本語：`この節の選択言語版を読み込めないため、現在の言語を維持します。`

---

## K. 六首原創配樂、篇章七／八與結尾音景

### K.1 共同母帶與播放規格

1. 使用者提供的六支MP4只作來源封存，不直接嵌入網頁、不以影片方式載入。由同一母帶輸出Opus 96–128kbps與MP3 160–192kbps。
2. 網頁版音樂目標`-18 LUFS-I`、true peak不高於`-1.5 dBTP`；環境音景`-24 LUFS-I`左右，短UI音效`-28至-24 LUFS-I`。任何相鄰cue主觀響度跳升不得超過6dB。
3. 預設靜音；讀者第一次明確點擊「開啟配樂與音效」後才建立AudioContext與下載音檔。`preload="none"`、不循環、不跨篇自動續播。
4. 對話字幕不依賴語音。若製作旁白，音樂duck至基準的35%–45%；最後一句、司法警語、求助資訊前完全退去。
5. 不使用心電監測器歸零長音、兒童哭叫、施虐擬音、急救口令、模仿外婆哭聲、靈異耳語或突發大聲驚嚇。法院快門閃光配極低音量機械快門，不使用密集爆響。
6. 四語頁共用純音樂；若日後加入旁白，四語各自獨立檔、各自重新做字幕與混音，不以時間伸縮硬套繁中。

### K.2 正式音訊檔名與分篇規格

| 篇章／cue | 曲目或音景 | 正式檔名 | 播放與混音 |
|---|---|---|---|
| 01 | 〈花開無歸期〉 | `music/kk01-m01-hua-kai-wu-gui-qi.opus`；`.mp3`備援 | 木窗與風先行2秒，油燈亮時1.8秒淡入；基準0.32；空椅與傳說字幕後3秒淡出；單次播放 |
| 02 | `Sleepless Vigil` | `music/kk01-m02-sleepless-vigil.opus`；`.mp3` | 第一扇制度門打開後開始；電話等待音與印表機僅作間隙；第六扇門出現空白文件時2.5秒淡出；基準0.30 |
| 03 | `Inventory of Shadows` | `music/kk01-m03-inventory-of-shadows.opus`；`.mp3` | 第一個統計數字進場才開始；螢幕閱讀器或數字朗讀時duck至45%；曲終只留城市風與紙頁；基準0.27 |
| 04 | `The White Curtain` | `music/kk01-m04-the-white-curtain.opus`；`.mp3` | 布簾空景2秒淡入，基準0.22；救護車遠聲出現降至0.12，對話時0.08；關鍵句前1.2秒全退；不對齊監測器節拍 |
| 05 | `Tuesday’s Empty Chair` | `music/kk01-m05-tuesdays-empty-chair.opus`；`.mp3` | 紙張落桌後1.5秒淡入；年份隨旋律自然出現，不配重擊；2019卷宗前3秒淡出；基準0.30 |
| 06 | `The Unfinished Note` | `music/kk01-m06-the-unfinished-note.opus`；`.mp3` | 年節紅紙入鏡時開始，基準0.28；家屬／機構／司法卡展開降至0.16；案件分隔卡前4秒淡出，再留1.5秒完全靜音 |
| 07 | 〈卷宗接縫〉環境音景 | `ambience/kk01-a07-ledger-seams.opus`；`.mp3` | 42–50秒；鉛筆輕劃、紙張平放、遠處空調、單次印表機聲；無旋律、無打字催促感；基準0.18，來源卡展開降至0.08 |
| 08 | 〈白髮之下〉環境音景 | `ambience/kk01-a08-beneath-white-hair.opus`；`.mp3` | 45–60秒；法院空調、衣料輕動、椅腳微響、遠去腳步；不收錄啜泣與仿真呼吸；外婆陳述卡出現前1秒完全靜音 |
| 結尾皮影 | 〈花開無歸期〉短回歸 | `music/kk01-end-flower-reprise.opus`；`.mp3` | 由M01母帶另剪65–80秒場次版；只以正常播放音量20%–25%回歸；「那麼，請把這扇門推開」前完全退去，不再回來 |
| 結尾門外 | 〈普通清晨〉環境尾聲 | `ambience/kk01-end-ordinary-morning.opus`；`.mp3` | 門開後只留極淡晨風、遠樹葉與走廊室內音，10–14秒；核心結尾兩句顯示時靜音，不做昇華和弦 |

第七、八篇刻意不新增第七、八首旋律：第七篇讓讀者聽見文件之間的停頓，第八篇讓法庭空間保留人的重量，避免八篇都以樂曲規定情緒。完整電影模式仍按同一規則；不得因模式變長而循環音樂。

### K.3 音訊權利清零清單

正式發布前，每一首音樂及音景在`manifests/audio-rights.v6.json`必須有一筆獨立紀錄：

```json
{
  "id": "kk01-m01",
  "title": "花開無歸期",
  "creator": "",
  "rightsOwner": "",
  "isOriginal": true,
  "thirdPartySamples": [],
  "sampleLibraryLicenses": [],
  "webUsePermitted": true,
  "editAndFadePermitted": true,
  "derivativeReprisePermitted": true,
  "attribution": "",
  "territory": "worldwide",
  "term": "perpetual",
  "proofUri": "",
  "sourceSha256": "",
  "opusSha256": "",
  "mp3Sha256": "",
  "integratedLufs": -18.0,
  "truePeakDbtp": -1.5,
  "rightsStatus": "pending"
}
```

清零規則：

- `creator`、`rightsOwner`、授權證明、hash或第三方取樣聲明任一缺漏，`rightsStatus`維持`pending`，網站自動不輸出該音訊，但不阻擋正文發布。
- 「使用者表示是原創」須轉成可保存的權利聲明：是否本人作曲／編曲／演奏、AI工具或商用音源庫名稱、是否含第三方loop、是否允許裁切、淡入淡出、格式轉換與四語網站長期公開。
- 結尾M01短回歸屬衍生剪輯，必須另外確認`derivativeReprisePermitted=true`；不能因原曲可公開就推定可改作。
- 若AI音樂服務條款要求署名、限制商用或不保證獨占，完整記入`attribution`與`proofUri`，不得在網頁宣稱「獨家原創」。
- 公開頁片尾只列已確認的作者／權利人與授權文字；內部檔案保存授權證明、交易紀錄與hash，不公開個資。

### K.4 音訊前端狀態

```html
<audio class="kk01__audio" data-kk01-audio="m04" preload="none">
  <source src="/assets/features/kaikai/ch01/v6/audio/music/kk01-m04-the-white-curtain.opus" type="audio/ogg; codecs=opus">
  <source src="/assets/features/kaikai/ch01/v6/audio/music/kk01-m04-the-white-curtain.mp3" type="audio/mpeg">
</audio>
```

狀態只有：`locked`（尚未獲手勢）、`ready`、`playing`、`paused`、`ended`、`error`。切換篇章先淡出前一軌，再載入下一軌；不允許兩首音樂同時播放。語言切換、字幕開關或重看對白不重新觸發音樂。

---

## L. 上線交付核對表｜四語、資產與效能

### L.1 四語

- [ ] 繁中、簡中、英文、日文的H1、八篇章名、閱讀模式、來源牌、司法警語、內容提醒、按鈕、SEO、ALT與ARIA皆由本字典輸出。
- [ ] 簡體頁保留「剴剴」「珮珮」、臺語原句、羅馬字、裁判字號、URL與程式鍵；字型沒有繁簡粗細混雜。
- [ ] 英文與日文經人工通讀；沒有把「孤兒」誤寫為法律身分，也沒有把「外婆」泛化成無法辨識親屬方向的字眼。
- [ ] 語言切換保留章節錨點、閱讀模式與音訊關閉狀態，不重播、不重複計數。
- [ ] 簡中切換同步改`lang`、可見文案、meta、OG、JSON-LD、ALT、ARIA、分享文字；英文、日文有自己的canonical。

### L.2 無障礙與備援

- [ ] 四種閱讀模式以鍵盤可選；預設不自動播放有聲內容；「退出沉浸動畫」始終可聚焦。
- [ ] Reduced Motion完全不初始化場景引擎；逐字稿、來源與正文仍完整。
- [ ] 所有對話是DOM文字；每幕有完整逐字稿與聲音文字說明；重要限定語不會自動消失。
- [ ] 無JS、圖片404、音訊404、Webfont失敗與離線狀態均完成實機測試，頁面不白屏、不鎖捲動。
- [ ] 320px、橫向手機、200%縮放與日本語嚴格換行沒有裁切人物、按鈕、來源牌或司法限定語。

### L.3 資產與效能

- [ ] 首屏只預載符合斷點的一張Hero；音訊`preload="none"`；直接閱讀不下載電影資產。
- [ ] 圖片使用AVIF＋WebP／JPEG備援，帶固定尺寸與hash；透明圖層優先WebP，不部署未壓縮PNG母檔。
- [ ] 所有檔案符合效能預算；四語Lighthouse、axe、視覺快照與失敗備援測試通過。
- [ ] CSS／JS只作用於`kaikai-ch01`命名空間，不改寫全站首頁、其他案件、共用導覽或計數器。
- [ ] `assets.v6.json`與`audio-rights.v6.json`沒有空白必填欄，所有公開素材`rightsStatus=cleared`。
- [ ] 六首音樂、兩段篇章音景與結尾兩個cue均有Opus、MP3、響度、峰值、權利與hash紀錄；來源MP4未部署到公開站。

### L.4 最後的人工作品檢查

- [ ] 四語Hero不燒字；同一張圖在手機與桌機有真正重構，不是單純裁切。
- [ ] 圖像ALT只描述可見內容，不把文學推論、責任判斷或未認定事項寫成事實。
- [ ] 急診重構、民間傳說、皮影詩劇、個人記憶、機構說明、檢辯主張與法院認定都有明顯不同的來源牌。
- [ ] 核心結尾兩句出現前音樂完全退去；求助資訊區靜音、無皮影、無悲情動畫。
- [ ] 發布後以正式URL再次檢查OG預覽、canonical、hreflang、分享錨點、瀏覽計數與Service Worker快取版本。

---

## M. 四語完整皮影詩劇台詞

本節是序問、八場皮影與指定結尾六句的唯一四語對話母本。`S00`至`S09`為穩定台詞ID；前端字幕、完整逐字稿、旁白cue與翻譯QA皆引用相同ID，不另複製一份無ID文字。角色名稱為文學化守門人，不是真實案件人物。

共同畫面標籤：

- 繁體中文：`文學化皮影旁白｜非案件相關人物對話｜非真實錄音｜不代表法院認定`
- 簡體中文：`文学化皮影旁白｜非案件相关人物对话｜非真实录音｜不代表法院认定`
- English：`Literary shadow-play narration | Not dialogue spoken by people in the case | Not a real recording | Not a court finding`
- 日本語：`文学的な影絵ナレーション｜事件関係者の会話ではありません｜実際の録音ではありません｜裁判所の認定を示すものではありません`

### M.1 序問｜六扇門前

#### 繁體中文

- `S00-L01` **女：**簷前野花迎著風，謝了又開；庭中細草受了雨，倒下還能再起。為何春天年年都肯回來，一個孩子失去的年歲，卻再也沒有人替他送還？
- `S00-L02` **男：**我沿著六扇門走來，看見每扇門上都寫著職責；我翻過一層又一層卷宗，看見日期端正、姓名分明。只是那麼多人都說自己送過他一程，為何長路盡頭，仍沒有一雙手陪他走到明天？
- `S00-L03` **女：**莫說他年幼無言。春水不開口，尚能照見裂岸；幼兒不會陳情，身上的傷、消瘦的臉、退縮的眼睛，難道便不是話？
- `S00-L04` **男：**門內的人說一切安好，門外的人便把筆收起；一張表寫著已訪視，一通訊息寫著再確認。人們總相信下一個人會把事情完成，卻忘了孩子的一日，不能寄放在下一日。
- `S00-L05` **女：**那便把戲文暫歇，把卷宗放低一寸。不要問傳說裡的鬼神如何報應，只問活著的大人：看見以後有沒有追問，懷疑以後有沒有查證，危險逼近以前，有沒有把門真正打開。
- `S00-L06` **男：**今日所讀的不是誰的眼淚更重，也不是哪一句話更能激起眾怒。今日所讀，是一個仍然有人愛著的孩子，如何在大人各自完整的理由之間，失去他本來應有的明天。

#### 簡體中文

- `S00-L01` **女：**檐前野花迎着风，谢了又开；庭中细草受了雨，倒下还能再起。为什么春天年年都肯回来，一个孩子失去的年岁，却再也没有人替他送还？
- `S00-L02` **男：**我沿着六扇门走来，看见每扇门上都写着职责；我翻过一层又一层卷宗，看见日期端正、姓名分明。只是那么多人都说自己送过他一程，为什么长路尽头，仍没有一双手陪他走到明天？
- `S00-L03` **女：**莫说他年幼无言。春水不开口，尚能照见裂岸；幼儿不会陈情，身上的伤、消瘦的脸、退缩的眼睛，难道就不是话？
- `S00-L04` **男：**门内的人说一切安好，门外的人便把笔收起；一张表写着已访视，一则讯息写着再确认。人们总相信下一个人会把事情完成，却忘了孩子的一日，不能寄放在下一日。
- `S00-L05` **女：**那便把戏文暂歇，把卷宗放低一寸。不要问传说里的鬼神如何报应，只问活着的大人：看见以后有没有追问，怀疑以后有没有查证，危险逼近以前，有没有把门真正打开。
- `S00-L06` **男：**今日所读的不是谁的眼泪更重，也不是哪一句话更能激起众怒。今日所读，是一个仍然有人爱着的孩子，如何在大人各自完整的理由之间，失去他本来应有的明天。

#### English

- `S00-L01` **Woman:** Wildflowers beneath the eaves meet the wind, wither, and bloom again. Fine grass in the courtyard bends beneath the rain and rises once more. Why does spring consent to return each year, while no one can return to a child the years he has lost?
- `S00-L02` **Man:** I came by way of six doors and found a duty written upon each one. I opened file after file and found the dates in order, every name plainly set down. So many people say they accompanied him for part of the journey. Why, then, at the end of that long road, was there still no hand to lead him into tomorrow?
- `S00-L03` **Woman:** Do not say that he was too young to speak. Spring water utters nothing, yet it reveals the broken bank. A small child may not know how to testify, but are his injuries, his thinning face, and his frightened withdrawal not also words?
- `S00-L04` **Man:** Those inside the door said all was well, and those outside put down their pens. One form said a visit had been made; one message said there would be another check. Everyone trusted that the next person would finish the task, forgetting that one day of a child’s life cannot be placed in the keeping of the next.
- `S00-L05` **Woman:** Then let the play fall silent, and lower the files by an inch. Do not ask what vengeance the spirits of legend might bring. Ask the living adults instead: after seeing, did they question; after doubting, did they verify; before danger closed in, did anyone truly open the door?
- `S00-L06` **Man:** What we read today is not a contest over whose tears weigh more, nor which sentence can summon the greatest anger. We are reading how a child who was still loved lost the tomorrow that should have been his, somewhere among the complete and orderly reasons of adults.

#### 日本語

- `S00-L01` **女：**軒先の野の花は風に揺れ、散ってはまた咲きます。庭の細い草は雨に伏しても、もう一度起き上がります。春は毎年戻ってくるのに、なぜ一人の子どもが失った年月だけは、誰にも返せないのでしょう。
- `S00-L02` **男：**私は六つの扉をたどり、どの扉にも責務の文字があるのを見ました。何冊もの記録をめくれば、日付は整い、名前もはっきり記されています。誰もが道の途中までは彼を送ったと言うのに、なぜ長い道の果てに、明日まで手を引く人がいなかったのでしょう。
- `S00-L03` **女：**幼く、言葉がなかったなどと言わないでください。春の水は何も語らなくても、崩れた岸を映します。幼い子が訴えられなくても、傷、痩せた顔、おびえて身を引くまなざしは、言葉ではないのでしょうか。
- `S00-L04` **男：**扉の内側の人が「すべて順調」と言えば、外側の人は筆を置きました。用紙には「訪問済み」、メッセージには「再確認」と書かれました。人はいつも次の誰かが終わらせると信じます。けれど、子どもの一日を次の日に預けることはできません。
- `S00-L05` **女：**それなら芝居をひとまず止め、記録をほんの少し下げましょう。伝承の鬼神がどう報いるかを問うのではなく、生きている大人に問いましょう。見た後に尋ねたか。疑った後に確かめたか。危険が迫る前に、本当に扉を開いたか。
- `S00-L06` **男：**今日読むのは、誰の涙がより重いかでも、どの言葉がより大きな怒りを呼ぶかでもありません。今も愛されている一人の子どもが、大人たちのそれぞれ整った理由の間で、本来あるはずだった明日を失っていった、その経緯です。

### M.2 第一場｜傳說退場，孩子留下

#### 繁體中文

- `S01-L01` **女：**窗紙黃了，梅枝枯了，說故事的人也換了一代。為何這張椅子仍在原處，像在等一雙早該來到的手？
- `S01-L02` **男：**傳說說她受了苦，後人便把苦難交給鬼神；彷彿只要香火未斷，活著的人便不必承認，當年曾有一扇門沒有打開。
- `S01-L03` **女：**莫把孩子的哭聲寫成奇聞。她若曾經呼喊，應當回答她的，不是幽冥裡的神明，而是同一屋簷下聽得見的人。
- `S01-L04` **男：**我帶來許多版本，每一頁都說得不同；惟有那張空椅，在所有版本裡都沒有改變。
- `S01-L05` **女：**那便讓故事止在椅邊。不要替傳說添一滴血，只留下它真正能問的：孩子受困時，大人看見了沒有？
- `S01-L06` **男：**我把卷放低。從此刻起，不再問她如何成為傳說；只問下一個孩子，如何不必成為傳說。

#### 簡體中文

- `S01-L01` **女：**窗纸黄了，梅枝枯了，说故事的人也换了一代。为什么这张椅子仍在原处，像在等一双早该来到的手？
- `S01-L02` **男：**传说说她受了苦，后人便把苦难交给鬼神；仿佛只要香火未断，活着的人便不必承认，当年曾有一扇门没有打开。
- `S01-L03` **女：**莫把孩子的哭声写成奇闻。她若曾经呼喊，应当回答她的，不是幽冥里的神明，而是同一屋檐下听得见的人。
- `S01-L04` **男：**我带来许多版本，每一页都说得不同；只有那张空椅，在所有版本里都没有改变。
- `S01-L05` **女：**那便让故事停在椅边。不要替传说添一滴血，只留下它真正能问的：孩子受困时，大人看见了没有？
- `S01-L06` **男：**我把卷宗放低。从此刻起，不再问她如何成为传说；只问下一个孩子，如何不必成为传说。

#### English

- `S01-L01` **Woman:** The window paper has yellowed, the plum branch has withered, and a new generation now tells the tale. Why does this chair remain where it was, as though waiting for hands that should have arrived long ago?
- `S01-L02` **Man:** The legend says she suffered, and those who came later entrusted her suffering to ghosts and gods—as though, while the incense still burned, the living need not admit that a door once failed to open.
- `S01-L03` **Woman:** Do not turn a child’s cry into a curiosity. If she called out, the answer should not have come from a deity in the underworld, but from those beneath the same roof who could hear her.
- `S01-L04` **Man:** I have brought many versions. Every page tells the story differently. Only the empty chair remains unchanged in them all.
- `S01-L05` **Woman:** Then let the story stop beside the chair. Add not a single drop of blood to the legend. Leave only the question it can truly ask: when a child was trapped, did the adults see?
- `S01-L06` **Man:** I lower the scroll. From this moment, I will no longer ask how she became a legend. I will ask how the next child might never have to become one.

#### 日本語

- `S01-L01` **女：**窓紙は黄ばみ、梅の枝は枯れ、物語る人も一代替わりました。それでも、この椅子はなぜ元の場所にあるのでしょう。ずっと前に来るはずだった両手を待っているように。
- `S01-L02` **男：**伝承は、あの子が苦しんだと語ります。後の人々はその苦しみを鬼神に預けました。線香の火さえ絶えなければ、生きている者は、あの日開かなかった扉を認めずに済むかのように。
- `S01-L03` **女：**子どもの泣き声を奇談にしてはいけません。もしあの子が叫んだのなら、答えるべきだったのは冥界の神ではなく、同じ屋根の下で声を聞けた人です。
- `S01-L04` **男：**私は幾つもの異なる語りを持ってきました。どの頁も違うことを語ります。ただ、空の椅子だけは、どの語りの中でも変わりません。
- `S01-L05` **女：**ならば物語は椅子のそばで止めましょう。伝承に血を一滴も足さず、本当に問えることだけを残しましょう。子どもが逃げられなかったとき、大人は見ていたのか。
- `S01-L06` **男：**巻物を下ろします。これからは、あの子がどう伝説になったかを問いません。次の子どもが、どうすれば伝説にならずに済むかを問います。

### M.3 第二場｜六扇門與被交付的童年

#### 繁體中文

- `S02-L01` **女：**一個孩子離開熟悉的懷抱時，帶走的行李很少；一件衣服、一雙鞋，還有他對大人尚未學會懷疑的信任。
- `S02-L02` **男：**第一扇門說已經受理，第二扇門說正在轉介，第三扇門說等待評估。每一句都有程序，每一句也都有下一扇門。
- `S02-L03` **女：**你把布帶交出去以前，可曾看清下一雙手？交付不是放下，轉介也不是從此與自己無關。
- `S02-L04` **男：**我以為門門相連，路便不會中斷；如今才看見，門與門之間，正是一個孩子最容易跌落的地方。
- `S02-L05` **女：**他不能選擇由誰抱走，也不能問自己將被送到哪裡。擁有選擇的大人，便更不能只負責把表格送達。
- `S02-L06` **男：**那便讓這條布帶穿過所有門，卻不離開我們的手。每一次交接，都要有人回頭確認：孩子是否真的安全抵達。

#### 簡體中文

- `S02-L01` **女：**一个孩子离开熟悉的怀抱时，带走的行李很少；一件衣服、一双鞋，还有他对大人尚未学会怀疑的信任。
- `S02-L02` **男：**第一扇门说已经受理，第二扇门说正在转介，第三扇门说等待评估。每一句都有程序，每一句也都有下一扇门。
- `S02-L03` **女：**你把布带交出去以前，可曾看清下一双手？交付不是放下，转介也不是从此与自己无关。
- `S02-L04` **男：**我以为门门相连，路便不会中断；如今才看见，门与门之间，正是一个孩子最容易跌落的地方。
- `S02-L05` **女：**他不能选择由谁抱走，也不能问自己将被送到哪里。拥有选择的大人，便更不能只负责把表格送达。
- `S02-L06` **男：**那便让这条布带穿过所有门，却不离开我们的手。每一次交接，都要有人回头确认：孩子是否真的安全抵达。

#### English

- `S02-L01` **Woman:** When a child leaves a familiar embrace, he carries very little: one set of clothes, a pair of shoes, and a trust in adults that has not yet learned suspicion.
- `S02-L02` **Man:** The first door says the case has been accepted. The second says a referral is under way. The third says an assessment is pending. Every sentence contains a procedure, and every sentence points to another door.
- `S02-L03` **Woman:** Before you passed on the ribbon, did you see clearly the hands that would receive it? To hand over is not to set down. A referral does not end one’s responsibility.
- `S02-L04` **Man:** I thought that if every door were connected, the road could not break. Only now do I see that the space between one door and the next is precisely where a child can fall most easily.
- `S02-L05` **Woman:** He cannot choose who carries him away or ask where he is being sent. The adults who do have choices must do more than deliver the form.
- `S02-L06` **Man:** Then let this ribbon pass through every door without leaving our hands. At every handover, someone must look back and ask: did the child truly arrive in safety?

#### 日本語

- `S02-L01` **女：**子どもが慣れ親しんだ腕を離れるとき、持って行けるものはわずかです。服が一着、靴が一足。そして、大人をまだ疑うことを知らない信頼です。
- `S02-L02` **男：**最初の扉は「受理した」と言い、二つ目は「引継ぎ中」、三つ目は「評価待ち」と言います。どの言葉にも手続があり、どの言葉の先にも次の扉があります。
- `S02-L03` **女：**その帯を渡す前に、次に受け取る手を確かめましたか。引き渡すことは手放すことではなく、引き継ぐことは自分と無関係になることではありません。
- `S02-L04` **男：**扉がつながっていれば道は途切れないと思っていました。今になって、扉と扉の間こそ、子どもが最も落ちやすい場所だと分かりました。
- `S02-L05` **女：**子どもは誰に抱かれるかを選べず、どこへ連れて行かれるのかを尋ねることもできません。選べる大人が、書類を届けるだけで終わってよいはずはありません。
- `S02-L06` **男：**ならば、この帯をすべての扉に通しながら、私たちの手から離さないようにしましょう。引継ぎのたびに、誰かが振り返り、子どもが本当に安全に着いたかを確かめるのです。

### M.4 第三場｜萬家燈火與無聲求救

#### 繁體中文

- `S03-L01` **男：**今夜又有許多扇窗亮起，許多通報電話被寫進紀錄。數字排列得如此整齊，彷彿混亂終於有了邊界。
- `S03-L02` **女：**數字不會在夜裡驚醒，也不會因為害怕而躲到門後。你數的是幾件通報，可每一筆數字背後，都可能站著同一個反覆求救的孩子。
- `S03-L03` **男：**我可以證明門曾被敲響，卻不能僅憑這張表證明門已打開；我可以計算誰被看見，卻不能計算誰真正被救下。
- `S03-L04` **女：**那就不要讓數字成為牆。把統計放低一點，看一看它後面的床、書包、飯碗，還有一個孩子每天如何等待。
- `S03-L05` **男：**從前我以為資料越多，真相越近；如今紙頁堆滿長桌，孩子的位置反而空了。
- `S03-L06` **女：**空白不是沒有資料。空白是在提醒你：文件從未空白，被漏掉的，是文件之外的孩子。

#### 簡體中文

- `S03-L01` **男：**今夜又有许多扇窗亮起，许多通报电话被写进记录。数字排列得如此整齐，仿佛混乱终于有了边界。
- `S03-L02` **女：**数字不会在夜里惊醒，也不会因为害怕而躲到门后。你数的是几件通报，可每一笔数字背后，都可能站着同一个反复求救的孩子。
- `S03-L03` **男：**我可以证明门曾被敲响，却不能仅凭这张表证明门已打开；我可以计算谁被看见，却不能计算谁真正获救。
- `S03-L04` **女：**那就不要让数字成为墙。把统计放低一点，看一看它后面的床、书包、饭碗，还有一个孩子每天如何等待。
- `S03-L05` **男：**从前我以为资料越多，真相越近；如今纸页堆满长桌，孩子的位置反而空了。
- `S03-L06` **女：**空白不是没有资料。空白是在提醒你：文件从未空白，被遗漏的，是文件之外的孩子。

#### English

- `S03-L01` **Man:** Tonight, many windows light again, and many calls are entered into the record. The figures stand in such orderly rows that disorder itself appears, at last, to have a boundary.
- `S03-L02` **Woman:** A number does not wake in terror at night, nor hide behind a door from fear. You are counting reports, but behind those entries may stand the same child, asking for help again and again.
- `S03-L03` **Man:** I can prove that someone knocked, but this table alone cannot prove the door was opened. I can count who was seen, but not who was truly brought to safety.
- `S03-L04` **Woman:** Then do not let the figures become a wall. Lower the statistics and look at the bed, the schoolbag, the bowl behind them—and at how a child waits through each day.
- `S03-L05` **Man:** I once believed that the more data we had, the closer truth would come. Now the long table is buried beneath paper, and the place where the child should be is empty.
- `S03-L06` **Woman:** The blank space does not mean there is no information. It reminds you that the papers were never blank. What went missing was the child beyond the papers.

#### 日本語

- `S03-L01` **男：**今夜も多くの窓が灯り、多くの通報電話が記録に入りました。数字はあまりに整然と並び、混乱にようやく境界ができたかのようです。
- `S03-L02` **女：**数字は夜中におびえて目を覚まさず、恐怖から扉の陰へ隠れることもありません。あなたが数えているのは通報の件数です。しかし、その一つ一つの後ろに、何度も助けを求めた同じ子どもが立っているかもしれません。
- `S03-L03` **男：**扉が叩かれたことは証明できます。けれど、この表だけでは扉が開いたことを証明できません。誰が見つけられたかは数えられても、誰が本当に救われたかは数えられません。
- `S03-L04` **女：**ならば数字を壁にしないでください。統計を少し下げ、その後ろにあるベッド、かばん、食事の器、そして子どもが毎日どのように待っていたかを見てください。
- `S03-L05` **男：**以前は、資料が増えるほど真実に近づくと思っていました。今は長机が紙で埋まり、かえって子どもの場所だけが空いています。
- `S03-L06` **女：**空白は、資料がないという意味ではありません。書類は決して空白ではなかった。見落とされたのは、書類の外にいる子どもだったのだと告げています。

### M.5 第四場｜白色布簾與最後一夜

#### 繁體中文

- `S04-L01` **女：**聽，輪子越過地磚的接縫，所有腳步都朝同一扇門奔去。醫院終於看見了危險，可這已是孩子生命最後的夜。
- `S04-L02` **男：**我想掀開布簾，看清門後發生什麼；可見證不是闖入，悲傷也不該因為我們的好奇，再被重演一次。
- `S04-L03` **女：**那便留在簾外。聽醫護如何奔走，聽器械如何輕碰，也聽一句被壓得很低、仍壓不住的嘆息。
- `S04-L04` **男：**孩子不會完整說話，身上的變化卻從未沉默。傷勢、消瘦與退縮，本來都在替他陳述。
- `S04-L05` **女：**大人終於全都跑了起來。可在這一夜以前，誰曾為了他的異常多走一步，誰又把「改日再看」寫成下一日？
- `S04-L06` **男：**儀器只能記錄此刻的數值。真正應當被寫進卷宗的，是在最後一夜以前，為何沒有人更早跑起來。

#### 簡體中文

- `S04-L01` **女：**听，轮子越过地砖的接缝，所有脚步都朝同一扇门奔去。医院终于看见了危险，可这已是孩子生命最后的夜晚。
- `S04-L02` **男：**我想掀开布帘，看清门后发生了什么；可见证不是闯入，悲伤也不该因为我们的好奇，再被重演一次。
- `S04-L03` **女：**那便留在帘外。听医护如何奔走，听器械如何轻碰，也听一句被压得很低、仍压不住的叹息。
- `S04-L04` **男：**孩子不会完整说话，身上的变化却从未沉默。伤势、消瘦与退缩，本来都在替他陈述。
- `S04-L05` **女：**大人终于全都跑了起来。可在这一夜以前，谁曾为了他的异常多走一步，谁又把“改日再看”写成下一日？
- `S04-L06` **男：**仪器只能记录此刻的数值。真正应当被写进卷宗的，是在最后一夜以前，为什么没有人更早跑起来。

#### English

- `S04-L01` **Woman:** Listen—the wheels cross the seams between the floor tiles, and every footstep runs toward the same door. The hospital has finally seen the danger, but this is already the last night of the child’s life.
- `S04-L02` **Man:** I want to draw the curtain and see what happened beyond it. Yet to witness is not to intrude, and sorrow should not be performed again merely to satisfy our curiosity.
- `S04-L03` **Woman:** Then remain outside the curtain. Hear the medical team hurry, hear instruments touch lightly, and hear the sigh that is kept low but cannot be wholly contained.
- `S04-L04` **Man:** The child could not tell a complete story, but the changes in his body were never silent. Injury, weight loss, and withdrawal were already speaking for him.
- `S04-L05` **Woman:** At last, every adult began to run. But before this night, who went one step farther because something seemed wrong? Who wrote “we will look another day” and placed it in tomorrow?
- `S04-L06` **Man:** The machines can record only the values of this moment. What belongs in the record is why, before the final night, no one began running sooner.

#### 日本語

- `S04-L01` **女：**聞いてください。車輪が床の継ぎ目を越え、すべての足音が同じ扉へ走っています。病院はようやく危険を目にしました。けれど、これはすでに子どもの人生最後の夜です。
- `S04-L02` **男：**カーテンを開け、扉の向こうで何が起きたか確かめたい。けれど、見届けることは踏み込むことではありません。私たちの好奇心のために、悲しみをもう一度演じさせてはなりません。
- `S04-L03` **女：**ならばカーテンの外にいましょう。医療者が走る音、器具がかすかに触れる音、そして押し殺しても消せないため息に耳を澄ませましょう。
- `S04-L04` **男：**子どもはすべてを言葉にできなくても、身体の変化は沈黙していませんでした。傷、痩せ、身を引く反応は、すでに彼に代わって語っていました。
- `S04-L05` **女：**大人たちはようやく皆、走り始めました。けれど、この夜より前に、異変に気づいてもう一歩進んだ人はいたのでしょうか。「また後日見る」を次の日へ預けたのは誰でしょう。
- `S04-L06` **男：**機器が記録できるのは、この瞬間の数値だけです。記録に残すべきなのは、最後の夜より前に、なぜ誰ももっと早く走り出さなかったのかということです。

### M.6 第五場｜理想刻進活字，責任留在門後

#### 繁體中文

- `S05-L01` **男：**一項修法從公共討論與條文裡走來，一個組織從許多人的倡議裡誕生。字模落下，紙上終於寫出孩子應有的權利。
- `S05-L02` **女：**理想寫在沿革裡總是清楚，責任落到現場卻常被拆成細碎步驟。誰去看、誰來問、誰在異常發生時說不能再等？
- `S05-L03` **男：**我曾相信流程能比偶然可靠，訓練能比好心穩固；房子愈大，便有更多人替孩子擋風。
- `S05-L04` **女：**版面大了，字也多了。字一多，每個人便容易相信，未寫完的那一行總有另一個人會續上。
- `S05-L05` **男：**若制度不能自行走路，那麼印在紙上的善，必須由誰一步一步帶進孩子每天生活的地方？
- `S05-L06` **女：**由每一個接過職責的人。不是等悲劇發生以後重讀宗旨，而是在孩子仍有時間被看見時，把理想變成行動。

#### 簡體中文

- `S05-L01` **男：**一项修法从公共讨论与条文中走来，一个组织从许多人的倡议中诞生。字模落下，纸上终于写出孩子应有的权利。
- `S05-L02` **女：**理想写在沿革里总是清楚，责任落到现场却常被拆成细碎步骤。谁去看、谁来问、谁在异常发生时说不能再等？
- `S05-L03` **男：**我曾相信流程能比偶然可靠，训练能比好心稳固；房子越大，便有更多人替孩子挡风。
- `S05-L04` **女：**版面大了，字也多了。字一多，每个人便容易相信，没写完的那一行总有另一个人会续上。
- `S05-L05` **男：**如果制度不能自行走路，那么印在纸上的善，必须由谁一步一步带进孩子每天生活的地方？
- `S05-L06` **女：**由每一个接过职责的人。不是等悲剧发生以后重读宗旨，而是在孩子还有时间被看见时，把理想变成行动。

#### English

- `S05-L01` **Man:** An amendment emerged from public debate and the wording of law, and an organization was born of many people’s advocacy. The type descended, and at last the rights owed to children appeared upon the page.
- `S05-L02` **Woman:** Ideals are always clear in an institutional history; responsibility at the point of care is easily broken into small steps. Who goes to look? Who asks the next question? Who says, when something is wrong, that waiting is no longer acceptable?
- `S05-L03` **Man:** I once believed procedure could be more reliable than chance, and training more steadfast than goodwill. The larger the house, the more people there would be to shelter a child from the wind.
- `S05-L04` **Woman:** As the page grew, so did the number of words. And with every added line, it became easier for each person to believe that someone else would finish the sentence.
- `S05-L05` **Man:** If a system cannot walk by itself, who must carry the goodness printed on paper, step by step, into the child’s everyday life?
- `S05-L06` **Woman:** Everyone who accepts a duty. The purpose is not to reread the mission after tragedy, but to turn an ideal into action while there is still time for the child to be seen.

#### 日本語

- `S05-L01` **男：**一つの法改正は、公の議論と条文の積み重ねから生まれ、一つの団体は多くの人の提言から生まれました。活字が下り、紙の上にようやく子どもの権利が記されました。
- `S05-L02` **女：**沿革に書かれた理想はいつも明瞭です。しかし現場へ届く責任は、細かな手順へ分かれて見えにくくなります。誰が見に行くのか。誰が問いかけるのか。異変が起きたとき、誰が「もう待てない」と言うのか。
- `S05-L03` **男：**手続は偶然より頼りになり、訓練は善意より揺るがないと信じていました。家が大きくなれば、それだけ多くの人が子どもを風から守るのだと。
- `S05-L04` **女：**紙面が大きくなり、文字も増えました。行が増えるほど、誰もが「書きかけの一行は別の誰かが続ける」と思いやすくなります。
- `S05-L05` **男：**制度が自分で歩けないのなら、紙に印刷された善意を、一歩ずつ子どもの日々の暮らしまで運ぶのは誰なのでしょう。
- `S05-L06` **女：**責務を受け取った一人一人です。悲劇の後に理念を読み返すのではありません。子どもがまだ見つけてもらえる時間のうちに、理想を行動へ変えるのです。

### M.7 第六場｜另一間病房，另一個未完句點

#### 繁體中文

- `S06-L01` **女：**新春的紅紙還貼在牆上，「平安」二字寫得端正；病房裡的燈卻白得沒有節氣，像從不認識人間的願望。
- `S06-L02` **男：**這是另一個孩子、另一年、另一間病房。我們可以比較制度留下的接縫，卻不能為了故事整齊，把不同死因寫成同一場命運。
- `S06-L03` **女：**家屬等的是探視，最後等來的卻是一通急救電話。一本照顧手冊寫了許多日常，為何重要的疑問仍停在空白處？
- `S06-L04` **男：**家屬與公開貼文提出質疑，機構公開說明提出回應，檢方另有不起訴處分。三者必須分列，不能由我們的悲傷替任何一方蓋章。
- `S06-L05` **女：**可是曾經發生的失去，若沒有變成後來更早的檢查、更密的訪視與更清楚的責任，記憶便只剩名字被重新提起。
- `S06-L06` **男：**那便把兩份卷宗分開擺好，再把相同的問題留在中間：前一次悲劇留下的教訓，是否真正走到了後來的孩子身邊？

#### 簡體中文

- `S06-L01` **女：**新春的红纸还贴在墙上，“平安”二字写得端正；病房里的灯却白得没有节气，像从不认识人间的愿望。
- `S06-L02` **男：**这是另一个孩子、另一年、另一间病房。我们可以比较制度留下的接缝，却不能为了故事整齐，把不同死因写成同一场命运。
- `S06-L03` **女：**家属等的是探视，最后等来的却是一通急救电话。一本照护手册写了许多日常，为什么重要的疑问仍停在空白处？
- `S06-L04` **男：**家属与公开帖文提出质疑，机构公开说明作出回应，检方另有不起诉处分。三者必须分列，不能由我们的悲伤替任何一方盖章。
- `S06-L05` **女：**可是曾经发生的失去，如果没有变成后来更早的检查、更密的访视与更清楚的责任，记忆便只剩名字被重新提起。
- `S06-L06` **男：**那便把两份卷宗分开摆好，再把相同的问题留在中间：前一次悲剧留下的教训，是否真正走到了后来的孩子身边？

#### English

- `S06-L01` **Woman:** The red paper of the New Year still hangs upon the wall, the word “Peace” written in a careful hand. Yet the ward light is white beyond all seasons, as though it has never understood the wishes of the human world.
- `S06-L02` **Man:** This is another child, another year, another hospital room. We may compare the gaps left by the system, but we must not make the story tidy by turning different causes of death into one fate.
- `S06-L03` **Woman:** The family waited for a visit and received, instead, an emergency call. A care notebook records so much of the everyday. Why do the most important questions remain in its blank spaces?
- `S06-L04` **Man:** The family and public posts raised questions. The organization issued a public response. Prosecutors separately entered a decision not to prosecute. These must remain distinct; our grief may not place a seal upon any side.
- `S06-L05` **Woman:** Yet if a previous loss did not lead to earlier checks, more frequent visits, and clearer responsibility, memory becomes no more than the repetition of a name.
- `S06-L06` **Man:** Then set the two case files apart, and leave the common question between them: did the lesson of the earlier tragedy ever truly reach the child who came later?

#### 日本語

- `S06-L01` **女：**新春の赤い紙はまだ壁に貼られ、「平安」の二文字は端正に書かれています。けれど病室の灯りは季節を知らぬほど白く、人の願いなど初めから知らないようです。
- `S06-L02` **男：**これは別の子ども、別の年、別の病室です。制度に残された継ぎ目を比べることはできても、物語を整えるために、異なる死因を一つの運命として書いてはなりません。
- `S06-L03` **女：**家族が待っていたのは面会でした。最後に届いたのは救急の電話でした。ケアノートには多くの日常が書かれています。それなのに、なぜ大切な疑問は空白のままなのでしょう。
- `S06-L04` **男：**家族と公開投稿は疑問を示し、団体は公に説明し、検察は別に不起訴処分を出しました。三つは分けて示さなければなりません。私たちの悲しみで、どの側にも判を押すことはできません。
- `S06-L05` **女：**それでも、過去の喪失が、その後のより早い確認、より密な訪問、より明確な責任へ変わらなかったなら、記憶は名前をもう一度呼ぶだけで終わってしまいます。
- `S06-L06` **男：**ならば二つの記録を分けて置き、共通する問いをその間に残しましょう。前の悲劇が残した教訓は、その後の子どものもとへ本当に届いたのでしょうか。

### M.8 第七場｜文件完整，接縫仍在

#### 繁體中文

- `S07-L01` **男：**日期一日不差，照片也留在卷中；每一次聯繫都能找到文字，每一個人似乎都曾做過自己那一段。
- `S07-L02` **女：**文件如此完整，為何孩子的位置仍是一塊空白？也許漏掉的從來不是一張紙，而是紙外那個正在改變的身體。
- `S07-L03` **男：**這頁寫照顧者如何說明，那頁寫訪視者如何判斷；我把它們排得整齊，卻仍不知道，當兩者不一致時，誰應當停下來追問。
- `S07-L04` **女：**專業不是把最會說話的解釋抄進表格。專業是當孩子的外觀、反應與照顧者說法對不上時，敢於承認「我還不能放心」。
- `S07-L05` **男：**後來制度增加檢查、調整訪視頻率、補上新的規定；這些改變顯示制度開始回應裂縫。
- `S07-L06` **女：**改革不能回到那一百一十五天。它唯一能夠回答孩子的方式，是不讓下一次裝訂線，再在同一個地方斷開。

#### 簡體中文

- `S07-L01` **男：**日期一日不差，照片也留在卷中；每一次联系都能找到文字，每一个人似乎都曾做过自己那一段。
- `S07-L02` **女：**文件如此完整，为什么孩子的位置仍是一块空白？也许遗漏的从来不是一张纸，而是纸外那个正在变化的身体。
- `S07-L03` **男：**这一页写照护者如何说明，那一页写访视者如何判断；我把它们排得整齐，却仍不知道，当两者不一致时，谁应当停下来追问。
- `S07-L04` **女：**专业不是把最会说话的解释抄进表格。专业是当孩子的外观、反应与照护者的说法对不上时，敢于承认“我还不能放心”。
- `S07-L05` **男：**后来制度增加检查、调整访视频率、补上新的规定；这些改变显示制度开始回应裂缝。
- `S07-L06` **女：**改革不能回到那一百一十五天。它唯一能够回答孩子的方式，是不让下一次装订线，再在同一个地方断开。

#### English

- `S07-L01` **Man:** Not a date is missing, and the photographs remain in the file. Every contact has left its words behind; it seems that everyone completed the part assigned to them.
- `S07-L02` **Woman:** If the documents are so complete, why is the child’s place still blank? Perhaps what was missed was never a sheet of paper, but the changing body beyond the page.
- `S07-L03` **Man:** This page records the caregiver’s explanation; that one records the visitor’s assessment. I place them in order, yet still cannot see who should have stopped to ask another question when the two did not agree.
- `S07-L04` **Woman:** Professional judgment is not copying the most fluent explanation into a form. It is having the courage to say, “I am not yet reassured,” when a child’s appearance and reactions do not match the caregiver’s account.
- `S07-L05` **Man:** Later, the system added checks, changed the frequency of visits, and supplied new rules. These changes show that it began to answer the fracture.
- `S07-L06` **Woman:** Reform cannot return to those 115 days. Its only answer to the child is to ensure that the next binding thread does not break in the same place.

#### 日本語

- `S07-L01` **男：**日付に一日の欠けもなく、写真も記録に残っています。どの連絡にも文章があり、誰もが自分の担当部分を行ったように見えます。
- `S07-L02` **女：**書類がこれほどそろっているのに、なぜ子どもの場所だけが空白なのでしょう。見落とされたのは一枚の紙ではなく、紙の外で変化していた身体だったのかもしれません。
- `S07-L03` **男：**この頁には養育者の説明が、あの頁には訪問者の判断が書かれています。きれいに並べても、両者が一致しないとき、誰が立ち止まって問い直すべきだったのか、なお分かりません。
- `S07-L04` **女：**専門性とは、最もよく話す人の説明を用紙へ写すことではありません。子どもの外見や反応が養育者の説明と合わないとき、「まだ安心できない」と認める勇気です。
- `S07-L05` **男：**その後、制度は確認を増やし、訪問頻度を見直し、新しい規定を補いました。こうした変化は、制度が裂け目に応え始めたことを示します。
- `S07-L06` **女：**改革は、あの115日間へ戻れません。子どもに答える唯一の方法は、次の綴じ糸を同じ場所で再び切らせないことです。

### M.9 第八場｜白髮之下，信任的重量

#### 繁體中文

- `S08-L01` **女：**她曾把思念收得很小，怕一次探望驚擾照護，也怕每見一次便更捨不得。於是她相信，會有人替她走近孩子。
- `S08-L02` **男：**信任原是交到制度手中的燈；它應照見門後的危險，而不該在失去以後，變成壓回家屬肩上的重量。
- `S08-L03` **女：**她問的不是歲月為何無情。她問的是，在歲月還來得及的時候，看見、追問與保護為何沒有抵達。
- `S08-L04` **男：**判決可以回答責任，卷宗可以留下經過；它們都不能把一歲多的孩子送回她懷裡。
- `S08-L05` **女：**那便不要追逐她的眼淚。讓鏡頭留在麥克風、面紙與退場後仍冷著的證人席前，讓觀眾明白：人離開以後，房間恢復原狀，失去孩子的人，從來沒有。

#### 簡體中文

- `S08-L01` **女：**她曾把思念收得很小，怕一次探望惊扰照护，也怕每见一次便更舍不得。于是她相信，会有人替她走近孩子。
- `S08-L02` **男：**信任原是交到制度手中的灯；它应当照见门后的危险，而不该在失去以后，变成压回家属肩上的重量。
- `S08-L03` **女：**她问的不是岁月为什么无情。她问的是，在岁月还来得及的时候，看见、追问与保护为什么没有抵达。
- `S08-L04` **男：**判决可以回答责任，卷宗可以留下经过；它们都不能把一岁多的孩子送回她怀里。
- `S08-L05` **女：**那便不要追逐她的眼泪。让镜头留在麦克风、纸巾与退场后仍冷着的证人席前，让观众明白：人离开以后，房间恢复原状，失去孩子的人，从来没有。

#### English

- `S08-L01` **Woman:** She made her longing small, afraid that a visit might disturb the care being given, and afraid that every glimpse would make it harder to let go. So she trusted that someone else would go close to the child on her behalf.
- `S08-L02` **Man:** Trust was a lamp placed in the hands of the system. It should have illuminated danger behind the door, not returned after loss as a weight upon the family’s shoulders.
- `S08-L03` **Woman:** She is not asking why time is cruel. She is asking why, while there was still time, seeing, questioning, and protection did not arrive.
- `S08-L04` **Man:** A judgment can answer responsibility, and a file can preserve what happened. Neither can return a child barely more than a year old to her arms.
- `S08-L05` **Woman:** Then do not pursue her tears. Let the camera remain with the microphone, the tissue, and the witness stand gone cold after she leaves, so that the audience understands: after a person leaves, the room returns to its former state. The person who has lost a child never does.

#### 日本語

- `S08-L01` **女：**彼女は会いたい気持ちを小さくしまっていました。面会が養育の妨げになることを恐れ、会うたびに手放し難くなることも恐れていたからです。だから、自分に代わって誰かが子どものそばへ行ってくれると信じました。
- `S08-L02` **男：**信頼とは、制度の手に託された灯りでした。扉の向こうの危険を照らすべきものであり、失った後になって家族の肩へ戻される重荷であってはなりません。
- `S08-L03` **女：**彼女が問うのは、なぜ歳月が無情なのかではありません。まだ間に合う時間があったのに、なぜ気づき、問い、守ることが届かなかったのかを問うています。
- `S08-L04` **男：**判決は責任に答え、記録は経緯を残すことができます。けれど、どちらも一歳を少し過ぎた子どもを彼女の腕に返すことはできません。
- `S08-L05` **女：**ならば彼女の涙を追わないでください。カメラをマイク、ティッシュ、彼女が退廷した後も冷えたままの証言台に残しましょう。人が去れば部屋は元に戻ります。けれど、子どもを失った人は、決して元には戻れないのだと伝えるために。

### M.10 結尾皮影戲｜讓下一扇門更早打開

#### 繁體中文

- `S09-L01` **女：**戲將散了，燈也將熄。我們走過傳說、病房與法庭，留下來的，難道只能是一個孩子再也回不來的名字？
- `S09-L02` **男：**若卷宗只在悲劇以後證明誰曾經做錯，它便仍少了一頁；那一頁應當寫著，在危險成為結局以前，誰有責任依法啟動保護、及時把門打開。
- `S09-L03` **女：**花會重開，春天會回來。可是孩子失去的年歲，不能由下一季花期替他補還。
- `S09-L04` **男：**所以記住他，不是把他永遠留在最後一夜；是讓下一次傷痕出現時，有人相信，有人追問，有人不把今日寄放到明日。
- `S09-L05` **女：**也不要把保護交給傳說、運氣或某一個孤單的好人。讓每一次交接都能被確認，每一份職責都能走進門內。
- `S09-L06` **男：**那麼，請把這扇門推開。不是為了觀看悲傷，而是為了讓下一個孩子還來得及長大時，門外已經有人。

#### 簡體中文

- `S09-L01` **女：**戏将散了，灯也将熄。我们走过传说、病房与法庭，留下来的，难道只能是一个孩子再也回不来的名字？
- `S09-L02` **男：**如果卷宗只在悲剧以后证明谁曾经做错，它便仍少了一页；那一页应当写着，在危险成为结局以前，谁有责任依法启动保护、及时把门打开。
- `S09-L03` **女：**花会重开，春天会回来。可是孩子失去的年岁，不能由下一季花期替他补还。
- `S09-L04` **男：**所以记住他，不是把他永远留在最后一夜；而是让下一次伤痕出现时，有人相信，有人追问，有人不把今日寄放到明日。
- `S09-L05` **女：**也不要把保护交给传说、运气或某一个孤单的好人。让每一次交接都能被确认，每一份职责都能走进门内。
- `S09-L06` **男：**那么，请把这扇门推开。不是为了观看悲伤，而是为了让下一个孩子还来得及长大时，门外已经有人。

#### English

- `S09-L01` **Woman:** The play is almost over, and the lamps will soon go dark. We have passed through legend, hospital wards, and a courtroom. Must all that remains be the name of a child who can never return?
- `S09-L02` **Man:** If the files can tell us only after tragedy who did wrong, then a page is still missing. That page should say who had a legal duty to activate protection and open the door in time—before danger became the ending.
- `S09-L03` **Woman:** Flowers bloom again, and spring returns. But the years a child has lost cannot be restored by the flowers of another season.
- `S09-L04` **Man:** To remember him is not to hold him forever in his final night. It is to ensure that when the next injury appears, someone believes, someone asks again, and no one places today in the keeping of tomorrow.
- `S09-L05` **Woman:** Nor should protection be entrusted to legend, luck, or one good person standing alone. Let every handover be confirmed, and let every duty pass through the door.
- `S09-L06` **Man:** Then please, open this door. Not to look upon sorrow, but so that while the next child still has time to grow, someone is already waiting outside.

#### 日本語

- `S09-L01` **女：**芝居は終わり、灯りもやがて消えます。私たちは伝承、病室、法廷を歩いてきました。残るものは、もう戻らない一人の子どもの名前だけなのでしょうか。
- `S09-L02` **男：**記録が悲劇の後になって、誰が誤ったかを示すだけなら、まだ一頁足りません。その頁には、危険が結末になる前に、誰が法に基づいて保護を始動し、間に合うよう扉を開く責任を負っていたのかが書かれるべきです。
- `S09-L03` **女：**花は再び咲き、春は戻ります。けれど、子どもが失った年月を、次の季節の花で返すことはできません。
- `S09-L04` **男：**だから、あの子を記憶するとは、最後の夜へ永遠に閉じ込めることではありません。次に傷が現れたとき、信じる人がいる、問い直す人がいる、今日を明日に預けない人がいるようにすることです。
- `S09-L05` **女：**守ることを、伝承や運や、孤独な一人の善意に預けてもなりません。すべての引継ぎが確かめられ、すべての責務が扉の内側まで届くようにしましょう。
- `S09-L06` **男：**それでは、この扉を開いてください。悲しみを見るためではありません。次の子どもがまだ成長できるうちに、扉の外にすでに誰かがいるようにするためです。

### M.11 台詞上站與翻譯QA

- [ ] 每個語言恰有59個台詞ID：序問6句、第一至第七場各6句、第八場5句、結尾6句；不得因手機版刪句。
- [ ] 視覺字幕可依自然停頓拆成2–3張卡，但完整逐字稿仍以一個台詞ID保存；拆卡使用如`S04-L03-a`、`S04-L03-b`，不可另翻一版。
- [ ] 英文角色名使用`Woman`／`Man`，日文使用`女`／`男`；四語都保留「守門人」的文學角色定位，不把角色標成外婆、社工、醫師或法官。
- [ ] `115 days／115日間`等數字只在查證母表通過後上站；無一手公開定位的會議次數已退休，不得由翻譯檔重新帶回；若事實母表變更，四語由同一資料鍵更新。
- [ ] 第六場的家屬質疑、機構說明與不起訴處分必須在台詞前後維持三張分立來源牌；翻譯不能把「質疑」寫成已證實事實。
- [ ] 急診台詞不配兒童、醫護或照顧者的仿真聲線；外婆段不模仿本人哭聲；結尾核心句前音樂完全退去。
