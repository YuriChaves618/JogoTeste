// Botão de acelerar (canto superior esquerdo).
// Liga/desliga a velocidade do jogo. As escolhas NÃO são puladas: choose() continua
// esperando o clique do jogador, mesmo com o jogo acelerado.
const FAST_SPEED = 2.5;
const ffBtn = $("#ff");
function setFast(on) {
  gameSpeed = on ? FAST_SPEED : 1;
  document.documentElement.style.setProperty("--spd", gameSpeed);
  ffBtn.classList.toggle("on", on);
  ffBtn.setAttribute("aria-pressed", on);
  if (on) scheduleAuto();
  else clearTimeout(autoT);
}
ffBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  setFast(gameSpeed === 1);
  ffBtn.blur(); // evita que Espaço/Enter reativem o botão sem querer
});
$("#go").addEventListener("click", () => {
  ffBtn.style.display = "block";
});
