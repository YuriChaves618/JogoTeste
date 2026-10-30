const bgm = $("#bgm");
bgm.volume = 0.75;
let ac, master, windG, nb, muted = false;
let mTimer = null;
function initAudio() {
  if (ac) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0.9;
  master.connect(ac.destination);
  nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = nb;
  src.loop = true;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 480;
  bp.Q.value = 0.7;
  windG = ac.createGain();
  windG.gain.value = 0;
  src.connect(bp);
  bp.connect(windG);
  windG.connect(master);
  src.start();
  const l1 = ac.createOscillator(), g1 = ac.createGain();
  l1.frequency.value = 0.13;
  g1.gain.value = 260;
  l1.connect(g1);
  g1.connect(bp.frequency);
  l1.start();
  const l2 = ac.createOscillator(), g2 = ac.createGain();
  l2.frequency.value = 0.21;
  g2.gain.value = 0.05;
  l2.connect(g2);
  g2.connect(windG.gain);
  l2.start();
}
function windUp(sec = 3) {
  if (ac) windG.gain.setTargetAtTime(0.17, ac.currentTime, sec / 3 / gameSpeed);
}
function windTo(v, sec = 3) {
  if (ac) windG.gain.setTargetAtTime(v, ac.currentTime, sec / 3 / gameSpeed);
}
function chirp() {
  if (!ac || muted || !wild) return;
  const t0 = ac.currentTime, n = 2 + Math.floor(Math.random() * 3);
  for (let k = 0; k < n; k++) {
    const o = ac.createOscillator(), g = ac.createGain(), t = t0 + k * 0.13, f = 2800 + Math.random() * 1400;
    o.type = "sine";
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 1.35, t + 0.07);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.022, t + 0.01);
    g.gain.exponentialRampToValueAtTime(5e-4, t + 0.09);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.11);
  }
}
function burst(freq, q, type, vol, dur, off = 0, rate = 1) {
  if (!ac || muted) return;
  const t = ac.currentTime + off, s = ac.createBufferSource();
  s.buffer = nb;
  s.playbackRate.value = rate;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 8e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(t, Math.random() * 1.5, dur + 0.05);
}
function stepSnd(v = 1) {
  burst(2200, 0.8, "bandpass", 0.22 * v, 0.2);
  for (let i = 0; i < 4; i++) burst(2500 + Math.random() * 3e3, 2, "bandpass", 0.1 * v, 0.04, 0.02 + Math.random() * 0.16);
}
function crack() {
  playFx("audio/galho.mp3", 0.85);
}
let owlEl = null;
function playFx(src, vol) {
  if (muted) return null;
  const el = new Audio(src);
  el.volume = Math.max(0, Math.min(1, vol));
  const p = el.play();
  if (p && p.catch) p.catch(() => {});
  return el;
}
function hoot(vol = 1, dist = 0) {
  if (muted || (owlEl && !owlEl.ended && !owlEl.paused)) return;
  owlEl = playFx("audio/coruja.mp3", 0.5 * vol * (1 - dist * 0.65));
}
function wingFlap(v = 1) {
  burst(260, 0.6, "lowpass", 0.1 * v, 0.16);
  burst(420, 0.8, "bandpass", 0.06 * v, 0.14, 0.2);
  burst(260, 0.6, "lowpass", 0.08 * v, 0.16, 0.42);
}
function sniffle() {
  burst(3000, 1.2, "bandpass", 0.07, 0.12);
  burst(2600, 1.2, "bandpass", 0.05, 0.16, 0.22);
}
function musicOut(secs = 2.5) {
  clearInterval(mTimer);
  const v0 = bgm.volume;
  let acc = 0, tl = performance.now();
  mTimer = setInterval(() => {
    const n = performance.now();
    acc += (n - tl) * gameSpeed;
    tl = n;
    const k = Math.min(1, acc / (secs * 1e3));
    bgm.volume = Math.max(0, v0 * (1 - k) * (1 - k));
    if (k >= 1) {
      clearInterval(mTimer);
      bgm.pause();
    }
  }, 60);
}
function musicStop() {
  clearInterval(mTimer);
  bgm.pause();
}
function musicIn(target = 0.6, secs = 18) {
  clearInterval(mTimer);
  bgm.currentTime = 0;
  bgm.volume = 0;
  bgm.muted = muted;
  const p = bgm.play();
  if (p && p.catch) p.catch(() => {
  });
  let acc = 0, tl = performance.now();
  mTimer = setInterval(() => {
    const n = performance.now();
    acc += (n - tl) * gameSpeed;
    tl = n;
    const k = Math.min(1, acc / (secs * 1e3));
    bgm.volume = target * k * k;
    if (k >= 1) clearInterval(mTimer);
  }, 100);
}
["img/btn_audio_on.webp", "img/btn_audio_off.webp"].forEach((u) => {
  new Image().src = u;
});
$("#mute").onclick = (e) => {
  e.stopPropagation();
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.9;
  $("#muteImg").src = muted ? "img/btn_audio_off.webp" : "img/btn_audio_on.webp";
  bgm.muted = muted;
};
