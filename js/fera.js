function anim(ms, fn) {
  return new Promise((res) => {
    let acc = 0, t0 = performance.now();
    const id = setInterval(() => {
      const n = performance.now();
      acc += (n - t0) * gameSpeed;
      t0 = n;
      const k = Math.min(1, acc / ms);
      fn(k);
      if (k >= 1) {
        clearInterval(id);
        res();
      }
    }, 16);
  });
}
const easeIO = (k) => k * k * (3 - 2 * k);
function stageShake() {
  const s = $("#stage");
  s.classList.remove("shake");
  void s.offsetWidth;
  s.classList.add("shake");
}

const fxLoops = [];
function mkLoop(src) {
  const a = new Audio(src);
  a.loop = true;
  a.preload = "auto";
  a.volume = 0;
  a.muted = muted;
  fxLoops.push(a);
  return a;
}
const songEl = mkLoop("audio/fera_canto.mp3");
const themeEl = mkLoop("audio/fera_tema.mp3?v=2");
function rampVol(el, to, secs) {
  clearInterval(el._t);
  const v0 = el.volume;
  let acc = 0, t0 = performance.now();
  if (to > 0 && el.paused) {
    el.muted = muted;
    const p = el.play();
    if (p && p.catch) p.catch(() => {});
  }
  el._t = setInterval(() => {
    const n = performance.now();
    acc += (n - t0) * gameSpeed;
    t0 = n;
    const k = Math.min(1, acc / (secs * 1e3));
    el.volume = Math.max(0, Math.min(1, v0 + (to - v0) * easeIO(k)));
    if (k >= 1) {
      clearInterval(el._t);
      if (to <= 0) el.pause();
    }
  }, 50);
  return new Promise((r) => after(r, secs * 1e3));
}
function hardStop(el) {
  clearInterval(el._t);
  el.volume = 0;
  el.pause();
  el.currentTime = 0;
}
function silenceAll() {
  hardStop(songEl);
  hardStop(themeEl);
  stopMenace();
  musicStop();
}
function startSong(from = 0.03) {
  songEl.currentTime = 0;
  songEl.volume = from;
  const p = songEl.play();
  if (p && p.catch) p.catch(() => {});
}
function rustle(n = 6) {
  for (let i = 0; i < n; i++) {
    burst(3800 + Math.random() * 2500, 0.9, "bandpass", 0.1, 0.12, i * 0.07 + Math.random() * 0.03);
    burst(1800, 0.7, "bandpass", 0.07, 0.1, i * 0.07 + 0.02);
  }
}
let menace = null;
function startMenace(secs = 6) {
  if (!ac || muted) return;
  stopMenace();
  const t = ac.currentTime, out = ac.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(0.5, t + secs);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(140, t);
  lp.frequency.exponentialRampToValueAtTime(1500, t + secs);
  lp.connect(out);
  out.connect(master);
  const oscs = [];
  [[55, "sawtooth"], [58.3, "sawtooth"], [82.4, "square"], [116.5, "sawtooth"]].forEach(([f, ty], i) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = ty;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * (i > 1 ? 1.5 : 1.12), t + secs);
    g.gain.value = i > 1 ? 0.12 : 0.3;
    o.connect(g);
    g.connect(lp);
    o.start(t);
    oscs.push(o);
  });
  const hi = ac.createOscillator(), hg = ac.createGain();
  hi.type = "sine";
  hi.frequency.setValueAtTime(520, t);
  hi.frequency.exponentialRampToValueAtTime(930, t + secs);
  hg.gain.setValueAtTime(0, t);
  hg.gain.linearRampToValueAtTime(0.09, t + secs);
  hi.connect(hg);
  hg.connect(out);
  hi.start(t);
  oscs.push(hi);
  let beat = 0, gap = 900;
  const hb = () => {
    if (!menace) return;
    burst(70, 1, "lowpass", 0.5, 0.22);
    burst(110, 1, "lowpass", 0.35, 0.18, 0.18);
    gap = Math.max(260, gap * 0.9);
    beat = setTimeout(hb, gap / gameSpeed);
  };
  menace = { out, oscs, stopBeat: () => clearTimeout(beat) };
  hb();
}
function stopMenace() {
  if (!menace) return;
  const m = menace;
  menace = null;
  m.stopBeat();
  try {
    m.out.gain.cancelScheduledValues(ac.currentTime);
    m.out.gain.setValueAtTime(0, ac.currentTime);
    m.oscs.forEach((o) => o.stop(ac.currentTime + 0.02));
  } catch (e) {}
}

