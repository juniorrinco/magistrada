// Vitrine: dois vídeos e as 10 capturas. Legendas conforme SOBRE_O_JOGO_STEAM.md.
const CFG = Object.assign({ endpoint: "", mostrarContagem: false }, window.MAGISTRADA_CONFIG || {});
// Sem endereço configurado, usa o servidor.py que serve o próprio site (mesma origem, /api).
const API = CFG.endpoint || "/api";
const CAP = "midia/capturas/";
const itens = [
  { tipo: "video", src: "midia/video/apresentacao.mp4", capa: CAP + "02_sala_audiencia.png", leg: "Vídeo de apresentação (40 s)" },
  { tipo: "video", src: "midia/video/trailer_steam.mp4", capa: CAP + "08_menu_assombrado.png", leg: "Trailer (59 s) — contém um susto com aparição de rosto" },
  { tipo: "img", src: CAP + "01_menu.png", leg: "A sala de audiências espera por você." },
  { tipo: "img", src: CAP + "02_sala_audiencia.png", leg: "Presida a audiência: partes, testemunhas, promotoria e defesa." },
  { tipo: "img", src: CAP + "03_depoimento.png", leg: "Inquira com as suas palavras — a testemunha responde só o que sabe." },
  { tipo: "img", src: CAP + "04_autos_e_provas.png", leg: "Os autos, folha por folha." },
  { tipo: "img", src: CAP + "05_pergunta_livre.png", leg: "Escreva a pergunta; a IA local reconhece qual é." },
  { tipo: "img", src: CAP + "06_mapa_decisoes.png", leg: "O mapa do caminho que você traçou." },
  { tipo: "img", src: CAP + "07_sentenca_ou_resultado.png", leg: "Cada decisão, com o porquê." },
  { tipo: "img", src: CAP + "08_menu_assombrado.png", leg: "Alguém observa quem tenta burlar o processo." },
  { tipo: "img", src: CAP + "09_susto.png", leg: "A quarta parede não é tão firme quanto parece." },
  { tipo: "img", src: CAP + "10_simulado.png", leg: "Estude jogando: simulado por exame." },
];

const $ = (id) => document.getElementById(id);
const video = $("video"), imagem = $("imagem"), legenda = $("legenda"), tiras = $("tiras");
const lb = $("lightbox"), lbCorpo = $("lbCorpo"), lbLeg = $("lbLegenda");
let atual = 0, lbIdx = 0;

itens.forEach((it, i) => {
  const b = document.createElement("button");
  b.className = "tira";
  b.type = "button";
  b.setAttribute("role", "tab");
  b.setAttribute("aria-label", it.leg);
  const capa = it.tipo === "video" ? it.capa : it.src;
  b.innerHTML = '<img src="' + capa + '" alt="" loading="lazy">' + (it.tipo === "video" ? '<span class="play">▶</span>' : "");
  b.addEventListener("click", () => ir(i));
  tiras.appendChild(b);
});

function ir(i) {
  atual = (i + itens.length) % itens.length;
  const it = itens[atual];
  video.pause();
  if (it.tipo === "video") {
    imagem.hidden = true;
    video.src = it.src; video.poster = it.capa; video.hidden = false;
  } else {
    video.hidden = true; video.removeAttribute("src"); video.load();
    imagem.src = it.src; imagem.alt = it.leg; imagem.hidden = false;
  }
  legenda.textContent = it.leg;
  [...tiras.children].forEach((t, k) => {
    t.setAttribute("aria-selected", k === atual);
    if (k === atual) t.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  });
}

$("ant").addEventListener("click", () => ir(atual - 1));
$("prox").addEventListener("click", () => ir(atual + 1));
document.addEventListener("keydown", (e) => {
  if (!lb.hidden || e.target.closest("video, input, textarea, select")) return;
  if (e.key === "ArrowLeft") ir(atual - 1);
  if (e.key === "ArrowRight") ir(atual + 1);
});

