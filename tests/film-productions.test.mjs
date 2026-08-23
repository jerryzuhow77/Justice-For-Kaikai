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

  assert.match(html, /assets\/data\/film-productions\.js\?v=20260823-film5-1/);
  assert.equal((html.match(/data-score="FM-[ADBC]"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /id="cinema-audio"[^>]*\bloop\b/);
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
