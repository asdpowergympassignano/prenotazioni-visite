// Colonna sonora sintetizzata, sincronizzata con la timeline di index.html.
// node audio.js  →  build/audio.wav (48 kHz, stereo, 25 s)
const fs = require('fs');
const path = require('path');

const SR = 48000, DUR = 25, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);       // bus principale
const VL = new Float32Array(N), VR = new Float32Array(N);     // mandata riverbero
let seed = 1234;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;

function add(i, v, pan = 0, verb = 0) {
  if (i < 0 || i >= N) return;
  const l = v * Math.cos((pan + 1) * Math.PI / 4), r = v * Math.sin((pan + 1) * Math.PI / 4);
  L[i] += l; R[i] += r; VL[i] += l * verb; VR[i] += r * verb;
}

/* ---------- strumenti ---------- */
function kick(t0, amp = 1, f0 = 150, f1 = 45, dec = .28, verb = .05) {
  let ph = 0; const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * .6; i++) {
    const t = i / SR, f = f1 + (f0 - f1) * Math.exp(-t / .035);
    ph += 2 * Math.PI * f / SR;
    const click = i < 90 ? noise() * .4 * (1 - i / 90) : 0;
    add(s + i, (Math.sin(ph) * Math.exp(-t / dec) + click) * amp, 0, verb);
  }
}
function impact(t0, amp = 1, dur = 1.6, verb = .25) {
  let ph = 0, lp = 0; const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * dur * 1.5; i++) {
    const t = i / SR, f = 28 + 40 * Math.exp(-t / .12);
    ph += 2 * Math.PI * f / SR;
    lp += (noise() - lp) * .02;
    const env = Math.exp(-t / (dur * .4));
    add(s + i, (Math.sin(ph) * .9 + lp * 1.6 * Math.exp(-t / .25)) * env * amp, 0, verb);
  }
}
function metal(t0, amp = .5, len = 1.8, verb = .5) {
  const parts = [[523, 1], [1307, .7], [2271, .5], [3517, .3], [4980, .18]];
  const s = Math.floor(t0 * SR);
  parts.forEach(([f, a], k) => {
    const dec = len / (1 + k * .7), det = 1 + (k % 2 ? .003 : -.002), pan = k % 2 ? .35 : -.35;
    for (let i = 0; i < SR * len * 1.3; i++) {
      const t = i / SR;
      add(s + i, Math.sin(2 * Math.PI * f * det * t) * a * Math.exp(-t / dec) * amp * .3, pan, verb);
    }
  });
}
function crack(t0, amp = .8, verb = .35) {
  let ph = 0, prev = 0; const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * .35; i++) {
    const t = i / SR, n = noise(), hp = n - prev; prev = n;
    const f = 150 + 2600 * Math.exp(-t / .03); ph += 2 * Math.PI * f / SR;
    const stut = (Math.floor(t * 70) % 2) ? 1 : .35;
    add(s + i, (hp * .8 * Math.exp(-t / .06) * stut + Math.sin(ph) * .35 * Math.exp(-t / .08)) * amp, (rnd() - .5) * .6, verb);
  }
}
function hat(t0, amp = .15, len = .05, pan = .2) {
  let prev = 0; const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * len * 2; i++) { const n = noise(), hp = n - prev; prev = n; add(s + i, hp * Math.exp(-(i / SR) / len * 3) * amp, pan, .05); }
}
function clap(t0, amp = .35) {
  let bp = 0, lp = 0; const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * .3; i++) {
    const t = i / SR; lp += (noise() - lp) * .35; bp = noise() - lp;
    const env = Math.exp(-t / .07) * (t < .012 ? (Math.floor(t * 300) % 2 ? 1 : .4) : 1);
    add(s + i, (bp * .7 + Math.sin(2 * Math.PI * 185 * t) * .3 * Math.exp(-t / .04)) * env * amp, 0, .3);
  }
}
function whoosh(t0, dur = .5, amp = .4, up = true) {
  let lp = 0; const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * dur; i++) {
    const u = i / (SR * dur), env = Math.sin(Math.PI * Math.pow(u, up ? 1.6 : .6));
    const c = .02 + .25 * (up ? u : 1 - u); lp += (noise() - lp) * c;
    add(s + i, lp * env * amp * 2, Math.sin(u * 6) * .5, .2);
  }
}
function riser(t0, t1, amp = .25) {
  let lp = 0, ph = 0; const s = Math.floor(t0 * SR), n = Math.floor((t1 - t0) * SR);
  for (let i = 0; i < n; i++) {
    const u = i / n; lp += (noise() - lp) * (.01 + .2 * u * u);
    ph += 2 * Math.PI * (180 + 900 * u * u) / SR;
    add(s + i, (lp * 1.5 + Math.sin(ph) * .15) * u * u * amp, 0, .3);
  }
}
function drone(t0, t1, f = 41.2, amp = .25, fadeIn = 1.5, fadeOut = .5) {
  let lp = 0; const s = Math.floor(t0 * SR), n = Math.floor((t1 - t0) * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR, u = i / n;
    const env = Math.min(1, t / fadeIn) * Math.min(1, (1 - u) * (t1 - t0) / fadeOut);
    lp += (noise() - lp) * .004;
    const v = Math.sin(2 * Math.PI * f * t) + .5 * Math.sin(2 * Math.PI * f * 2.003 * t) + .25 * Math.sin(2 * Math.PI * f * 3 * t + Math.sin(t * .7)) + lp * 6;
    add(s + i, v * env * amp, Math.sin(t * .5) * .2, .2);
  }
}
function bassNote(t0, len, f, amp = .22) {
  let ph = 0, lp = 0; const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * len; i++) {
    const t = i / SR; ph += f / SR; const saw = 2 * (ph % 1) - 1;
    lp += (saw - lp) * (.03 + .1 * Math.exp(-t / .05));
    const env = Math.min(1, t / .005) * Math.exp(-t / (len * .8));
    add(s + i, (lp * 1.4 + Math.sin(2 * Math.PI * f * t) * .6) * env * amp, 0, .02);
  }
}
function pad(t0, t1, freqs, amp = .06) {
  const s = Math.floor(t0 * SR), n = Math.floor((t1 - t0) * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR, u = i / n, env = Math.min(1, t / .8) * Math.min(1, (1 - u) * (t1 - t0) / .8);
    let v = 0; freqs.forEach((f, k) => { v += Math.sin(2 * Math.PI * f * t * (1 + (k % 2 ? .002 : -.002))) + .3 * Math.sin(2 * Math.PI * f * 2 * t); });
    add(s + i, v * env * amp, Math.sin(t * .8) * .4, .5);
  }
}

