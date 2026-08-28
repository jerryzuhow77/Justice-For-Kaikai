(function () {
  "use strict";

  window.KAIKAI_EDITORIAL_DATA = Object.freeze({
    siteUpdatedAt: "2026-08-28",
    statusCheckedAt: "2026-08-16",
    statusCheckedLabel: "2026年8月16日",
    timeline: [
      {
        date: "2023-09-01",
        label: "09.01",
        day: "第 1 日",
        title: "開始全日托照顧",
        summary: "孩子交由合作的全日托照顧者照顧。",
        boundary: "全日托不自動等同法定寄養或由主管機關所為的家外安置。"
      },
      {
        date: "2023-09-25",
        label: "09.25",
        day: "第 25 日",
        title: "第一次訪視",
        summary: "紀錄額頭瘀青；當時說法為遊玩碰撞。",
        boundary: "紀錄、當時說法與法院事後判斷分欄。"
      },
      {
        date: "2023-10-23",
        label: "10.23",
        day: "第 53 日",
        title: "第二次訪視",
        summary: "紀錄較安靜、沒有精神；當時說法為剛睡醒。",
        boundary: "不以事後結果替當時人員補寫主觀明知。"
      },
      {
        date: "2023-11",
        label: "11月—12月初",
        day: "多筆材料",
        title: "身體狀況與訪視安排",
        summary: "紀錄與訊息涉及掉牙、身體狀況、就醫說明與訪視安排。",
        boundary: "不把多筆材料拼成同一日或單一因果。"
      },
      {
        date: "2023-12-24",
        label: "12.05—12.24",
        day: "最後 20 日",
        title: "訪視未完成，凌晨送醫",
        summary: "原訂訪視未完成；其後以電話與訊息取得情況，12月24日凌晨送醫。",
        boundary: "不經裁判宣稱單一行為必然造成結果。"
      }
    ],
    sourceLabels: [
      { key: "court", label: "法院／官方", note: "裁判、新聞稿、法規、公報與統計" },
      { key: "report", label: "具名報導", note: "保留媒體、日期與引述範圍" },
      { key: "notes", label: "庭審筆記", note: "不是法院逐字筆錄" },
      { key: "letter", label: "來函", note: "標示匿名、核實限制與可支持範圍" },
      { key: "reconstruction", label: "藝術重構", note: "不作證、不冒充病歷或真實錄音" }
    ],
    glossary: [
      {
        term: "家外安置",
        kind: "制度用語",
        definition: "孩子因保護或照顧需要，暫時不在原生家庭生活的安排；可能涉及親屬、寄養家庭、團體家庭或機構。實際法律依據與安置方式須逐案確認。",
        source: "兒少權法第23、56條",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050001"
      },
      {
        term: "全日托",
        kind: "照顧安排",
        definition: "本站用來描述包含日夜的連續托育安排；不因名稱相近，就自動等同法定寄養、收養前共同生活或主管機關安置。",
        source: "本站閱讀界線",
        href: "#source-guide"
      },
      {
        term: "收出養媒合",
        kind: "法定服務",
        definition: "由經主管機關許可的服務者辦理出養必要性訪視、收養人評估、漸進式接觸與相關協助；法院是否認可收養仍是另一個程序。",
        source: "兒少權法第15至17條",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050001"
      },
      {
        term: "訪視",
        kind: "程序行為",
        definition: "依不同法源與服務階段進行的調查、評估或關懷。本站分開記錄是否親眼見到孩子、當時說法、客觀紀錄與後續處置。",
        source: "兒少權法第16、17、53條",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050001"
      },
      {
        term: "通報義務",
        kind: "法定義務",
        definition: "法定專業人員執行業務時知悉兒少有法定保護情形，應立即向地方主管機關通報，最遲不得超過24小時；通報後由主管機關分級、調查與處理。",
        source: "兒少權法第53條",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050001"
      },
      {
        term: "核實狀態",
        kind: "本站標籤",
        definition: "本站用來說明一筆材料目前能核對到哪裡，例如已由官方資料確認、僅有單一具名報導、說法互異或尚無法獨立核實；不是法律術語，也不是有罪無罪判斷。",
        source: "本站編輯規則",
        href: "#source-guide"
      },
      {
        term: "裁判確定",
        kind: "司法程序",
        definition: "通常指裁判已不能再依通常程序上訴而發生確定效力；個案仍須以法院程序資料、終局裁判或確定證明為準。",
        source: "司法院程序說明",
        href: "https://www.judicial.gov.tw/tw/cp-209-210-b0504-1.html"
      },
      {
        term: "藝術重構",
        kind: "本站標籤",
        definition: "依公開材料重新設計的場景、聲音或敘事節奏；不是案件現場影像、真實錄音、病歷、筆錄或法院認定。",
        source: "本站製作倫理",
        href: "#production-boundaries"
      }
    ]
  });
})();
