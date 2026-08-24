import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);

async function loadRegistry() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(await readFile(new URL("assets/data/scenes.js", root), "utf8"), sandbox);
  vm.runInContext(await readFile(new URL("assets/data/film-productions.js", root), "utf8"), sandbox);
  return sandbox.window;
}

test("four films ship exact five-act clocks and non-looping score masters", async () => {
  const registry = await loadRegistry();
  const expected = {
    "FM-A": { duration: 155, starts: [0, 36, 85, 96, 129], scoreDuration: 153.167, duckDb: 8, file: "film-stamped-in-marble.m4a" },
    "FM-D": { duration: 144, starts: [0, 24, 52, 82, 116], scoreDuration: 141.433, duckDb: 8, file: "film-late-question.m4a" },
    "FM-B": { duration: 73, starts: [0, 14, 36, 49, 65], scoreDuration: 68.733, duckDb: 8, file: "film-one-year-old.m4a" },
    "FM-C": { duration: 195, starts: [0, 28, 75, 120, 170], scoreDuration: 177.533, duckDb: 6, file: "film-who-opens-door.m4a" },
  };

  for (const [id, contract] of Object.entries(expected)) {
    const production = registry.KAIKAI_FILM_PRODUCTIONS[id];
    assert.ok(production, id);
    assert.equal(production.duration, contract.duration, id);
    assert.equal(production.acts.length, 5, id);
    assert.deepEqual(Array.from(production.acts, (act) => act.start), contract.starts, id);
    assert.equal(production.acts.at(-1).end, contract.duration, id);
    assert.ok(production.cues.length >= 15, `${id} cue density`);
    assert.equal(production.cues[0].time, 0, id);
    assert.ok(production.cues.every((cue, index) => index === 0 || cue.time > production.cues[index - 1].time), `${id} sorted cues`);
    assert.equal(production.score.duration, contract.scoreDuration, id);
    assert.equal(production.score.defaultDuckDb, contract.duckDb, id);
    assert.equal(production.score.src, `public/media/${contract.file}`, id);
    await access(new URL(`public/media/${contract.file}`, root));
  }
});

