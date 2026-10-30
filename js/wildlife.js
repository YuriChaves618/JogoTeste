let wild = false, bT = 0, sT = 0;
const birds = [], sqs = [], owls = [];
let owlsOn = false, oT = 0, hT = 0;
function startOwls() {
  owlsOn = true;
  oT = 2.5;
  hT = 1.2;
}
function stopOwls() {
  owlsOn = false;
}
function spawnOwl() {
  const dir = Math.random() < 0.5 ? 1 : -1, z = Math.random(), s = H * (0.045 + z * 0.04);
  const y0 = H * (0.1 + Math.random() * 0.28);
  owls.push({
    dir, s, z,
    x: dir > 0 ? -s * 2 : W + s * 2,
    y0, y: y0,
    vx: (55 + Math.random() * 45) * (H / 800) * (0.8 + z * 0.5),
    fi: Math.random() * 16,
    fr: 10 + Math.random() * 2,
    t: Math.random() * 6,
    wf: 0.5 + Math.random() * 0.5,
    wa: s * (0.5 + Math.random() * 0.6),
    glide: Math.random() < 0.4 ? 1 : 0,
    gT: 1.2 + Math.random() * 2,
    a: 0.8,
    k: 1
  });
}
function startWild() {
  wild = true;
  bT = 0.8;
  sT = 2.6;
}
function stopWild() {
  wild = false;
}
function spawnBirds() {
  const n = 1 + Math.floor(Math.random() * 3), dir = Math.random() < 0.5 ? 1 : -1, y0 = H * (0.1 + Math.random() * 0.3), s = H / 800 * (13 + Math.random() * 10);
  const vx = (95 + Math.random() * 80) * (H / 800);
  for (let i = 0; i < n; i++) birds.push({
    x: dir > 0 ? -60 - i * (s * 3.2 + Math.random() * 22) : W + 60 + i * (s * 3.2 + Math.random() * 22),
    y0: y0 + (i % 2 ? 1 : -1) * s * i * 0.9,
    dir,
    vx: vx * (0.94 + Math.random() * 0.12),
    s,
    ph: Math.random() * 6.28,
    fr: 7 + Math.random() * 3,
    t: Math.random() * 6,
    wf: 0.8 + Math.random() * 0.8,
    wa: s * (0.7 + Math.random() * 0.8),
    a: 0.55 + Math.random() * 0.2,
    k: 1,
    y: y0
  });
  setTimeout(chirp, 300 + Math.random() * 900);
}
function spawnSquirrel() {
  const dir = Math.random() < 0.5 ? 1 : -1, z = Math.random(), s = H * (0.05 + z * 0.035);
  sqs.push({
    dir,
    s,
    x: dir > 0 ? -s * 1.6 : W + s * 1.6,
    y: H * (0.745 + z * 0.13),
    vx: s * (4 + Math.random() * 1.6),
    ph: 0,
    fi: 0,
    lst: "run",
    st: "run",
    tp: 0,
    paused: Math.random() < 0.65,
    px: W * (0.25 + Math.random() * 0.5),
    a: 0.9,
    k: 1
  });
}
function wildTick(dt) {
  const par = speed * 0.8 * dt;
  if (owlsOn) {
    oT -= dt;
    if (oT <= 0 && owls.length < 1) {
      spawnOwl();
      if (Math.random() < 0.7) setTimeout(() => hoot(0.55, 0.3 + Math.random() * 0.4), 400 + Math.random() * 600);
      oT = 12 + Math.random() * 8;
    }
    hT -= dt;
    if (hT <= 0) {
      hoot(0.5, 0.55 + Math.random() * 0.4);
      hT = 7 + Math.random() * 8;
    }
  }
  for (let i = owls.length - 1; i >= 0; i--) {
    const o = owls[i];
    o.t += dt;
    o.gT -= dt;
    if (o.gT <= 0) {
      o.glide = o.glide ? 0 : 1;
      o.gT = o.glide ? 1 + Math.random() * 1.6 : 1.4 + Math.random() * 2.2;
    }
    o.fi += dt * o.fr;
    o.x += o.dir * o.vx * dt - par * 0.3;
    o.y = o.y0 + Math.sin(o.t * o.wf) * o.wa;
    if (!owlsOn) o.k = Math.max(0, o.k - dt * 0.8);
    if (o.k <= 0.01 || o.x < -o.s * 4 || o.x > W + o.s * 4) owls.splice(i, 1);
  }
  if (wild) {
    bT -= dt;
    if (bT <= 0) {
      spawnBirds();
      bT = 3.5 + Math.random() * 4.5;
    }
    sT -= dt;
    if (sT <= 0 && sqs.length < 2) {
      spawnSquirrel();
      sT = 6 + Math.random() * 6;
    }
  }
  for (let i = birds.length - 1; i >= 0; i--) {
    const b = birds[i];
    b.t += dt;
    b.ph += dt * b.fr;
    b.x += b.dir * b.vx * dt - par * 0.3;
    b.y = b.y0 + Math.sin(b.t * b.wf) * b.wa;
    if (!wild) b.k = Math.max(0, b.k - dt * 1.1);
    if (b.k <= 0.01 || b.x < -120 || b.x > W + 120) birds.splice(i, 1);
  }
  for (let i = sqs.length - 1; i >= 0; i--) {
    const q = sqs[i];
    if (q.lst !== q.st) {
      q.lst = q.st;
      q.fi = 0;
    }
    if (q.st !== "run") q.fi += dt * 5;
    if (q.st === "run") {
      q.x += q.dir * q.vx * dt;
      q.fi += dt * 13;
      if (q.paused && (q.dir > 0 && q.x > q.px || q.dir < 0 && q.x < q.px)) {
        q.st = "pause";
        q.tp = 0.9 + Math.random() * 0.9;
        q.paused = false;
      }
    } else {
      q.tp -= dt;
      if (q.tp <= 0) q.st = "run";
    }
    q.x -= par;
    if (!wild) q.k = Math.max(0, q.k - dt * 1.1);
    if (q.k <= 0.01 || q.x < -q.s * 3 || q.x > W + q.s * 3) sqs.splice(i, 1);
  }
}
function drawBird(b) {
  const s = b.s, ang = Math.sin(b.ph) * 0.95;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(b.dir, 1);
  ctx.rotate(Math.sin(b.t * 1.7) * 0.08);
  ctx.globalAlpha = b.a * b.k;
  ctx.fillStyle = "#10150f";
  for (const side of [-1, 1]) {
    const tx = side * s * Math.cos(ang * 0.55), ty = -Math.sin(ang) * s * 0.95;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * s * 0.55, ty * 0.55 - s * 0.3, tx, ty);
    ctx.quadraticCurveTo(side * s * 0.5, ty * 0.4 + s * 0.04, 0, s * 0.14);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.13, s * 0.24, 0, 0, 6.283);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -s * 0.2, s * 0.1, 0, 6.283);
  ctx.fill();
  ctx.restore();
}
const SQ_IDLE = [11, 12, 13, 14, 15, 16, 15, 14, 13, 12];
function drawSquirrel(q) {
  const run = q.st === "run";
  const fr = run ? Math.floor(q.fi) % 11 : SQ_IDLE[Math.floor(q.fi) % SQ_IDLE.length];
  const img = ESQF[fr];
  if (!img || !img.naturalWidth) return;
  const hh = q.s * 1.5, ww = hh * img.naturalWidth / img.naturalHeight;
  ctx.save();
  ctx.translate(q.x, q.y);
  ctx.globalAlpha = q.a * q.k;
  ctx.fillStyle = "rgba(8,12,8,.28)";
  ctx.beginPath();
  ctx.ellipse(0, 0, ww * 0.34, hh * 0.05, 0, 0, 6.283);
  ctx.fill();
  ctx.scale(q.dir > 0 ? -1 : 1, 1);
  ctx.drawImage(img, -ww / 2, -hh, ww, hh);
  ctx.restore();
}
function drawOwl(o) {
  const img = OWLF[Math.floor(o.fi) % OWLF.length];
  if (!img || !img.naturalWidth) return;
  const ww = o.s * 2.5, hh = ww * img.naturalHeight / img.naturalWidth;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(Math.sin(o.t * o.wf) * 0.05 * o.dir);
  ctx.scale(o.dir > 0 ? 1 : -1, 1);
  ctx.globalAlpha = o.a * o.k * Math.min(1, 0.25 + duskMix * 1.4);
  ctx.drawImage(img, -ww / 2, -hh / 2, ww, hh);
  ctx.restore();
}
function drawWild() {
  if (!birds.length && !sqs.length && !owls.length) return;
  for (const o of owls) drawOwl(o);
  for (const q of sqs) drawSquirrel(q);
  for (const b of birds) drawBird(b);
  ctx.globalAlpha = 1;
}
