function resetScene(keepMusic) {
  bgGo = false;
  bgMix = 0;
  wild = false;
  birds.length = 0;
  sqs.length = 0;
  owls.length = 0;
  owlsOn = false;
  duskGo = false;
  duskMix = 0;
  duskAnchor = null;
  nightGo = false;
  nightMix = 0;
  noTrans($("#night"), () => $("#night").classList.remove("on"));
  resetFera();
  sceneLeaves.stop(true);
  noTrans($("#tight"), () => $("#tight").classList.remove("on"));
  noTrans($("#mood"), () => $("#mood").classList.remove("on"));
  curWho = "MENINO";
  choices.length = 0;
  if (!keepMusic) musicStop();
  if (ac) windG.gain.setTargetAtTime(0, ac.currentTime, 0.1);
  clearInterval(typing);
  clearTimeout(autoT);
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
const OPT2 = ["“Você está fazendo tudo isso pela sua mãe?”", "“Sinto muito. Você não deveria ter passado por isso.”", "“Por que ninguém tentou encontrar uma solução antes?”"];
const OPT3 = ["“Você não tem medo de encontrar essa fera?”", "“E se todas essas histórias forem apenas mentiras?”", "“Você não precisa provar que é corajoso para mim.”"];
const OPT4 = ["“Não... Eu pensei que tivesse sido você.”", "“Você também ouviu isso?”", "“Será que... é a fera?”"];
const OPT5 = ["“Fique parado. Talvez ela não consiga te ver.”", "“SE ESCONDA! RÁPIDO, ELA ESTÁ VINDO!”", "“Calma, Finn. Deve ser alguém tentando te assustar.”"];
const OPT6 = ["“Tenho certeza. Não precisa se preocupar, apenas fique aí.”", "“VOCÊ TEM RAZÃO! SE ESCONDA IMEDIATAMENTE!”"];
const RESP2 = [
  [
    "— Faço por ela, por meus irmãos e por aqueles que virão… minha mãe e meus irmãos são a única coisa que me restou.",
    "— Meu pai e meu irmão mais velho foram enviados para a guerra e meu Luke… meu tão amado Luke morreu de fome antes de eu partir… nunca sobrava comida para o cachorro…"
  ],
  ["— Desculpe… Não deveria ter te contado essa história triste… estou há tanto tempo sozinho que acabei falando demais…"],
  ["— Todos os homens estão na guerra faz anos e as mulheres trabalharam duro para manter todos vivos…"]
];
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
  await narr("[ Galhos estalam ao longe ]", 2400, () => after(crack, 500));
  await narr("[ Passos lentos sobre folhas secas ]", 2200, () => {
    for (let i = 0; i < 4; i++) after(() => stepSnd(0.35), i * 520);
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
  setPose("sadback");
  musicOut(11);
  windTo(0.17, 3);
  for (let i = 0; i < 3; i++) after(() => stepSnd(0.3), 400 + i * 620);
  await wait(2600);
  const c2 = await choose(OPT2);
  choices.push(c2);
  await narr("— " + unq(OPT2[c2]), 2600);
  for (const l of RESP2[c2]) await say(l);
  setPose("tears");
  after(sniffle, 500);
  await narr("Finn enxuga suas lágrimas.", 2800);
  setPose("walk");
  await wait(2400);
  await say("— Por isso eu decidi ir atrás do sábio da floresta. Se existe alguém que sabe como resolver o problema das plantações, é ele...");
  await say("— É minha única esperança.");
  await narr("", 2200);
  await say("— Ah, é verdade... Acho que ainda não te contei por que vim sozinho.");
  await say("— Com a guerra acontecendo e os soldados alemães invadindo tudo, ninguém mais tem coragem de sair do vilarejo.");
  await say("— E os poucos que se arriscaram a entrar nesta floresta... voltaram contando histórias estranhas.");
  tSpeed = walkV * 0.55;
  await narr("Finn diminui o passo.", 2400);
  await say("— Dizem que existe uma fera vivendo por aqui.");
  await narr("[ Um galho estala ao longe ]", 2400, () => after(crack, 500));
  setPose("front");
  await narr("Finn para por um instante.", 2400);
  await say("— Ninguém sabe ao certo o que ela é...");
  await say("— Alguns dizem que tem o corpo de um lobo... e o rosto de um homem.");
  await say("— Outros juram que ela nem sequer tem rosto.");
  await narr("", 2200);
  await say("— Mas são só histórias... certo?");
  await say("— Meu vizinho, o senhor Ambrósio, costumava dizer que a fera conseguia imitar a voz de alguém que você ama.");
  await narr("Finn fica em silêncio por um instante.", 2800);
  await say("— Ele também dizia que ela não precisava correr atrás de ninguém...");
  await say("— Bastava chamar pelo seu nome.");
  await say("— Ou cantar aquela melodia triste.");
  setPose("walk");
  duskGo = true;
  nightGo = true;
  $("#night").classList.add("on");
  startOwls();
  windTo(0.19, 3);
  await wait(2500);
  await say("— O senhor Ambrósio desapareceu há seis anos.");
  await narr("O vento atravessa os galhos.", 3800, () => windTo(0.22, 2));
  await say("— Depois disso, ninguém mais se atrevia a sair do vilarejo depois do pôr do sol.");
  await say("— Com o tempo, as pessoas começaram a ter medo até mesmo da luz do dia.");
  await say("— As carroças pararam de chegar. Os comerciantes deixaram de aparecer... e as estradas foram tomadas pelo mato.");
  await say("— E quando a fome chegou...");
  await narr("", 2200);
  await say("— As pessoas começaram a trancar as portas umas para as outras.");
  while (!nightArrived()) await wait(100);
  bushesShow(true);
  await wait(800);
  setPose("sadfront");
  await wait(1400);
  await say("— Eu sei o que você deve estar pensando...");
  await say("— Que sou um idiota por ter vindo até aqui.");
  await say("— Talvez eu seja.");
  await narr("Finn abaixa a cabeça e observa as próprias mãos.", 2800);
  await say("— Mas ficar lá também dava medo.");
  await say("— Toda manhã, eu acordava pensando em quem seria o próximo a não conseguir se levantar da cama.");
  await say("— E eu não queria descobrir.");
  await wait(600);
  await interruptChoice(OPT3);
  await finnStartle();
  await wait(500);
  await say("— A-Ah! O que foi isso?!");
  await narr("Finn olha rapidamente ao redor.", 2300, () => lookAround(5));
  await say("— Espera...");
  await say("— Foi você que quebrou aquele galho?");

  const c4 = await choose(OPT4);
  choices.push(c4);
  await narr("— " + unq(OPT4[c4]), 2400);
  setPose("sadfront");
  stopOwls();
  windTo(0.01, 2.5);
  await wait(3200);
  startSong(0.02);
  rampVol(songEl, 0.9, 40);
  await wait(4200);
  setPose("scared");
  trembleLoop(1600);
  await say("— Não...");
  await say("— Não, não, não...");
  await narr("Finn fica paralisado, olhando para a escuridão.", 3200);
  await say("— Essa melodia...");
  await say("— É ela...");
  dlg.classList.add("rage");
  await say("— É A FERA!");
  dlg.classList.remove("rage");
  await narr("Finn olha desesperadamente para o jogador.", 2800);
  await say("— Rápido! O que eu faço?!");
  await say("— Ela está vindo para cá!");

  const c5 = await choose(OPT5);
  choices.push(c5);
  await narr("— " + unq(OPT5[c5]), 2400);
  if (c5 === 0) {
    await say("— Ficar parado...?");
    await say("— T-Tudo bem...");
    await say("— Eu confio em você.");
    await badEnding();
    return;
  }
  if (c5 === 1) {
    await say("— Me esconder?!");
    await narr("Finn olha desesperadamente para os lados.", 2300, () => lookAround(5));
    await say("— Certo! Certo!");
    await say("— Mas onde?!");
    await say("— Eu não sei para onde ir!");
  } else {
    await say("— Alguém tentando me assustar...?");
    await narr("Finn parece hesitar.", 2400);
    await say("— Você tem certeza?");
    await say("— Quem estaria andando por uma floresta a esta hora da noite?");
    await say("— E por que estaria cantando uma melodia tão... triste?");
    await narr("Finn olha novamente para a escuridão.", 2600, () => lookAround(1));
    await say("— Eu não gosto disso...");
    await say("— Não gosto nem um pouco.");
    const c6 = await choose(OPT6);
    choices.push(c6);
    await narr("— " + unq(OPT6[c6]), 2400);
    if (c6 === 0) {
      await say("— Se você diz...");
      await say("— Eu vou confiar em você.");
      await badEnding();
      return;
    }
    await say("— E-Eu sabia que tinha alguma coisa errada!");
    await say("— Mas onde eu me escondo?!");
  }
  await pickBush();
  await cena4();
}
async function shout(t, who = "FERA") {
  dlg.classList.add("rage");
  B.shake = 5;
  await say(t, who);
}
function calm() {
  dlg.classList.remove("rage");
  B.shake = 0;
}
async function cena4() {
  await wait(2800);
  rampVol(songEl, 0, 9);
  await wait(3500);
  rampVol(themeEl, 0.6, 9);
  await wait(3200);
  beastStart();
  bGoTo(0.5);
  await wait(2200);
  await say("— Hmmm...", "FERA");
  await narr("A criatura caminha lentamente pela floresta.", 3200);
  await say("— Que curioso...", "FERA");
  await say("— Eu poderia jurar que senti alguém por aqui.", "FERA");
  await say("— Um cheiro estranho...", "FERA");
  await say("— Um invasor...", "FERA");
  await say("— Mas onde será que ele foi?", "FERA");
  await say("— Não é educado entrar na casa dos outros sem ser convidado...", "FERA");
  await narr("", 2400);
  await say("— Principalmente... na minha.", "FERA");

  while (!B.arrived) await wait(100);
  await wait(1000);
  rampVol(themeEl, 0.16, 1.2);
  await wait(900);
  await beastPoint();
  await say("— Espere...", "FERA");
  await say("— O que...?", "FERA");
  await narr("", 2600);
  await shout("— VOCÊ...");
  await shout("— FOI VOCÊ!");
  beastPoint();
  await shout("— FOI VOCÊ QUEM ENTROU NA MINHA FLORESTA!");
  calm();
  rampVol(themeEl, 0.5, 4);
  await narr("Sua expressão muda para uma de fúria.", 2600);
  await say("— Mas... espere um instante...", "FERA");
  await say("— O que é isso que você está vestindo?", "FERA");
  await narr("Ela observa atentamente na sua direção.", 2400);
  await say("— Não...", "FERA");
  await say("— Não pode ser...", "FERA");
  await say("— Esse tecido...", "FERA");
  await say("— Essa aparência...", "FERA");
  await narr("Sua voz começa a demonstrar uma mistura de incredulidade e ódio.", 3400);
  await shout("— QUEM TE DEU ESSE MANTO...");
  await shout("— ESSE MANTO NÃO PERTENCE A VOCÊ!");
  calm();
  await narr("Ela aponta novamente na sua direção.", 2200, () => beastPoint());
  await shout("— CRIATURA IMUNDA!");
  await shout("— COMO OUSA?!");
  beastPoint();
  await shout("— DEVOLVA!");
  await shout("— DEVOLVA O QUE É MEU!");
  await shout("— DEVOLVA!");
  beastPoint();
  await shout("— DEVOLVA!!");
  await shout("— DEVOLVAAAA!!!");
  calm();
  await cena5();
}
async function cena5() {
  await beastCenter(700);
  rampVol(themeEl, 1, 11);
  startMenace(11);
  const ap = beastApproach(11500);
  await wait(10000);
  await blackout(1500);
  await ap;
  beastHide();
  await wait(2800);
  await endText("CONTINUA...", "", 3800);
  await endChapter("Capítulo II", "Em breve...", 4200);
  await endThanks("Esta história está apenas começando...");
}
$("#again").onclick = () => run();