// ---- Ampliar (foto e vídeo) ----
function abrirLb(i) {
  lb.classList.remove("avulsa");
  lbIdx = (i + itens.length) % itens.length;
  const it = itens[lbIdx];
  video.pause();
  lbCorpo.innerHTML = "";
  let el;
  if (it.tipo === "video") {
    el = document.createElement("video");
    el.controls = true; el.src = it.src; el.poster = it.capa;
    if (lbIdx === atual && video.currentTime) el.currentTime = video.currentTime;
    el.play().catch(() => {});
  } else {
    el = document.createElement("img");
    el.src = it.src; el.alt = it.leg;
  }
  lbCorpo.appendChild(el);
  lbLeg.textContent = it.leg;
  lb.hidden = false;
  document.body.style.overflow = "hidden";
  $("lbFechar").focus();
}
// Imagem avulsa (fora da vitrine), por exemplo o roadmap: sem setas.
function abrirAvulsa(src, leg) {
  video.pause();
  lbCorpo.innerHTML = "";
  const el = document.createElement("img");
  el.src = src; el.alt = leg;
  lbCorpo.appendChild(el);
  lbLeg.textContent = leg;
  lb.classList.add("avulsa");
  lb.hidden = false;
  document.body.style.overflow = "hidden";
  $("lbFechar").focus();
}
function fecharLb() {
  lb.classList.remove("avulsa");
  lb.hidden = true;
  lbCorpo.innerHTML = "";
  document.body.style.overflow = "";
}
$("ampliar").addEventListener("click", () => abrirLb(atual));
imagem.addEventListener("click", () => abrirLb(atual));
document.querySelectorAll(".abre").forEach((im) => im.addEventListener("click", () => abrirLb(+im.dataset.item)));
$("lbFechar").addEventListener("click", fecharLb);
lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbCorpo) fecharLb(); });
$("lbAnt").addEventListener("click", () => abrirLb(lbIdx - 1));
$("lbProx").addEventListener("click", () => abrirLb(lbIdx + 1));
document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") fecharLb();
  if (lb.classList.contains("avulsa")) return;
  if (e.key === "ArrowLeft") abrirLb(lbIdx - 1);
  if (e.key === "ArrowRight") abrirLb(lbIdx + 1);
});
const rm = document.querySelector(".roadmap-img");
if (rm) rm.addEventListener("click", (e) => { e.preventDefault(); abrirAvulsa(rm.getAttribute("href"), "Roadmap de atualizações de MAGISTRADA"); });

// ---- Comunicação com o servidor (servidor.py ou Google Apps Script) ----
// Texto simples evita a pré-verificação CORS; o servidor lê o corpo como JSON.
async function enviar(dados) {
  let r;
  try {
    r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(dados) });
  } catch (e) { throw new Error("rede"); }
  let j;
  try { j = await r.json(); } catch (e) { throw new Error("sem-servidor"); }
  if (!j.ok) throw new Error(j.erro || "falha");
  return j;
}
async function contagem() {
  const r = await fetch(API + "?acao=contagem");
  const j = await r.json();
  return j.desejos;
}

// ---- Lista de desejos ----
function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
let idAnonimo = ler("magistrada-id");
if (!idAnonimo) {
  const a = new Uint8Array(12);
  (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => (a[i] = Math.floor(Math.random() * 256)));
  idAnonimo = [...a].map((x) => x.toString(16).padStart(2, "0")).join("");
  guardar("magistrada-id", idAnonimo);
}
let marcado = ler("magistrada-desejo") === "1";
const botoes = [$("lista"), $("lista2")];
const rotulos = [$("contagem"), $("contagem2")];