/* ---------- arrangiamento (stessi tempi del video) ---------- */
// SCENA 1 — buio, bagliore, bilanciere che emerge
drone(0, 6.3, 41.2, .22, 1.8, .3);
whoosh(.4, 1.4, .12);
metal(1.2, .12, 1.2, .6);            // sfioramento metallico
crack(1.9, .9);                       // il fulmine si attiva
impact(1.92, 1.1, 1.8);               // basso profondo
metal(1.95, .55, 2.2);                // risonanza del bilanciere
whoosh(2.05, .7, .22, false);         // impulso che corre sul bilanciere
// SCENA 2 — logo
riser(3.0, 5.15, .22);
hat(3.05, .2, .2, -.3); crack(3.05, .25);   // il fulmine della P accende POWER
impact(5.2, .7, 1.4); metal(5.2, .3, 1.6);  // logo completo
riser(5.6, 6.3, .3);
whoosh(5.85, .5, .5);                 // spinta attraverso il fulmine
// SCENA 3 — dentro la palestra (120 BPM dal t=6.4)
const B = .5, T0 = 6.4;
impact(6.32, 1, 1.2); crack(6.3, .5);
for (let k = 0; k < 9; k++) {         // 6.4 → 11.0
  const t = T0 + k * B;
  kick(t, .95);
  hat(t + B / 2, .12);
  bassNote(t + B / 2, B * .45, k % 4 === 3 ? 49 : 55);
}
whoosh(7.45, .2, .25); impact(8.34, .7, .7); metal(8.34, .25, .8);  // disco che si incastra
kick(8.5, .8, 120, 40); kick(8.8, .8, 120, 40);                    // tagli veloci
// SCENA 4 — più intensa
for (let k = 9; k < 19; k++) {        // 11.0 → 16.0 (circa)
  const t = T0 + k * B;
  kick(t, 1);
  if (k % 2) clap(t, .3);
  for (let h = 0; h < 4; h++) hat(t + h * B / 4, h % 2 ? .07 : .11, .035, h % 2 ? .4 : -.4);
  bassNote(t, B * .4, [55, 55, 65.4, 49][k % 4], .26);
  bassNote(t + B / 2, B * .4, [55, 55, 65.4, 49][k % 4], .2);
}
for (const t of [11.4, 12.9, 14.4]) { impact(t, .9, .9); crack(t, .3); metal(t, .18, .7); }
riser(15.0, 15.95, .25);
// SCENA 5 — community: ritmo più largo, armonia
impact(16.0, .8, 1.5);
pad(16.0, 20.0, [110, 130.8, 164.8], .045);
for (let k = 0; k < 8; k++) { const t = 16 + k * B; if (k % 2 === 0) kick(t, .55, 110, 42, .4); hat(t + B / 2, .06, .04); }
impact(17.4, .6, 1.2); metal(17.4, .2, 1.4);   // BUILD YOUR POWER
whoosh(19.5, .5, .25);
// SCENA 6 — nero, battito, fulmine, logo
kick(20.3, 1, 70, 32, .3, .2); kick(20.48, .7, 65, 30, .25, .2);   // battito cardiaco
crack(20.55, 1); crack(20.62, .5);
impact(20.78, 1.25, 2.6, .45); metal(20.8, .6, 3.2, .7);
pad(20.9, 25, [55, 82.4, 110, 164.8], .05);

/* ---------- riverbero (Schroeder) ---------- */
function reverb(inp, combs, aps) {
  const out = new Float32Array(N);
  for (const [d, g] of combs) { const buf = new Float32Array(d); let j = 0, lp = 0; for (let i = 0; i < N; i++) { const y = buf[j]; lp = y * .7 + lp * .3; buf[j] = inp[i] + lp * g; out[i] += y / combs.length; j = (j + 1) % d; } }
  for (const [d, g] of aps) { const buf = new Float32Array(d); let j = 0; for (let i = 0; i < N; i++) { const b = buf[j], x = out[i], y = -g * x + b; buf[j] = x + g * y; out[i] = y; j = (j + 1) % d; } }
  return out;
}
const rl = reverb(VL, [[1557, .84], [1617, .84], [1491, .84], [1422, .84]], [[225, .5], [556, .5]]);
const rr = reverb(VR, [[1580, .84], [1640, .84], [1514, .84], [1445, .84]], [[248, .5], [579, .5]]);

/* ---------- master ---------- */
let peak = 0;
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (DUR - i / SR) / .9);   // dissolvenza finale
  L[i] = Math.tanh((L[i] + rl[i] * 1.6) * .9) * fade;
  R[i] = Math.tanh((R[i] + rr[i] * 1.6) * .9) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = .89 / peak;   // circa -1 dBFS
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'build/audio.wav'), buf);
console.log('build/audio.wav scritto');
