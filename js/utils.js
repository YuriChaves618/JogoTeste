const $ = (s) => document.querySelector(s);
// Velocidade global do jogo: 1 = normal, >1 = acelerado (botão ⏩)
let gameSpeed = 1;
const waiters = [];
let waitLast = performance.now();
setInterval(() => {
  const now = performance.now(), d = (now - waitLast) * gameSpeed;
  waitLast = now;
  for (let i = 0; i < waiters.length;) {
    const w = waiters[i];
    w.left -= d;
    if (w.left <= 0) {
      waiters.splice(i, 1);
      w.r();
    } else i++;
  }
}, 16);
// Espera em "tempo de jogo": encurta na hora se a velocidade mudar no meio da espera
const wait = (ms) => new Promise((r) => waiters.push({ left: ms, r }));
const after = (fn, ms) => wait(ms).then(fn);
const pad = (n) => String(n).padStart(2, "0");
const noTrans = (el, fn) => {
  el.style.transition = "none";
  fn();
  void el.offsetWidth;
  el.style.transition = "";
};
