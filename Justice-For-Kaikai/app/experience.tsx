"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import zhHantRaw from "../public/content/zh-Hant.md?raw";
import zhHansRaw from "../public/content/zh-Hans.md?raw";
import enRaw from "../public/content/en.md?raw";
import jaRaw from "../public/content/ja.md?raw";
import outroZhHantRaw from "../public/content/outro-zh-Hant.md?raw";
import outroI18nRaw from "../public/content/outro-i18n.md?raw";
import { extractDialogue, renderMarkdown, splitChapters, type Locale } from "./markdown";
import { chapterTitles, endingDialogue, locales, prologueDialogue, sceneObjects, ui } from "./site-data";

type Mode = "guided" | "cinema" | "reading" | "reduced";

const rawCopy: Record<Locale, string> = {
  "zh-Hant": zhHantRaw,
  "zh-Hans": zhHansRaw,
  en: enRaw,
  ja: jaRaw,
};

const selectOutro = (locale: Locale) => {
  if (locale === "zh-Hant") return outroZhHantRaw;
  const keys: Record<Exclude<Locale, "zh-Hant">, [string, string | null]> = {
    "zh-Hans": ["## II.1", "## II.2"],
    en: ["## II.2", "## II.3"],
    ja: ["## II.3", null],
  };
  const [start, end] = keys[locale];
  const from = outroI18nRaw.indexOf(start);
  const to = end ? outroI18nRaw.indexOf(end) : outroI18nRaw.length;
  return outroI18nRaw.slice(from, to > from ? to : undefined);
};