async function finnStartle() {
  setPose("scared");
  await wait(110);
  setPose("jump");
  await anim(560, (k) => (boyJ = Math.sin(k * Math.PI) * CH * 0.26));
  boyJ = 0;
  setPose("scared");
  stageShake();
  await anim(420, (k) => (boyShake = Math.sin(k * 26) * 6 * (1 - k)));
  boyShake = 0;
}
async function lookAround(n = 3) {
  for (let i = 0; i < n; i++) {
    boyFlip = -boyFlip;
    await wait(360);
  }
  boyFlip = 1;
}
async function trembleLoop(ms) {
  await anim(ms, (k) => (boyShake = Math.sin(k * 60) * 3 * (1 - k * 0.4)));
  boyShake = 0;
}

const bEl = $("#beast"), bGlow = $("#bGlow");
const B = { ph: 0, v: 0, on: false, x: 0, state: "side", frame: 0, ft: 0, goal: null, arrived: false, turning: false, moving: false, sx: 1, k: 1, dy: 0, cur: null, lean: 0, shake: 0 };
const GL = { side: [0.899, 0.675, 1.119], walk: [0.759, 0.652, 0.898], stand: [0.88, 0.548, 0.658], point: [0.843, 0.625, 0.637] };
const WALK_SPEED = 0.14;
const WALK_STRIDE = 0.5;
const WALK_BRAKE = 0.5;
const WALK_SETTLE_FPS = 9;
const BEAST_REST = [2, 11, 15];
const BEAST_STEPS = [7, 17];
let BH = 360;
function beastLayout() {
  BH = Math.min(H * 0.5, W * 0.9);
  bEl.style.bottom = H * 0.17 + "px";
  for (const n in IMGB) {
    const i = IMGB[n];
    if (!i.naturalHeight) continue;
    i.style.height = BH + "px";
    i.style.width = BH * i.naturalWidth / i.naturalHeight + "px";
  }
  BEAST_SIDE.forEach((fr) => {
    const i = IMGB["fera_s_" + pad(fr.f)];
    if (i) i.style.transform = `translateX(calc(-50% + ${fr.dx * BH / SIDE_H}px))`;
  });
}
function beastLamp(lx, ly) {
  const u = BH / SIDE_H;
  bGlow.style.left = (lx - SIDE_W / 2) * u + "px";
  bGlow.style.bottom = (SIDE_H - ly) * u + "px";
}
function nearestRest(ph) {
  const N = BEAST_SIDE.length;
  let best = BEAST_REST[0], bd = N;
  for (const r of BEAST_REST) {
    const d = Math.min(Math.abs(r - ph), N - Math.abs(r - ph));
    if (d < bd) {
      bd = d;
      best = r;
    }
  }
  return best;
}
function bShow(imgName) {
  const el = IMGB[imgName];
  if (B.cur === el) return;
  if (B.cur) B.cur.style.display = "none";
  el.style.display = "block";
  B.cur = el;
  const kind = imgName.startsWith("fera_s") ? "side" : imgName.startsWith("fera_w") ? "walk" : imgName === "fera_point" ? "point" : "stand";
  const g = GL[kind], w = BH * g[2];
  bGlow.style.left = (g[0] - 0.5) * w + "px";
  bGlow.style.bottom = (1 - g[1]) * BH + "px";
  bGlow.style.width = bGlow.style.height = BH * 0.95 + "px";
  bEl.classList.toggle("fw", kind === "walk");
}
function beastStart() {
  beastLayout();
  B.on = true;
  B.state = "side";
  B.x = -BH * 0.62;
  B.goal = null;
  B.arrived = false;
  B.turning = false;
  B.frame = -1;
  B.ft = 0;
  B.ph = 0;
  B.v = 0;
  B.moving = false;
  B.sx = B.k = 1;
  B.dy = 0;
  bEl.style.display = "block";
  bShow("fera_s_00");
}
function beastHide() {
  B.on = false;
  bEl.style.display = "none";
  if (B.cur) B.cur.style.display = "none";
  B.cur = null;
}
function bGoTo(frac) {
  B.goal = W * frac;
  B.arrived = false;
  B.turning = false;
}
function beastTick(dt) {
  if (!B.on) return;
  let t = performance.now() / 1e3;
  if (B.state === "side") {
    const N = BEAST_SIDE.length;
    const left = B.goal === null ? 0 : B.goal - B.x;
    if (B.goal !== null && !B.turning && left > 0.5) {
      const brake = Math.min(1, left / (BH * WALK_BRAKE));
      const target = BH * WALK_SPEED * Math.max(0.2, brake);
      B.v += (target - B.v) * Math.min(1, dt * 2.5);
      const step = Math.min(B.v * dt, left);
      B.x += step;
      B.ph = (B.ph + step / (BH * WALK_STRIDE) * N) % N;
      B.moving = true;
    } else {
      B.moving = false;
      B.v = 0;
      if (B.goal !== null && !B.turning) {
        const to = nearestRest(B.ph);
        let d = to - B.ph;
        if (d > N / 2) d -= N;
        if (d < -N / 2) d += N;
        const adv = WALK_SETTLE_FPS * dt;
        if (Math.abs(d) <= adv) {
          B.ph = to;
          B.turning = true;
          beastTurnFront().then(() => (B.arrived = true));
        } else B.ph = (B.ph + Math.sign(d) * adv + N) % N;
      }
    }
    const idx = Math.floor(B.ph) % N;
    if (idx !== B.frame) {
      B.frame = idx;
      if (B.moving && BEAST_STEPS.includes(idx)) stepSnd(0.28);
    }
    if (!B.turning) {
      const fr = BEAST_SIDE[idx], nx = BEAST_SIDE[(idx + 1) % N], k = B.ph - Math.floor(B.ph);
      bShow("fera_s_" + pad(fr.f));
      beastLamp(fr.lx + (nx.lx - fr.lx) * k, fr.ly + (nx.ly - fr.ly) * k);
    }
  } else if (B.state === "walk") {
    B.ft += dt * 6.5;
    const f = Math.floor(B.ft) % 6;
    if (f !== B.frame) {
      B.frame = f;
      if (f === 0 || f === 3) stepSnd(0.5);
    }
    bShow("fera_w_" + pad(f));
  } else if (B.state === "point") bShow("fera_point");
  else bShow("fera_stand");
  const fl = 0.55 + Math.sin(t * 9) * 0.06 + Math.sin(t * 23) * 0.04;
  bGlow.style.opacity = fl;
  const sh = B.shake ? (Math.random() - 0.5) * B.shake : 0;
  bEl.style.transform = `translate(${B.x + sh}px, ${B.dy}px) scale(${B.sx * B.k}, ${B.k})`;
}
async function beastTurnFront() {
  await anim(200, (k) => (B.sx = 1 - 0.93 * easeIO(k)));
  B.state = "stand";
  bShow("fera_stand");
  await anim(220, (k) => (B.sx = 0.07 + 0.93 * easeIO(k)));
  B.sx = 1;
}
async function beastPoint() {
  B.state = "point";
  bShow("fera_point");
  stageShake();
  await anim(260, (k) => {
    B.k = 1 + 0.13 * Math.sin(k * Math.PI * 0.5);
    B.dy = BH * 0.04 * k;
  });
  await anim(320, (k) => {
    B.k = 1.13 - 0.05 * easeIO(k);
    B.dy = BH * 0.04;
  });
}
async function beastRage(ms) {
  B.shake = 7;
  await wait(ms);
  B.shake = 0;
}
async function beastCenter(ms = 900) {
  const x0 = B.x, x1 = W * 0.5;
  await anim(ms, (k) => (B.x = x0 + (x1 - x0) * easeIO(k)));
}
async function beastApproach(ms) {
  B.state = "walk";
  B.ft = 0;
  B.frame = -1;
  const y0 = B.dy, k0 = B.k;
  await anim(ms, (k) => {
    const e = Math.pow(k, 1.9);
    B.k = k0 + e * 3.1;
    B.dy = y0 + (B.k - 1) * BH * 0.78;
    B.shake = 2 + e * 7;
  });
  B.shake = 0;
}

