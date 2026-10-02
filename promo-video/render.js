// Render del reel: node render.js [--frames 0,60,90] [--fps 30]
// Senza --frames: esporta tutti i fotogrammi e codifica build/powergym_reel.mp4 (con audio se presente).
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const BUILD = path.join(__dirname, 'build');
fs.mkdirSync(BUILD, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (!m.text().includes('ERR_FILE_NOT_FOUND')) console.log('[page]', m.text()); });
  page.on('pageerror', e => { console.error('[page error]', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?render');
  await page.evaluate(() => window.ready);
  const slots = await page.evaluate(() => window.SLOTS.map(s => s.id));
  const loaded = slots.filter(id => fs_exists(id));
  function fs_exists(id) { return fs.existsSync(path.join(__dirname, 'clips', id + '.mp4')); }
  console.log('clip reali trovati:', loaded.length ? loaded.join(', ') : 'nessuno (uso fallback CGI)');

  const grab = async t => {
    const b64 = await page.evaluate(async t => { await window.renderAt(t, true); return document.getElementById('c').toDataURL('image/jpeg', .95).split(',')[1]; }, t);
    return Buffer.from(b64, 'base64');
  };

  const frames = opt('--frames');
  if (frames) {
    for (const f of frames.split(',')) {
      const t = parseFloat(f);
      fs.writeFileSync(path.join(BUILD, `still_${t.toFixed(2)}.jpg`), await grab(t));
      console.log('still', t);
    }
    await browser.close();
    return;
  }

  const fps = parseInt(opt('--fps', '30'), 10);
  const duration = await page.evaluate(() => window.DURATION);
  const total = Math.round(duration * fps);
  const audio = path.join(BUILD, 'audio.wav');
  const out = path.join(BUILD, 'powergym_reel.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    ...(fs.existsSync(audio) ? ['-i', audio, '-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < total; i++) {
    const buf = await grab(i / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 75 === 0) console.log(`frame ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('scritto', out);
})();
