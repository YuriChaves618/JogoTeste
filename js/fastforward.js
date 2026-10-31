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
  ffBtn.blur();
});
$("#go").addEventListener("click", () => {
  ffBtn.style.display = "block";
});