const bushEls = () => [...document.querySelectorAll("#bushes .bush")];
const BUSH_X = [0.13, 0.64, 0.9];
function bushLayout() {
  const hs = [0.27, 0.31, 0.29];
  bushEls().forEach((b, i) => {
    if (!b.naturalHeight) return;
    const h = H * hs[i];
    b.style.height = h + "px";
    b.style.width = h * b.naturalWidth / b.naturalHeight + "px";
    b.style.left = W * BUSH_X[i] + "px";
    b.style.bottom = H * 0.045 + "px";
  });
}
function bushesShow(on) {
  bushLayout();
  $("#bushes").classList.toggle("on", on);
}
async function pickBush() {
  bushesShow(true);
  const els = bushEls();
  cap.textContent = "Escolha um arbusto para se esconder";
  cap.classList.add("on");
  const idx = await new Promise((res) => {
    els.forEach((b, i) => {
      b.classList.add("pick");
      b.onclick = () => res(i);
    });
  });
  cap.classList.remove("on");
  els.forEach((b, i) => {
    b.onclick = null;
    b.classList.remove("pick");
    if (i !== idx) b.classList.add("off");
  });
  tgtX = W * BUSH_X[idx];
  runArrived = false;
  runMode = true;
  setPose("walk");
  while (!runArrived) await wait(30);
  runMode = false;
  setPose("front");
  els[idx].classList.add("shake");
  playFx("audio/arbusto.mp3", 0.9);
  await anim(750, (k) => (hideK = easeIO(k)));
  await wait(500);
  els[idx].classList.remove("shake");
  bushesShow(false);
  $("#frame").classList.add("on");
  await wait(1400);
  return idx;
}
function resetFera() {
  silenceAll();
  boyJ = boyShake = hideK = 0;
  runMode = false;
  boyFlip = 1;
  boyEl.style.opacity = 1;
  beastHide();
  $("#bushes").classList.remove("on");
  $("#frame").classList.remove("on");
  bushEls().forEach((b) => b.classList.remove("pick", "off", "shake"));
  const c = $("#choice");
  c.classList.remove("lock", "snap");
  dlg.classList.remove("rage");
  endscr.classList.remove("on");
  eAgain.style.display = "none";
  for (const e of [eMain, eSub, eCred]) e.classList.remove("on");
  noTrans($("#fade"), () => {});
}
addEventListener("resize", () => {
  beastLayout();
  bushLayout();
});

