function resetScene(keepMusic) {
  bgGo = false;
  bgMix = 0;
  wild = false;
  birds.length = 0;
  sqs.length = 0;
  sceneLeaves.stop(true);
  noTrans($("#tight"), () => $("#tight").classList.remove("on"));
  noTrans($("#mood"), () => $("#mood").classList.remove("on"));
  curWho = "MENINO";
  choices.length = 0;
  if (!keepMusic) musicStop();
  if (ac) windG.gain.setTargetAtTime(0, ac.currentTime, 0.1);
  clearInterval(typing);
  typing = null;
  pend = null;
  finFn = null;
  dlg.style.display = "none";
  talking = false;
}
function moodSad() {
  stopWild();
  sceneLeaves.start(Math.round(Math.min(26, 10 + W / 60)), true);
  $("#mood").classList.add("on");
  windTo(0.13, 5);
}
const OPT1 = ["“Não faço ideia. Você está perdido também?”", "“Como conseguiu se perder tão rápido?”", "Ficar em silêncio e observar o menino."];
const OPT2 = ["“Mas por que você fugiu? Sua mãe deve estar preocupada.”", "“Sinto muito. Você não deveria ter passado por isso.”", "“Por que ninguém tentou encontrar uma solução antes?”"];
const unq = (t) => t.replace(/[“”]/g, "");
async function run(fromStart) {
  resetScene(fromStart);
  $("#choice").style.display = "none";
  talking = false;
  fade.style.transition = "none";
  fade.style.opacity = 1;
  void fade.offsetWidth;
  fade.style.transition = "";
  speed = 0;
  scroll = 0;
  boyX = -CH * 0.4;
  tgtX = W * (W < 700 ? 0.5 : 0.42);
  setPose("front");
  await wait(600);
  await chapterCard();
  await narr("[ O som do vento entre as árvores ]", 2600, () => windUp(3));
  await narr("[ Galhos estalam ao longe ]", 2400, () => setTimeout(crack, 500));
  await narr("[ Passos lentos sobre folhas secas ]", 2200, () => {
    for (let i = 0; i < 4; i++) setTimeout(() => stepSnd(0.35), i * 520);
  });
  fade.style.opacity = 0;
  setPose("walk");
  await wait(4200);
  await say("— ...Alô?");
  await narr("Silêncio.", 2200);
  await say("— Tem alguém aí?");
  setPose("front");
  await wait(3600);
  await say("— Ah... que bom. Por um momento, achei que fosse o único perdido aqui.");
  setPose("walk");
  await wait(3e3);
  setPose("back");
  await wait(2800);
  setPose("walk");
  await wait(1600);
  await say("— Você sabe para onde estamos indo?");
  setPose("front");
  await wait(400);
  const c1 = await choose(OPT1, 2);
  choices.push(c1);
  bgGo = true;
  if (c1 < 2) await narr("— " + unq(OPT1[c1]), 2400);
  else {
    await narr("Silêncio.", 2200);
    await say("— Você não é muito de falar, né?");
  }
  await say("— Sabe... eu não costumo conversar com estranhos.");
  startWild();
  await say("— Minha mãe diz que isso é perigoso. Meu pai dizia a mesma coisa. Minha avó, então... ela provavelmente teria me dado uma bronca tão grande que eu ainda estaria ouvindo.");
  setPose("smile");
  await narr("Um pequeno sorriso aparece em seu rosto.", 2400);
  await narr("É a primeira vez que parece menos sozinho.", 2800);
  await say("— Mas você não parece muito perigoso. Pelo menos, ainda não.");
  await narr("O vento aumenta. As árvores parecem ficar mais próximas umas das outras.", 3800, () => {
    windTo(0.17, 2.5);
    $("#tight").classList.add("on");
  });
  const nm = "— Desculpa. Eu faço piadas quando estou nervoso. A propósito, meu nome é Finn.";
  await say(nm, curWho, { at: nm.indexOf("Finn") + 4, to: "FINN", fn: () => {
    curWho = "FINN";
    musicIn(0.6, 18);
  } });
  setPose("walk");
  await say("— Eu venho de um lugar chamado Vilarejo das Cinzas. Não é um nome muito bonito, eu sei.");
  await say("— Antes, chamavam de Vale Dourado. Dizem que, naquela época, os campos eram tão amarelos que pareciam pedaços do sol espalhados pela terra.");
  setPose("sadback");
  moodSad();
  await say("— E então tudo mudou…");
  await say("— Eu nasci depois da última colheita boa. Desde então, a terra só nos deu raízes pequenas, grãos podres e promessas de que o próximo ano seria melhor.");
  await say("— … talvez a causa de todo esse sofrimento tenha sido meu nascimento.");
  await narr("Ele aperta a alça da bolsa.", 2600);
  await say("— E sabe qual é a pior parte da fome?");
  setPose("sadfront");
  await say("— Não é a barriga doendo. A gente acaba se acostumando com ela.");
  await say("— É quando sua mãe diz que já comeu, mas você sabe que ela está mentindo.");
  setPose("sad");
  await say("— Uma noite antes de eu sair do meu vilarejo, ela dividiu uma batata em três pedaços. Deu o maior para mim e disse que não estava com fome.");
  await say("— Eu fingi acreditar. Acho que ela também fingiu acreditar que eu acreditei.");
  await say("— É estranho, não é? Às vezes, a gente ama tanto alguém que acaba ajudando essa pessoa a mentir para nós mesmos…");
  await wait(600);
  const c2 = await choose(OPT2);
  choices.push(c2);
  await narr("— " + unq(OPT2[c2]), 2600);
  endCard();
}
$("#again").onclick = () => run();