test("film player exposes script-specific GSAP, audio sync, transcripts, and reduced motion", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");

  assert.match(html, /assets\/data\/film-productions\.js\?v=20260825-fmc-act4-handoff-2/);
  assert.equal((html.match(/data-score="FM-[ADBC]"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /id="cinema-audio"[^>]*\bloop\b/);
  assert.doesNotMatch(html, /id="ambient-audio"[^>]*\bloop\b/);
  assert.match(html, /id="film-production"/);
  assert.match(app, /function addProductionAct/);
  assert.match(app, /function syncSceneAudioToTimeline/);
  assert.match(app, /scorePauseDurationBefore/);
  assert.match(app, /silentWindow\?\.transport === "pause"/);
  assert.match(app, /score\.defaultDuckDb/);
  assert.doesNotMatch(app, /killTweensOf\(\[bgA, bgB, depthFar, depthMid, depthNear/);
  assert.match(app, /production\.cues/);
  assert.match(css, /\.storyboard\[data-beats="5"\]/);
  assert.match(css, /\.film-production\[data-film="FM-C"\]/);
  assert.match(css, /body\.is-reduced \.film-local-flash/);
});

test("FM-C maps thirteen concept plates into five moving GSAP storyboards and an eight-shot responsibility act", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const app = await readFile(new URL("assets/js/cinematic-revamp-core.js", root), "utf8");
  const css = await readFile(new URL("assets/css/cinematic-revamp-core.css", root), "utf8");
  const legacy = await readFile(new URL("assets/js/cinematic-revamp-legacy.js", root), "utf8");
  const refinedPrologue = await readFile(new URL("assets/js/chair-prologue-refined.js", root), "utf8");
  const baseShots = [
    "shot-01-object.webp",
    "shot-02-theatre.webp",
    "shot-03-corridor.webp",
    "shot-04-doors.webp",
    "shot-05-shadows.webp",
  ];
  const actionShots = Array.from({ length: 5 }, (_, index) => `shot-${String(index + 1).padStart(2, "0")}-action.webp`);
  const responsibilityShots = ["shot-04-handoff.webp", "shot-04-handle.webp", "shot-04-stepback.webp"];

  for (const shot of [...baseShots, ...actionShots, ...responsibilityShots]) {
    await access(new URL(`assets/img/films/fm-c-act4/${shot}`, root));
    assert.match(app, new RegExp(shot.replaceAll(".", "\\.")));
  }
  assert.match(app, /const FM_C_ACT_PLATES = \[/);
  assert.equal((app.match(/actionSrc:/g) ?? []).length, 5);
  assert.match(app, /const FM_C_ACT_SHOTS =/);
  assert.match(app, /actIndex === 3/);
  assert.match(app, /kind: "kaikai-close"/);
  assert.match(app, /kind: "qing-release-close"/);
  assert.match(app, /kind: "transfer"/);
  assert.match(app, /kind: "handoff"/);
  assert.match(app, /kind: "handle"/);
  assert.match(app, /kind: "stepback"/);
  assert.match(app, /kind: "responsibility-hold"/);
  assert.match(app, /start: \.88/);
  assert.match(app, /filmResponsibilityRig/);
  assert.match(app, /filmDutyThreadTransfers/);
  assert.match(app, /filmDutyStamps/);
  assert.match(app, /filmDutyAdults/);
  assert.match(app, /filmDutyTitle/);
  assert.match(app, /window\.MotionPathPlugin/);
  assert.match(app, /motionPath: \{ path:/);
  assert.match(app, /setFallbackOpacity/);
  assert.match(app, /playFmCFoley\("fluorescent"\)/);
  assert.match(app, /playFmCFoley\("paper"\)/);
  assert.match(app, /playFmCFoley\("latch"\)/);
  assert.match(app, /playFmCFoley\("step"\)/);
  assert.match(app, /data-shot-kind=/);
  assert.match(app, /\.fm-c-live-fx/);
  assert.equal((app.match(/data-act-plate=/g) ?? []).length, 1);
  assert.match(app, /function addFmCActPlate/);
  assert.match(app, /filmActFrames\[meta\.actionIndex\]/);
  assert.doesNotMatch(app, /FM_C_ACT4_CUTS|addFmCAct4Sequence/);
  assert.match(app, /scene\.id === "FM-C" \? "" : scene\.image/);
  assert.match(app, /scene\.image && scene\.id !== "FM-C"/);
  assert.match(app, /params\.get\("act"\)/);
  assert.match(app, /shotCount/);
  assert.match(app, /dataset\.newPlate = "true"/);
  assert.match(app, /url\.searchParams\.set\("act", String\(actIndex \+ 1\)\)/);
  assert.match(legacy, /direct\.has\("scene"\)\|\|direct\.get\("reel"\)==="1"/);
  assert.match(refinedPrologue, /direct\.has\("scene"\)\|\|direct\.get\("reel"\)==="1"/);
  assert.match(html, /assets\/vendor\/gsap\/MotionPathPlugin\.min\.js/);
  assert.match(html, /rev=20260825-fmc-act4-handoff-2/);
  assert.match(css, /\.fm-c-five-act-sequence/);
  assert.match(css, /\.fm-c-five-act-sequence\{position:absolute;z-index:3/);
  assert.match(css, /\.fm-c-act-shot\{/);
  assert.match(css, /\.fm-c-live-fx\{/);
  assert.match(css, /\.fm-c-responsibility-rig\{/);
  assert.match(css, /\.duty-fluorescent/);
  assert.match(css, /\.duty-grip/);
  assert.match(css, /\.duty-release/);
  assert.match(css, /\.duty-thread-transfer/);
  assert.match(css, /\.duty-stamp/);
  assert.match(css, /\.duty-adult-focus/);
  assert.match(css, /\.duty-responsibility-title/);
  assert.match(css, /\.duty-adult-focus\{background-size:contain\}/);
  assert.match(css, /data-speaker-tone="chorus"/);
  assert.match(css, /button\[data-new-plate="true"\]/);
  assert.match(css, /data-film="FM-C"\] \.film-separated-palms\{display:none\}/);
  assert.match(css, /data-scene="FM-C"\] \.cinema-bg/);
  assert.match(css, /background-image:none!important/);
  assert.match(css, /body\.is-reduced \.fm-c-act-shot img/);

  const registry = await loadRegistry();
  const ancientLine = registry.KAIKAI_FILM_PRODUCTIONS["FM-C"].cues.find((cue) => cue.text.startsWith("花有重開日"));
  assert.equal(ancientLine?.speaker, "椅仔姑與剴剴｜兩人合聲");
  assert.match(registry.KAIKAI_FILM_PRODUCTIONS["FM-C"].acts[3].action, /文件、印章與紅線移向成人/);
});