function pintar() {
  botoes.forEach((b) => {
    b.setAttribute("aria-pressed", marcado);
    b.textContent = marcado ? "✓ Na sua lista de desejos" : "Adicionar à lista de desejos";
  });
}
async function atualizarContagem() {
  if (!CFG.mostrarContagem) return;
  try {
    const n = await contagem();
    const txt = n === 1 ? "1 pessoa já colocou MAGISTRADA na lista de desejos." : n + " pessoas já colocaram MAGISTRADA na lista de desejos.";
    rotulos.forEach((p) => { p.textContent = txt; p.hidden = false; });
  } catch (e) {}
}
botoes.forEach((b) => b.addEventListener("click", async () => {
  marcado = !marcado;
  guardar("magistrada-desejo", marcado ? "1" : "0");
  pintar();
  $("dica").hidden = !marcado;
  try { await enviar({ acao: "desejo", id: idAnonimo, ativo: marcado }); atualizarContagem(); } catch (e) {}
}));
pintar();
atualizarContagem();

// ---- Formulário de contato ----
const form = $("form"), status = $("status");
let ultimoEnvio = +ler("magistrada-ultimo-envio") || 0;
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(form);
  const dados = {
    acao: "contato",
    assunto: (f.get("assunto") || "").trim(),
    nome: (f.get("nome") || "").trim(),
    email: (f.get("email") || "").trim(),
    mensagem: (f.get("mensagem") || "").trim(),
    site: f.get("site") || "",
  };
  status.className = "status";
  if (!dados.assunto || !dados.nome || !dados.mensagem || !/^\S+@\S+\.\S+$/.test(dados.email)) {
    status.textContent = "Confira o assunto, o nome, o e-mail e a mensagem.";
    status.classList.add("erro");
    return;
  }
  if (Date.now() - ultimoEnvio < 30000) {
    status.textContent = "Aguarde alguns segundos antes de enviar outra mensagem.";
    status.classList.add("erro");
    return;
  }
  $("enviar").disabled = true;
  status.textContent = "Enviando…";
  try {
    await enviar(dados);
    ultimoEnvio = Date.now();
    guardar("magistrada-ultimo-envio", String(ultimoEnvio));
    form.reset();
    status.textContent = "Mensagem enviada. Obrigado! Respondo no e-mail que você informou.";
    status.classList.add("ok");
  } catch (err) {
    status.textContent = err.message === "sem-servidor"
      ? "O formulário ainda não está conectado a um servidor. Tente de novo mais tarde."
      : err.message === "limite"
      ? "Muitas mensagens em pouco tempo. Tente novamente mais tarde."
      : "Não consegui enviar agora. Tente de novo em instantes.";
    status.classList.add("erro");
  } finally {
    $("enviar").disabled = false;
  }
});

// ---- Avisos de atualização (e-mail) ----
function ligarForm(idForm, idStatus, idBotao, montar, aviso, okMsg) {
  const fm = $(idForm), st = $(idStatus);
  fm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (new FormData(fm).get("email") || "").trim();
    st.className = "status";
    if (!/^\S+@\S+\.\S+$/.test(email)) { st.textContent = "Confira o e-mail."; st.classList.add("erro"); return; }
    $(idBotao).disabled = true; st.textContent = "Enviando…";
    try {
      await enviar(montar(email));
      fm.reset(); st.textContent = okMsg; st.classList.add("ok");
      if (aviso) guardar("magistrada-avisos", "1");
    } catch (err) {
      st.textContent = err.message === "sem-servidor"
        ? "Ainda não está conectado a um servidor. Tente de novo mais tarde."
        : err.message === "limite" ? "Muitas tentativas. Tente novamente mais tarde." : "Não consegui agora. Tente de novo em instantes.";
      st.classList.add("erro");
    } finally { $(idBotao).disabled = false; }
  });
}
ligarForm("avisos", "status-avisos", "avisar", (email) => ({ acao: "inscrever", id: idAnonimo, email }), true,
  "Pronto! Você vai receber um aviso quando houver novidades.");
ligarForm("sair", "status-sair", "cancelar", (email) => ({ acao: "descadastrar", email }), false,
  "Pronto. Você não receberá mais avisos.");
$("abrir-sair").addEventListener("click", (e) => { e.preventDefault(); $("sair").hidden = false; $("sair").querySelector("input").focus(); });
if (marcado) $("dica").hidden = false;

ir(0);