const endscr = $("#endscr"), eMain = $("#eMain"), eSub = $("#eSub"), eCred = $("#eCred"), eAgain = $("#eAgain");
async function endText(main, sub, hold = 3500) {
  eMain.textContent = main;
  eSub.textContent = sub || "";
  eMain.classList.add("on");
  if (sub) eSub.classList.add("on");
  await wait(hold);
  eMain.classList.remove("on");
  eSub.classList.remove("on");
  await wait(1700);
}
async function endChapter(main, sub, hold = 4200) {
  const eLine = $("#eLine");
  eMain.textContent = main;
  eSub.textContent = sub || "";
  eMain.classList.add("chnum");
  eSub.classList.add("chsub");
  eLine.style.display = "block";
  eMain.classList.add("on");
  await wait(700);
  eLine.classList.add("on");
  await wait(800);
  if (sub) eSub.classList.add("on");
  await wait(hold);
  eMain.classList.remove("on");
  eSub.classList.remove("on");
  eLine.classList.remove("on");
  await wait(2300);
  eMain.classList.remove("chnum");
  eSub.classList.remove("chsub");
  eLine.style.display = "none";
}
async function endThanks(sub) {
  eMain.textContent = "OBRIGADO POR JOGAR!";
  eSub.textContent = sub || "";
  eMain.classList.add("on");
  await wait(1800);
  if (sub) eSub.classList.add("on");
  await wait(1400);
  eCred.classList.add("on");
  await wait(1600);
  eAgain.style.display = "inline-block";
}
eAgain.onclick = () => run();
async function blackout(ms) {
  fade.style.transition = `opacity ${ms / gameSpeed}ms ease-in`;
  fade.style.opacity = 1;
  await wait(ms);
  fade.style.transition = "";
  endscr.classList.add("on");
}
async function badEnding() {
  rampVol(songEl, 1, 3.2);
  startMenace(5);
  await wait(3600);
  rampVol(themeEl, 1, 4);
  rampVol(songEl, 0, 4);
  await blackout(1600);
  await wait(2600);
  await endText("Infelizmente, Finn não conseguiu escapar das garras da fera...", "", 4200);
  await endThanks();
}
