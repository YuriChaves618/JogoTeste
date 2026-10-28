const cv = $("#cv"), ctx = cv.getContext("2d");
let W = 0, H = 0, dpr = 1, CH = 500;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth;
  H = innerHeight;
  cv.width = W * dpr;
  cv.height = H * dpr;
  CH = Math.min(H * 0.62, W * 1.4);
  for (const n of NAMES) {
    const i = IMG[n];
    if (!i || !i.naturalHeight) continue;
    i.style.height = CH * i.naturalHeight / 600 + "px";
    i.style.bottom = -(PAD[n.split("_")[0]] || 0) * CH / 600 + "px";
  }
  const JH = Math.min(H * 0.52, W * 1.1);
  for (const n of JUMP) {
    const i = IMGJ[n];
    if (!i || !i.naturalHeight) continue;
    i.style.height = JH * i.naturalHeight / 600 + "px";
    i.style.bottom = -PAD.jump * JH / 600 + "px";
  }
  $("#jbox").style.bottom = H * 0.3 + "px";
  boyEl.style.bottom = H * 0.1 + "px";
  sadV = SAD_GROUND * (CH / 600) / 0.8;
  if (pose === "sad") tSpeed = sadV;
}
addEventListener("resize", resize);
let sadMode = "", sadF = 0, sadT = 0;
let pose = "front", scroll = 0, speed = 0, tSpeed = 0, boyX = -999, tgtX = 0, frameT = 0, lastIdx = -1, walkV = 200, sadV = 70;
const SAD_TALK = [2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16, 17, 18];
const SAD_TALK_FPS = 7.5;
const SAD_MUTE = [1, 2, 3, 4, 5, 11, 12, 18, 19, 20, 21, 22, 23, 24];
const SAD_MUTE_FPS = 6;
const sadNear = (list, n) => {
  let bi = 0, bd = 99;
  list.forEach((f, i) => {
    const dd = Math.min(Math.abs(f - n), 24 - Math.abs(f - n));
    if (dd < bd) {
      bd = dd;
      bi = i;
    }
  });
  return bi;
};
const SAD_GROUND = 220;
let bgGo = false, bgMix = 0;
let cur = null, curSet = null, talking = false;
function show(el) {
  if (cur === el) return;
  if (cur) cur.style.display = "none";
  el.style.display = "block";
  cur = el;
}
function setPose(p) {
  sadMode = "";
  sadF = 0;
  sadT = 0;
  pose = p;
  tSpeed = p === "walk" ? walkV : p === "sad" ? sadV : 0;
  curSet = null;
  lastIdx = -1;
  frameT = 0;
  if (p === "front") show(IMG.front);
  if (p === "back") show(IMG.left);
  if (p === "smile") show(IMG.front_sorriso);
  if (p === "sad") tSpeed = sadV;
  if (p === "sadback") show(talking ? IMG.tleft_fala : IMG.tleft);
  if (p === "sadfront") show(talking ? IMG.tfront_fala : IMG.tfront);
}
let last = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1e3 || 0);
  last = t;
  speed += (tSpeed - speed) * Math.min(1, dt * 6);
  scroll += speed * dt;
  if (bgGo && bgMix < 1) bgMix = Math.min(1, bgMix + dt / 5);
  const walking = pose === "walk" || pose === "sad";
  if (walking && boyX < tgtX) boyX = Math.min(tgtX, boyX + speed * dt);
  if (pose === "walk") {
    const set = talking ? TALK : WALK;
    if (set !== curSet) {
      curSet = set;
      frameT = 0;
      lastIdx = -1;
    }
    frameT += dt * 8;
    const idx = Math.floor(frameT) % set.length;
    if (idx !== lastIdx) {
      show(IMG[set[idx]]);
      if (idx === 0 || idx === 3) stepSnd(0.5);
      lastIdx = idx;
    }
  } else if (pose === "sad") {
    const mode = talking ? "talk" : "mute";
    if (mode !== sadMode) {
      if (mode === "talk") sadT = sadNear(SAD_TALK, SAD_MUTE[Math.floor(sadF) % SAD_MUTE.length]);
      else if (sadMode === "talk") sadF = sadNear(SAD_MUTE, SAD_TALK[Math.floor(sadT) % SAD_TALK.length]);
      sadMode = mode;
      lastIdx = -1;
    }
    let idx, nm;
    if (mode === "talk") {
      sadT += dt * SAD_TALK_FPS;
      idx = Math.floor(sadT) % SAD_TALK.length;
      nm = "sad_fala_" + pad(SAD_TALK[idx]);
    } else {
      sadF += dt * SAD_MUTE_FPS;
      idx = Math.floor(sadF) % SAD_MUTE.length;
      const n = SAD_MUTE[idx];
      nm = (SAD_OPEN.has(n) ? "sad_mudo_" : "sad_fala_") + pad(n);
    }
    if (idx !== lastIdx) {
      show(IMG[nm]);
      if (mode === "talk" ? idx === 0 || idx === 4 || idx === 8 : idx === 0 || idx === 4 || idx === 7 || idx === 11) stepSnd(0.3);
      lastIdx = idx;
    }
  } else if (pose === "sadback") show(talking ? IMG.tleft_fala : IMG.tleft);
  else if (pose === "sadfront") show(talking ? IMG.tfront_fala : IMG.tfront);
  else if (pose === "smile") show(talking ? IMG.front_sorriso_fala : IMG.front_sorriso);
  else if (pose === "front") show(talking ? IMG.front_fala : IMG.front);
  boyEl.style.transform = `translateX(${boyX}px) scaleX(${walking ? -1 : 1})`;
  wildTick(dt);
  draw();
  requestAnimationFrame(loop);
}
function tile(img, alpha) {
  if (!img.naturalWidth) return;
  ctx.globalAlpha = alpha;
  const iw = H * img.naturalWidth / img.naturalHeight, o = scroll * 0.8, m0 = Math.floor(o / iw);
  let x = -(o - m0 * iw), m = m0;
  for (; x < W; x += iw, m++) {
    if (m % 2) {
      ctx.save();
      ctx.translate(x + iw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, iw + 1, H);
      ctx.restore();
    } else ctx.drawImage(img, x, 0, iw + 1, H);
  }
  ctx.globalAlpha = 1;
}
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#222a22";
  ctx.fillRect(0, 0, W, H);
  const e = bgMix * bgMix * (3 - 2 * bgMix);
  if (e < 1) tile(BG, 1);
  if (e > 0) tile(BG2, e);
  drawWild();
}
