const $ = (s) => document.querySelector(s);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, "0");
const noTrans = (el, fn) => {
  el.style.transition = "none";
  fn();
  void el.offsetWidth;
  el.style.transition = "";
};
