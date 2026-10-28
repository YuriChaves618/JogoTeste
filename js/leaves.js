function LeafSys(cvs, o) {
  const g = cvs.getContext("2d");
  let L = [], on = false, last = 0, T = 0, w = 0, h = 0, d = 1, al = 1, to = 1;
  const size = () => {
    d = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    cvs.width = w * d;
    cvs.height = h * d;
  };
  function nf(init) {
    const z = Math.random(), k = w < 700 ? 0.8 : 1;
    return {
      x: init ? Math.random() * w : -40 - Math.random() * w * 0.3,
      y: Math.random() * h * 0.95,
      s: (7 + z * 11) * k,
      vx: (50 + z * 110) * (0.8 + Math.random() * 0.4) * (o.v || 1),
      fy: 10 + Math.random() * 25,
      ph: Math.random() * 6.28,
      fq: 0.8 + Math.random() * 1.4,
      rot: Math.random() * 6.28,
      spin: (Math.random() - 0.5) * 3.5,
      flip: Math.random() * 6.28,
      fs: 1.5 + Math.random() * 2.5,
      a: 0.5 + z * 0.45,
      c: o.cols[Math.floor(Math.random() * o.cols.length)]
    };
  }
  function tick(t) {
    if (!on) return;
    const dt = Math.min(0.05, (t - last) / 1e3 || 0);
    last = t;
    T += dt;
    al += (to - al) * Math.min(1, dt * 1.2);
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, w, h);
    if (to === 0 && al < 0.02) {
      on = false;
      return;
    }
    const gust = 1 + 0.55 * Math.sin(T * 0.45) + 0.3 * Math.sin(T * 1.25 + 1);
    for (const f of L) {
      f.x += f.vx * Math.max(0.25, gust) * dt;
      f.y += (Math.sin(T * f.fq + f.ph) * f.fy + 16 + gust * 6) * dt;
      f.rot += f.spin * dt * (0.5 + gust * 0.5);
      f.flip += f.fs * dt;
      if (f.x > w + 40 || f.y > h + 40) {
        Object.assign(f, nf(false));
        f.y = Math.random() * h * 0.8;
      }
      g.save();
      g.translate(f.x, f.y);
      g.rotate(f.rot);
      g.scale(1, Math.max(0.25, Math.abs(Math.cos(f.flip))));
      g.globalAlpha = f.a * al;
      g.fillStyle = f.c;
      const s = f.s;
      g.beginPath();
      g.moveTo(0, -s);
      g.bezierCurveTo(s * 0.75, -s * 0.5, s * 0.6, s * 0.55, 0, s);
      g.bezierCurveTo(-s * 0.6, s * 0.55, -s * 0.75, -s * 0.5, 0, -s);
      g.fill();
      g.strokeStyle = "rgba(30,25,10,.45)";
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(0, -s);
      g.lineTo(0, s * 1.25);
      g.stroke();
      g.restore();
    }
    requestAnimationFrame(tick);
  }
  addEventListener("resize", () => {
    if (on) size();
  });
  return {
    start(n, fade) {
      size();
      L = Array.from({ length: n }, () => nf(true));
      al = fade ? 0 : 1;
      to = 1;
      if (!on) {
        on = true;
        last = performance.now();
        requestAnimationFrame(tick);
      }
    },
    stop(now) {
      if (now) {
        on = false;
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, cvs.width, cvs.height);
      } else to = 0;
    }
  };
}
const startLeafSys = LeafSys($("#leaves"), {
  cols: ["#8a9a4a", "#a5a553", "#c2a24a", "#b9803c", "#9c5d32", "#6f8a3e", "#d1b45a", "#7d6b34"]
});
const sceneLeaves = LeafSys($("#wleaves"), {
  v: 1.15,
  cols: ["#6e6a4c", "#7d7355", "#5f5c44", "#6a5a40", "#847a58", "#55543d"]
});
const startLeaves = () => startLeafSys.start(Math.round(Math.min(60, 22 + innerWidth / 32)));
