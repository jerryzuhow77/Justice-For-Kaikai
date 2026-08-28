import { chromium } from "playwright";
import { mkdir, rename } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const rawDir = path.join(root, ".film-recordings");
const outputDir = path.join(root, "assets", "video");
const playbackRate = 2;

const films = [
  { id: "FM-A", animation: 1, duration: 155, output: "fm-a-buried-qing-legend.mp4", score: "film-stamped-in-marble.m4a" },
  { id: "FM-D", animation: 18, duration: 144, output: "fm-d-unarrived-visit.mp4", score: "film-late-question.m4a" },
  { id: "FM-B", animation: 21, duration: 105, output: "fm-b-hair-turns-white.mp4", score: "film-one-year-old-extended.m4a" },
  { id: "FM-C", animation: 24, duration: 195, output: "fm-c-two-eras-one-door.mp4", score: "film-who-opens-door.m4a" }
];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: options.stdio || "inherit" });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4173/");
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Local capture server did not start");
}

async function capture(browser, film) {
  const captureDir = path.join(rawDir, film.id);
  await mkdir(captureDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 960, height: 540 },
    recordVideo: { dir: captureDir, size: { width: 960, height: 540 } },
    reducedMotion: "no-preference"
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4173/?animation=${film.animation}`, { waitUntil: "networkidle" });
  await page.locator("#cinema-dialog[open]").waitFor();
  await page.addStyleTag({ content: `
    html,body{width:960px!important;height:540px!important;overflow:hidden!important;background:#050807!important}
    body>*:not(#cinema-dialog){display:none!important}
    #cinema-dialog{position:fixed!important;inset:0!important;width:960px!important;height:540px!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;background:#050807!important}
    #cinema-dialog::backdrop{background:#050807!important}
    .cinema-shell{display:block!important;width:960px!important;height:540px!important;max-width:none!important;padding:0!important;background:#050807!important}
    .cinema-shell>*:not(.cinema-stage){display:none!important}
    .cinema-stage{position:fixed!important;inset:0!important;width:960px!important;height:540px!important;min-height:0!important;max-height:none!important;margin:0!important;border:0!important;border-radius:0!important}
    .dialogue-box{position:absolute!important;left:5%!important;right:5%!important;bottom:5%!important;z-index:40!important}
    .cinema-play-overlay{display:none!important}
  ` });
  await page.evaluate((rate) => {
    window.gsap?.globalTimeline?.timeScale(rate);
    document.querySelector("#play-cinema")?.click();
  }, playbackRate);
  await page.waitForTimeout(Math.ceil((film.duration / playbackRate + 3) * 1000));
  const video = page.video();
  await context.close();
  const rawPath = path.join(rawDir, `${film.id}.webm`);
  await rename(await video.path(), rawPath);
  return rawPath;
}

await mkdir(rawDir, { recursive: true });
await mkdir(outputDir, { recursive: true });
const server = spawn("python3", ["-m", "http.server", "4173", "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" });
try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
  try {
    for (const film of films) {
      const rawPath = await capture(browser, film);
      await run("ffmpeg", [
        "-y", "-ss", "1.5", "-i", rawPath,
        "-i", path.join(root, "public", "media", film.score),
        "-filter:v", `setpts=${playbackRate}*(PTS-STARTPTS),tpad=stop_mode=clone:stop_duration=8,format=yuv420p`,
        "-t", String(film.duration),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-preset", "medium", "-crf", "24",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
        path.join(outputDir, film.output)
      ]);
    }
  } finally {
    await browser.close();
  }
} finally {
  server.kill("SIGTERM");
}
