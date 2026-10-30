const dlg = $("#dlg"), cap = $("#cap"), fade = $("#fade"), chapter = $("#chapter");
let typing = null, pend = null, finFn = null, curWho = "MENINO", guided = false;
let autoT = null, autoLen = 0;
// No modo acelerado, a fala avança sozinha depois de um instante (as escolhas NUNCA são puladas)
function scheduleAuto() {
  clearTimeout(autoT);
  if (gameSpeed <= 1 || !pend || typing) return;
  const p = pend;
  autoT = setTimeout(() => {
    if (pend === p && gameSpeed > 1) p();
  }, Math.min(1800, 350 + autoLen * 5));
}
const tip = dlg.querySelector(".tip");
tip.textContent = matchMedia("(hover: hover) and (pointer: fine)").matches
  ? "Clique no texto ou aperte Espaço para continuar"
  : "Toque no texto para continuar";
function say(text, who = curWho, swap) {
  return new Promise((res) => {
    dlg.style.display = "block";
    dlg.querySelector(".who").textContent = who;
    const tx = dlg.querySelector(".txt"), hint = dlg.querySelector(".hint");
    tx.textContent = "";
    hint.style.display = "none";
    let i = 0, acc = 0, t0 = performance.now();
    talking = true;
    typing = setInterval(() => {
      const now = performance.now();
      acc += (now - t0) * gameSpeed;
      t0 = now;
      const n = Math.floor(acc / 34);
      if (n <= i) return;
      i = n;
      tx.textContent = text.slice(0, i);
      if (swap && i >= swap.at) {
        dlg.querySelector(".who").textContent = swap.to;
        const f = swap.fn;
        swap = null;
        f && f();
      }
      if (i >= text.length) done();
    }, 17);
    function done() {
      clearInterval(typing);
      typing = null;
      tx.textContent = text;
      if (swap) {
        dlg.querySelector(".who").textContent = swap.to;
        const f = swap.fn;
        swap = null;
        f && f();
      }
      hint.style.display = "block";
      if (!guided) dlg.classList.add("guide");
      pend = () => {
        pend = null;
        clearTimeout(autoT);
        dlg.style.display = "none";
        talking = false;
        res();
      };
      autoLen = text.length;
      scheduleAuto();
    }
    finFn = done;
  });
}
function advance() {
  guided = true;
  dlg.classList.remove("guide");
  if (typing) {
    finFn && finFn();
    return;
  }
  if (pend) pend();
}
$("#dlg").addEventListener("click", advance);
addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    advance();
  }
});
async function narr(text, ms, on) {
  cap.textContent = text;
  cap.classList.add("on");
  on && on();
  await wait(ms);
  cap.classList.remove("on");
  await wait(900);
}
const choices = [];
function choose(opts, silentIdx = -1) {
  return new Promise((res) => {
    const box = $("#choice"), list = $("#opts");
    $("#chT").textContent = "— ESCOLHA —";
    $("#chP").style.display = "none";
    $("#again").style.display = "none";
    list.innerHTML = "";
    opts.forEach((t, i) => {
      const b = document.createElement("button");
      b.className = "opt" + (i === silentIdx ? " silent" : "");
      b.innerHTML = "<b>" + (i + 1) + "</b>";
      b.appendChild(document.createTextNode(t));
      b.onclick = () => {
        box.style.display = "none";
        list.innerHTML = "";
        res(i);
      };
      list.appendChild(b);
    });
    box.style.display = "flex";
  });
}
function endCard() {
  $("#opts").innerHTML = "";
  $("#chT").textContent = "— FIM DESTA PARTE —";
  const p = $("#chP");
  p.innerHTML = "A história continua em breve.<br>Cena em fase de teste.";
  p.style.display = "block";
  $("#again").style.display = "inline-block";
  $("#choice").style.display = "flex";
}
async function chapterCard() {
  await fontsReady;
  chapter.classList.add("on");
  await wait(5e3);
  chapter.classList.remove("on");
  musicOut();
  await wait(1800);
}
