const boyEl = $("#boy");
const WALK = [1, 2, 3, 4, 5, 6, 7].map((n) => "walk_0" + n);
const TALK = ["talk_00", "talk_01", "talk_02", "talk_03", "talk_05"];
const JUMP = Array.from({ length: 24 }, (_, i) => "jump_" + pad(i));
const SAD_OPEN = new Set([1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 17]);
const SAD_FALA = Array.from({ length: 24 }, (_, i) => "sad_fala_" + pad(i + 1));
const SAD_MUDO = Array.from({ length: 24 }, (_, i) => (SAD_OPEN.has(i + 1) ? "sad_mudo_" : "sad_fala_") + pad(i + 1));
const NAMES = [
  "front",
  "front_fala",
  "front_sorriso",
  "front_sorriso_fala",
  "left",
  "tleft",
  "tleft_fala",
  "tfront",
  "tfront_fala",
  "enxuga",
  "medo",
  "salto",
  ...WALK,
  ...TALK,
  ...new Set([...SAD_FALA, ...SAD_MUDO])
];
const PAD = { walk: 0, talk: 5.3, jump: 2.2, sad: 2.5 };
const IMG = {};
const IMGJ = {};
const BG = new Image();
const BG2 = new Image();
const BG3 = new Image();
const BG4 = new Image();
const preload = (img, src) => new Promise((r) => {
  img.onload = r;
  img.onerror = r;
  img.src = src;
});
const mk = (n, parent, store, dir) => {
  const i = new Image();
  store[n] = i;
  parent.appendChild(i);
  return preload(i, dir + n + ".webp");
};
const OWLF = Array.from({ length: 16 }, () => new Image());
const ESQF = Array.from({ length: 17 }, () => new Image());
const animLoaded = Promise.all([
  ...OWLF.map((im, i) => preload(im, "img/animais/owl_" + pad(i) + ".webp")),
  ...ESQF.map((im, i) => preload(im, "img/animais/esq_" + pad(i) + ".webp"))
]);
const fontsReady = document.fonts ? Promise.race([
  Promise.all([
    document.fonts.load('500 1em "Cormorant Unicial"'),
    document.fonts.load('italic 1em "IM Fell English"')
  ]),
  wait(4e3)
]).catch(() => {
}) : Promise.resolve();
const IMGB = {};
const SIDE_W = 780;
const SIDE_H = 697;
const BEAST_SIDE = [
  { f: 0, dx: 0, lx: 651, ly: 480 },
  { f: 1, dx: -1, lx: 643, ly: 477 },
  { f: 2, dx: -2, lx: 656, ly: 466 },
  { f: 3, dx: -5, lx: 655, ly: 463 },
  { f: 4, dx: -8, lx: 659, ly: 472 },
  { f: 5, dx: -11, lx: 658, ly: 470 },
  { f: 6, dx: -15, lx: 643, ly: 474 },
  { f: 7, dx: -19, lx: 652, ly: 477 },
  { f: 8, dx: -20, lx: 664, ly: 475 },
  { f: 9, dx: -24, lx: 653, ly: 466 },
  { f: 10, dx: -27, lx: 652, ly: 471 },
  { f: 12, dx: -32, lx: 657, ly: 469 },
  { f: 13, dx: -35, lx: 664, ly: 461 },
  { f: 14, dx: -36, lx: 675, ly: 469 },
  { f: 16, dx: -41, lx: 652, ly: 477 },
  { f: 17, dx: -44, lx: 653, ly: 468 },
  { f: 18, dx: -47, lx: 666, ly: 462 },
  { f: 19, dx: -50, lx: 668, ly: 465 },
  { f: 20, dx: -53, lx: 666, ly: 475 },
  { f: 21, dx: -54, lx: 654, ly: 482 },
  { f: 22, dx: -56, lx: 633, ly: 471 }
];
const BEAST_S = BEAST_SIDE.map((fr) => "fera_s_" + pad(fr.f));
const BEAST_W = Array.from({ length: 6 }, (_, i) => "fera_w_" + pad(i));
const beastLoaded = Promise.all([...BEAST_S, ...BEAST_W, "fera_stand", "fera_point"].map((n) => mk(n, $("#beast"), IMGB, "img/feras/")));
const BUSHES = [0, 1, 2].map((i) => {
  const im = new Image();
  im.className = "bush";
  im.draggable = false;
  $("#bushes").appendChild(im);
  return preload(im, "img/cenario/bush_" + i + ".webp").then(() => im);
});
const bushLoaded = Promise.all(BUSHES);
const jumpLoaded = Promise.all(JUMP.map((n) => mk(n, $("#jbox"), IMGJ, "img/finn/")));
const loaded = Promise.all([
  preload(BG, "img/cenario/cenario.webp"),
  preload(BG2, "img/cenario/clareira.webp"),
  preload(BG3, "img/cenario/transicao.webp"),
  preload(BG4, "img/cenario/noite.webp"),
  animLoaded,
  beastLoaded,
  bushLoaded,
  preload(new Image(), "img/cenario/inicio.webp"),
  preload(new Image(), "img/cenario/fogueira.webp"),
  preload(new Image(), "img/cenario/moldura.webp"),
  fontsReady,
  ...NAMES.map((n) => mk(n, boyEl, IMG, "img/finn/"))
]);