const inlineText = (value: string) =>
  value
    .replace(/`[^`]+`/g, "")
    .replaceAll("**", "")
    .replace(/^([^｜|:：]+)[｜|:：]\s*/, "$1｜");

function AudioDock({ currentTrack, trackTitle, playing, onToggle, labels }: {
  currentTrack: number | null;
  trackTitle: string;
  playing: boolean;
  onToggle: () => void;
  labels: Record<string, string>;
}) {
  if (currentTrack === null) return null;
  return (
    <div className="audio-dock" role="region" aria-label={labels.playMusic}>
      <span className="audio-equalizer" aria-hidden="true"><i /><i /><i /><i /></span>
      <span>0{currentTrack + 1} · {trackTitle}</span>
      <button type="button" onClick={onToggle}>{playing ? labels.pauseMusic : labels.playMusic}</button>
    </div>
  );
}

function ShadowStage({ lines, open, onToggle, labels, ending = false, autoAdvance = true }: {
  lines: string[];
  open: boolean;
  onToggle: () => void;
  labels: Record<string, string>;
  ending?: boolean;
  autoAdvance?: boolean;
}) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!open || !autoAdvance) return;
    const timer = window.setInterval(
      () => setLineIndex((value) => Math.min(value + 1, lines.length - 1)),
      ending ? 7600 : 6500,
    );
    return () => window.clearInterval(timer);
  }, [open, ending, lines, autoAdvance]);

  return (
    <div className={`shadow-stage ${open ? "is-open" : ""} ${ending ? "is-ending" : ""}`}>
      <div className="stage-frame" aria-hidden="true">
        <div className="curtain curtain-left" />
        <div className="curtain curtain-right" />
        <div className="stage-door"><span /></div>
        <div className="bamboo-chair"><i /><b /></div>
        <div className="puppet puppet-woman"><span /></div>
        <div className="puppet puppet-man"><span /></div>
        {ending && <div className="red-thread" />}
      </div>
      <div className="stage-copy" aria-live="polite">
        <span className="source-badge">{labels.source}</span>
        <p>{open ? lines[lineIndex] : labels.notice}</p>
        {open && (
          <div className="line-dots" aria-label={`${lineIndex + 1}/${lines.length}`}>
            {lines.map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`${index + 1}`}
                aria-current={index === lineIndex ? "step" : undefined}
                onClick={() => setLineIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
      <button type="button" className="stage-toggle" onClick={onToggle}>
        {open ? labels.closeStage : labels.openStage}
      </button>
    </div>
  );
}

function ChapterTransition({ chapter, dialogue, title, locale, mode, playing, currentTrack, onMusic }: {
  chapter: number;
  dialogue: string[];
  title: string;
  locale: Locale;
  mode: Mode;
  playing: boolean;
  currentTrack: number | null;
  onMusic: (chapter: number) => void;
}) {
  const labels = ui[locale];
  const hasMusic = chapter < 6;
  if (mode === "reading") return null;

  return (
    <div className={`chapter-transition chapter-tone-${chapter + 1}`}>
      <div className="transition-scene" aria-hidden="true">
        <div className="paper-moon" />
        <div className="corridor-line" />
        <div className="side-figure figure-a" />
        <div className="side-figure figure-b" />
        <span className="chapter-object">{sceneObjects[chapter]}</span>
      </div>
      <div className="transition-copy">
        <span className="kicker">{labels.transition} · SCENE 0{chapter + 1}</span>
        <h3>{title}</h3>
        <div className="dialogue-preview">
          {dialogue.map((line) => <p key={line}>{inlineText(line)}</p>)}
        </div>
        {hasMusic ? (
          <button type="button" className="music-button" onClick={() => onMusic(chapter)}>
            <span aria-hidden="true">{playing && currentTrack === chapter ? "Ⅱ" : "▶"}</span>
            {playing && currentTrack === chapter ? labels.pauseMusic : labels.playMusic}
          </button>
        ) : (
          <span className="ambient-label">FIELD AMBIENCE · NO AUTOPLAY</span>
        )}
      </div>
    </div>
  );
}

export function KaikaiExperience() {
  const [locale, setLocale] = useState<Locale>("zh-Hant");
  const [mode, setMode] = useState<Mode>("guided");
  const [stageOpen, setStageOpen] = useState(false);
  const [endingOpen, setEndingOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const labels = ui[locale];
  const chapters = useMemo(() => splitChapters(rawCopy[locale]), [locale]);
  const outro = useMemo(() => renderMarkdown(selectOutro(locale)), [locale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("lang") as Locale | null;
    queueMicrotask(() => {
      if (requested && locales.some((item) => item.id === requested)) setLocale(requested);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setMode("reduced");
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.mode = mode;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.history.replaceState({}, "", url);
  }, [locale, mode]);

  const selectMode = (next: Mode) => {
    setMode(next);
    if (next === "reading" || next === "reduced") {
      setStageOpen(false);
      setEndingOpen(false);
      setPlaying(false);
      audioRef.current?.pause();
    }
  };

  const playChapter = async (chapter: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack === chapter && playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (currentTrack !== chapter) {
      audio.src = `/media/chapter-0${chapter + 1}.m4a`;
      setCurrentTrack(chapter);
    } else if (audio.ended) {
      audio.currentTime = 0;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const toggleDock = () => {
    if (currentTrack !== null) void playChapter(currentTrack);
  };

  return (
    <main>
      <a className="skip-link" href="#article">Skip to content</a>
      <audio ref={audioRef} preload="none" onEnded={() => setPlaying(false)} />

      <header className="site-header">
        <a href="#top" className="wordmark" aria-label={labels.project}>
          <span className="seal">責</span><span>{labels.project}</span>
        </a>
        <div className="header-actions">
          <a href="#reading-map" className="header-link">{labels.map}</a>
          <label className="language-select">
            <span className="sr-only">Language</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              {locales.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
            </select>
          </label>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-content">
          <span className="eyebrow">CHAPTER 01 · VERSION 6.0.2</span>
          <p className="hero-project">{labels.project}</p>
          <h1>{labels.title}</h1>
          <p className="hero-deck">{labels.deck}</p>
          <blockquote>{labels.quote}</blockquote>
          <p className="hero-intro">{labels.intro}</p>
          <div className="hero-meta"><span>{labels.method}</span><span>FACT CHECK · 2026.08.16</span></div>
          <a className="scroll-cue" href="#prologue"><span />{labels.scroll}</a>
        </div>
      </section>

      <section className="content-warning" aria-label={labels.notice}>
        <span aria-hidden="true">慎</span><p>{labels.notice}</p>
      </section>

      <section className="mode-panel" aria-labelledby="mode-title">
        <div><span className="kicker">ACCESSIBLE EXPERIENCE</span><h2 id="mode-title">{labels.modes}</h2></div>
        <div className="mode-buttons">
          {(["guided", "cinema", "reading", "reduced"] as Mode[]).map((item) => (
            <button type="button" key={item} aria-pressed={mode === item} onClick={() => selectMode(item)}>{labels[item]}</button>
          ))}
        </div>
      </section>

      <section className="prologue-section" id="prologue">
        <div className="section-heading">
          <span className="kicker">SCENE S00 · PROLOGUE</span>
          <h2>{labels.openStage.replace("幕開｜", "").replace("Raise curtain | ", "")}</h2>
        </div>
        <ShadowStage key={`prologue-${locale}-${stageOpen}`} lines={prologueDialogue[locale]} open={stageOpen} onToggle={() => setStageOpen((value) => !value)} labels={labels} autoAdvance={mode !== "reduced"} />
        <details className="full-transcript" open={mode === "reading" || mode === "reduced"}>
          <summary>{labels.transcript}</summary>
          {prologueDialogue[locale].map((line, index) => <p key={line}><code>S00-L0{index + 1}</code> {line}</p>)}
        </details>
      </section>

      <section className="reading-map" id="reading-map" aria-labelledby="map-title">
        <div className="map-intro"><span className="kicker">EIGHT SCENES · ONE RESPONSIBILITY</span><h2 id="map-title">{labels.map}</h2><p>{labels.musicCredit}</p></div>
        <ol>
          {chapterTitles[locale].map((title, index) => (
            <li key={title}>
              <a href={`#chapter-${String(index + 1).padStart(2, "0")}`}>
                <span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{sceneObjects[index]}</small>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="article-shell" id="article">
        <aside className="chapter-rail" aria-label={labels.map}>
          {chapterTitles[locale].map((title, index) => <a key={title} href={`#chapter-${String(index + 1).padStart(2, "0")}`} aria-label={title}>{String(index + 1).padStart(2, "0")}</a>)}
        </aside>
        <article className="article-content">
          {chapters.map((chapter, index) => (
            <section id={`chapter-${String(index + 1).padStart(2, "0")}`} className="chapter" key={index}>
              <ChapterTransition chapter={index} dialogue={extractDialogue(chapter)} title={chapterTitles[locale][index]} locale={locale} mode={mode} playing={playing} currentTrack={currentTrack} onMusic={playChapter} />
              <div className="markdown-copy" dangerouslySetInnerHTML={{ __html: renderMarkdown(chapter) }} />
            </section>
          ))}
        </article>
      </div>

      <section className="ending-section" id="ending">
        <div className="section-heading"><span className="kicker">SCENE S09 · 65–80 SEC · MANUAL ENTRY</span><h2>{labels.ending}</h2><p>{labels.endingNote}</p></div>
        <ShadowStage key={`ending-${locale}-${endingOpen}`} lines={endingDialogue[locale]} open={endingOpen} onToggle={() => setEndingOpen((value) => !value)} labels={labels} ending autoAdvance={mode !== "reduced"} />
        <details className="full-transcript" open={mode === "reading" || mode === "reduced"}>
          <summary>{labels.transcript}</summary>
          {endingDialogue[locale].map((line, index) => <p key={line}><code>S09-L0{index + 1}</code> {line}</p>)}
        </details>
      </section>

      <section className="outro-copy markdown-copy" dangerouslySetInnerHTML={{ __html: outro }} />

      <section className="action-card">
        <span className="seal large">護</span>
        <div><h2>{labels.actionTitle}</h2><p>{labels.action}</p><a href="https://www.mohw.gov.tw/cp-2704-46193-1.html" target="_blank" rel="noreferrer">113 OFFICIAL INFORMATION ↗</a></div>
      </section>

      <footer>
        <div><span className="kicker">JUSTICE FOR KAIKAI · V6.0.2</span><p>{labels.source}</p></div>
        <nav><a href="https://github.com/jerryzuhow77/Justice-For-Kaikai" target="_blank" rel="noreferrer">{labels.repository} ↗</a><a href="/docs/production-master-v6.0.2.md">{labels.specs}</a><a href="#top">↑ TOP</a></nav>
      </footer>

      <AudioDock currentTrack={currentTrack} trackTitle={currentTrack === null ? "" : chapterTitles[locale][currentTrack]} playing={playing} onToggle={toggleDock} labels={labels} />
    </main>
  );
}
