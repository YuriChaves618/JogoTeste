let wild = false, bT = 0, sT = 0;
const birds = [], sqs = [];
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
    if (q.st === "run") {
      q.x += q.dir * q.vx * dt;
      q.ph += dt * q.vx / q.s * 2.1;
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
function drawSquirrel(q) {
  const run = q.st === "run", ph = q.ph, now = performance.now() / 1e3;
  const C = { fur: "#7a5233", back: "#58391f", belly: "#cbb18a", tail: "#8c5c34", tailT: "#c49a62", dark: "#2c1d12", ear: "#3a2517", line: "rgba(28,18,10,.55)" };
  ctx.save();
  ctx.translate(q.x, q.y);
  ctx.scale(q.dir * q.s, q.s);
  ctx.globalAlpha = q.a * q.k;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const S = Math.sin(ph), Cc = Math.cos(ph);
  const hop = run ? Math.max(0, S) * 0.2 : 0;
  ctx.fillStyle = "rgba(8,12,8," + (0.3 - hop * 0.5) + ")";
  ctx.beginPath();
  ctx.ellipse(run ? 0 : -0.05, 0, 0.55 - hop * 0.6, 0.06, 0, 0, 6.283);
  ctx.fill();
  const leg = (x0, y0, x1, y1, w) => {
    ctx.strokeStyle = C.back;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };
  const head = (hx, hy, tilt) => {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(tilt);
    ctx.fillStyle = C.ear;
    ctx.beginPath();
    ctx.moveTo(-0.1, -0.1);
    ctx.quadraticCurveTo(-0.13, -0.3, -0.07, -0.42);
    ctx.quadraticCurveTo(0.02, -0.3, 0.06, -0.14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.fur;
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.19, 0.165, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = C.belly;
    ctx.beginPath();
    ctx.ellipse(0.16, 0.045, 0.115, 0.082, 0.18, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = C.dark;
    ctx.beginPath();
    ctx.arc(0.255, 0.02, 0.024, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = C.dark;
    ctx.beginPath();
    ctx.arc(0.07, -0.03, 0.034, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "rgba(255,250,235,.9)";
    ctx.beginPath();
    ctx.arc(0.08, -0.042, 0.011, 0, 6.283);
    ctx.fill();
    ctx.restore();
  };
  const tail = (bx, by, wave, up) => {
    const g = ctx.createLinearGradient(bx, by, bx - 0.5, by - 1.1 * up);
    g.addColorStop(0, C.tail);
    g.addColorStop(1, C.tailT);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.bezierCurveTo(bx - 0.4, by + 0.02 + wave * 0.3, bx - 0.62 - wave, by - 0.5 * up, bx - 0.4 - wave * 0.8, by - 1 * up);
    ctx.bezierCurveTo(bx - 0.28 - wave * 0.5, by - 1.28 * up, bx - 0.02, by - 1.16 * up, bx - 0.02, by - 0.86 * up);
    ctx.bezierCurveTo(bx - 0, by - 0.6 * up, bx + 0.04, by - 0.34 * up, bx + 0.14, by - 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(60,36,18,.5)";
    ctx.lineWidth = 0.022;
    ctx.stroke();
    ctx.strokeStyle = "rgba(224,190,140,.45)";
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(bx - 0.12, by - 0.1);
    ctx.bezierCurveTo(bx - 0.32, by - 0.18 * up, bx - 0.4 - wave, by - 0.62 * up, bx - 0.26 - wave * 0.7, by - 1.02 * up);
    ctx.stroke();
  };
  if (run) {
    const ext = Cc;
    ctx.translate(0, -hop);
    const wave = Math.sin(ph - 0.9) * 0.1;
    tail(-0.4, -0.46, wave, 0.85);
    leg(-0.28, -0.28, -0.34 - 0.3 * ext, -0.03 - Math.max(0, -S) * 0.12, 0.085);
    leg(0.3, -0.3, 0.34 + 0.3 * ext, -0.03 - Math.max(0, S) * 0.12, 0.07);
    ctx.save();
    ctx.rotate(-0.1 * ext);
    ctx.fillStyle = C.fur;
    ctx.beginPath();
    ctx.moveTo(-0.5, -0.3);
    ctx.bezierCurveTo(-0.54, -0.66, -0.1, -0.76, 0.2, -0.66);
    ctx.bezierCurveTo(0.44, -0.6, 0.56, -0.46, 0.5, -0.32);
    ctx.bezierCurveTo(0.42, -0.16, 0.1, -0.12, -0.16, -0.16);
    ctx.bezierCurveTo(-0.36, -0.17, -0.5, -0.18, -0.5, -0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 0.02;
    ctx.stroke();
    ctx.fillStyle = "rgba(70,44,24,.55)";
    ctx.beginPath();
    ctx.moveTo(-0.46, -0.4);
    ctx.bezierCurveTo(-0.46, -0.66, -0.1, -0.74, 0.2, -0.64);
    ctx.bezierCurveTo(0, -0.52, -0.3, -0.44, -0.46, -0.4);
    ctx.fill();
    ctx.fillStyle = C.belly;
    ctx.beginPath();
    ctx.ellipse(0.3, -0.25, 0.2, 0.075, 0.12, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = C.back;
    ctx.beginPath();
    ctx.ellipse(-0.3, -0.3, 0.2, 0.2, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
    head(0.5, -0.56, -0.06 * ext);
    leg(-0.18, -0.24, -0.18 + 0.3 * ext, -0.03 - Math.max(0, S) * 0.12, 0.09);
    leg(0.38, -0.26, 0.42 - 0.3 * ext, -0.03 - Math.max(0, -S) * 0.12, 0.075);
  } else {
    const nib = Math.sin(now * 14) * 0.012, sway = Math.sin(now * 1.6) * 0.08;
    tail(-0.26, -0.2, sway, 1.15);
    ctx.fillStyle = C.back;
    ctx.beginPath();
    ctx.ellipse(-0.1, -0.2, 0.3, 0.2, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = C.fur;
    ctx.beginPath();
    ctx.moveTo(-0.22, -0.2);
    ctx.bezierCurveTo(-0.3, -0.55, -0.12, -0.86, 0.1, -0.9);
    ctx.bezierCurveTo(0.3, -0.9, 0.36, -0.6, 0.3, -0.3);
    ctx.bezierCurveTo(0.26, -0.14, 0.02, -0.1, -0.22, -0.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 0.02;
    ctx.stroke();
    ctx.fillStyle = C.belly;
    ctx.beginPath();
    ctx.ellipse(0.22, -0.45, 0.1, 0.24, 0.08, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = C.back;
    ctx.beginPath();
    ctx.ellipse(0.12, -0.04, 0.2, 0.055, 0, 0, 6.283);
    ctx.fill();
    head(0.17, -0.98 + nib, 0.1 + nib * 2);
    ctx.fillStyle = C.back;
    ctx.beginPath();
    ctx.ellipse(0.3, -0.8 + nib * 3, 0.055, 0.04, 0.4, 0, 6.283);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0.24, -0.76 - nib * 3, 0.05, 0.038, 0.2, 0, 6.283);
    ctx.fill();
  }
  ctx.restore();
}
function drawWild() {
  if (!birds.length && !sqs.length) return;
  for (const q of sqs) drawSquirrel(q);
  for (const b of birds) drawBird(b);
  ctx.globalAlpha = 1;
}
