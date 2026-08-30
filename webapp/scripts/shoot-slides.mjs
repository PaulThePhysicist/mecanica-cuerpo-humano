/**
 * Captura visual de referencia de las diapositivas de un capítulo.
 *
 * Recorre las diapositivas usando la barra de puntos (.nav-dot) y guarda un PNG
 * por diapositiva en dos viewports, además de un report.json con los errores de
 * consola detectados en cada una. Sirve de línea base antes de refactorizar y de
 * comparación después (diff de píxeles), ya que el proyecto no tiene tests.
 *
 * Uso:
 *   1. En una terminal:  npm run dev
 *   2. En otra:          node scripts/shoot-slides.mjs [--cap 1] [--out ../scratch/cap1-shots]
 *
 * Requiere Chrome instalado (usa puppeteer-core, sin descarga de navegador).
 * Variable de entorno CHROME_PATH para apuntar a otro binario.
 */
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const VIEWPORTS = [
  { name: 'desk', width: 1440, height: 900 },
  { name: 'mob', width: 820, height: 1180 },
];

/** Espera fija: los canvas 2D y las escenas 3D no exponen una señal de "listo". */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const args = { cap: '1', out: null, url: 'http://localhost:5173', settle: 1600 };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    if (key && key in args && argv[i + 1] !== undefined) args[key] = argv[i + 1];
  }
  args.settle = Number(args.settle);
  args.out = args.out ?? path.join(HERE, '..', '..', 'scratch', `cap${args.cap}-shots`);
  return args;
}

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      `No encontré Chrome. Probé:\n  ${CHROME_CANDIDATES.join('\n  ')}\n` +
        'Define CHROME_PATH con la ruta al ejecutable.',
    );
  }
  return found;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.out);
  const executablePath = findChrome();

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle'],
  });

  const report = { url: args.url, chapter: args.cap, capturedAt: new Date().toISOString(), slides: [] };

  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });

      // Los errores se acumulan en un buffer que vaciamos por diapositiva.
      let problems = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          problems.push(`${msg.type()}: ${msg.text()}`);
        }
      });
      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
      page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()} — ${req.failure()?.errorText}`));

      await page.goto(args.url, { waitUntil: 'networkidle2', timeout: 60_000 });

      // Portada de la app: entrar al capítulo pedido.
      const entered = await page.evaluate((cap) => {
        const label = `Capítulo ${cap}`;
        const card = Array.from(document.querySelectorAll('button')).find((b) =>
          b.textContent?.includes(label),
        );
        if (!card) return false;
        card.click();
        return true;
      }, args.cap);
      if (!entered) throw new Error(`No encontré la tarjeta del capítulo ${args.cap} en la portada.`);

      await page.waitForSelector('.nav-dot', { timeout: 30_000 });
      const total = await page.$$eval('.nav-dot', (dots) => dots.length);
      console.log(`[${vp.name}] capítulo ${args.cap}: ${total} diapositivas`);

      for (let i = 0; i < total; i += 1) {
        problems = [];
        await page.evaluate((idx) => {
          document.querySelectorAll('.nav-dot')[idx]?.dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
          );
        }, i);
        await wait(args.settle);

        const file = path.join(outDir, `${vp.name}-${String(i).padStart(2, '0')}.png`);
        await page.screenshot({ path: file });

        // Metadatos útiles para detectar canvas en blanco o cabeceras vacías.
        const meta = await page.evaluate(() => {
          const active = document.querySelector('.slide.active, .slide-full.active');
          const header = active?.querySelector('.module-header');
          const canvases = Array.from(active?.querySelectorAll('canvas') ?? []);
          return {
            hasActive: Boolean(active),
            title: header?.querySelector('.mtitle')?.textContent?.trim() ?? null,
            counter: header?.querySelector('.mslide-count')?.textContent?.trim() ?? null,
            canvases: canvases.map((c) => ({ w: c.width, h: c.height })),
            emptyCanvases: canvases.filter((c) => c.width === 0 || c.height === 0).length,
          };
        });

        report.slides.push({ viewport: vp.name, index: i, file: path.basename(file), ...meta, problems });
        if (problems.length) console.log(`  ! slide ${i}: ${problems.length} problema(s)`);
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');

  const withProblems = report.slides.filter((s) => s.problems.length);
  console.log(`\nListo: ${report.slides.length} capturas en ${outDir}`);
  console.log(
    withProblems.length
      ? `Diapositivas con problemas de consola: ${withProblems.map((s) => `${s.viewport}-${s.index}`).join(', ')}`
      : 'Sin errores de consola.',
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});
