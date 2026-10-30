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
const mk = (n, parent, store) => {
  const i = new Image();
  store[n] = i;
  parent.appendChild(i);
  return preload(i, "img/" + n + ".webp");
};
const OWLF = Array.from({ length: 16 }, () => new Image());
const ESQF = Array.from({ length: 17 }, () => new Image());
const animLoaded = Promise.all([
  ...OWLF.map((im, i) => preload(im, "img/owl_" + pad(i) + ".webp")),
  ...ESQF.map((im, i) => preload(im, "img/esq_" + pad(i) + ".webp"))
]);
const fontsReady = document.fonts ? Promise.race([
  Promise.all([
    document.fonts.load('500 1em "Cormorant Unicial"'),
    document.fonts.load('italic 1em "IM Fell English"')
  ]),
  wait(4e3)
]).catch(() => {
}) : Promise.resolve();
const jumpLoaded = Promise.all(JUMP.map((n) => mk(n, $("#jbox"), IMGJ)));
const loaded = Promise.all([
  preload(BG, "img/cenario.webp"),
  preload(BG2, "img/clareira.webp"),
  preload(BG3, "img/transicao.webp"),
  preload(BG4, "img/noite.webp"),
  animLoaded,
  preload(new Image(), "img/inicio.webp"),
  preload(new Image(), "img/fogueira.webp"),
  fontsReady,
  ...NAMES.map((n) => mk(n, boyEl, IMG))
]);
