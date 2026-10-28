let started = false, jTimer = null, jc = null;
let autoMuted = false;
function playMusic() {
  if (started) return;
  bgm.muted = muted;
  const p = bgm.play();
  if (p && p.then) p.then(() => {
    $("#sHint").textContent = autoMuted ? "🔈 toque na tela para ativar o som" : "🎧 use fones de ouvido";
  }).catch(() => {
    bgm.muted = true;
    autoMuted = true;
    const q = bgm.play();
    if (q && q.catch) q.catch(() => {
    });
    $("#sHint").textContent = "🔈 toque na tela para ativar a trilha";
  });
}
const JSEQ = [...JUMP, JUMP[23], JUMP[23], JUMP[23]];
function startJump() {
  let k = 0;
  jTimer = setInterval(() => {
    const el = IMGJ[JSEQ[k++ % JSEQ.length]];
    if (jc === el) return;
    if (jc) jc.style.display = "none";
    el.style.display = "block";
    jc = el;
  }, 83);
}
const firstTouch = () => {
  if (started) return;
  if (autoMuted) {
    autoMuted = false;
    bgm.muted = muted;
    $("#sHint").textContent = "🎧 use fones de ouvido";
  }
  if (bgm.paused) playMusic();
};
const UNLOCK = ["pointerdown", "pointerup", "mousedown", "click", "touchstart", "touchend", "keydown"];
UNLOCK.forEach((ev) => addEventListener(ev, firstTouch, { passive: true, capture: true }));
bgm.addEventListener("playing", () => {
  if (!started) $("#sHint").textContent = "🎧 use fones de ouvido";
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !started && bgm.paused) playMusic();
});
playMusic();
let weakN = 0, weakT = 0;
["pointermove", "mousemove", "wheel", "touchmove", "scroll", "focus"].forEach((ev) => addEventListener(ev, () => {
  if (started || weakN > 25 || performance.now() - weakT < 500) return;
  weakT = performance.now();
  weakN++;
  if (bgm.paused) {
    playMusic();
    return;
  }
  if (autoMuted) {
    bgm.muted = muted;
    setTimeout(() => {
      if (bgm.paused || bgm.muted && !muted) {
        bgm.muted = true;
        const q = bgm.play();
        if (q && q.catch) q.catch(() => {
        });
      } else {
        autoMuted = false;
        $("#sHint").textContent = "🎧 use fones de ouvido";
      }
    }, 250);
  }
}, { passive: true, capture: true }));
bgm.addEventListener("canplay", () => {
  if (!started && bgm.paused) playMusic();
}, { once: true });
addEventListener("load", () => {
  if (!started && bgm.paused) playMusic();
});
addEventListener("pageshow", () => {
  if (!started && bgm.paused) playMusic();
});
jumpLoaded.then(() => {
  resize();
  startJump();
});
const go = $("#go");
go.onclick = () => {
  started = true;
  initAudio();
  if (ac && ac.state === "suspended") ac.resume();
  startLeafSys.stop(true);
  document.title = "Capítulo 1";
  $("#start").style.display = "none";
  run(true);
};
Promise.all([loaded, jumpLoaded, wait(2300)]).then(() => {
  resize();
  requestAnimationFrame(loop);
  startLeaves();
  const ld = $("#load");
  ld.style.opacity = 0;
  ld.style.pointerEvents = "none";
  setTimeout(() => {
    ld.style.display = "none";
    clearInterval(jTimer);
  }, 750);
});
