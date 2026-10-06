/* =====================================================================
   MODUL OBERFLÄCHE
   Alles, was HTML ist: Menüleiste, Inhaltsverzeichnis-Dialog, Regal-
   Text, Randnotizen der Kapitel, Schlussseite, Galerie-Laden und
   Lightbox. Erhält Aktionen (Buch öffnen, zurück, springen) von außen.
   ===================================================================== */
"use strict";
window.Chronik = window.Chronik || {};

window.Chronik.erstelleOberflaeche = function erstelleOberflaeche({ INHALT, aktionen }) {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const BUECHER = INHALT.buecher;

  /* ---------- Statische Texte ---------- */
  document.title = INHALT.verein;
  $("#marke").textContent = INHALT.verein;
  $("#intro-titel").textContent = INHALT.intro.ueberschrift;
  $("#intro-text").textContent = INHALT.intro.text;
  $("#hinweis-text").textContent = INHALT.intro.hinweis;
  $("#schluss-titel").textContent = INHALT.schluss.ueberschrift;
  $("#schluss-kontakt").innerHTML = INHALT.schluss.kontakt.map(z => `<span>${esc(z)}</span>`).join("<br>");
  $("#schluss-aktion").textContent = INHALT.schluss.aktion.text;
  $("#schluss-aktion").href = INHALT.schluss.aktion.link;
  $("#schluss-rechtliches").innerHTML = (INHALT.rechtliches || []).map(r => `<a href="${esc(r.link)}">${esc(r.text)}</a>`).join("");

  /* ---------- Buchauswahl: Tabs im Menü, Knöpfe am Regal, am Schluss ---------- */
  const buchtabs = $("#buchtabs"), buchliste = $("#buchliste"), schlussBuecher = $("#schluss-buecher");
  function buchKnopf(b, i) {
    const k = document.createElement("button"); k.type = "button";
    k.innerHTML = `<i style="background:${esc(b.farbe)}" aria-hidden="true"></i>${esc(b.titel)}`;
    k.addEventListener("click", () => aktionen.oeffneBuch(i)); return k;
  }
  BUECHER.forEach((b, i) => {
    const tab = document.createElement("button"); tab.type = "button"; tab.textContent = b.titel;
    tab.addEventListener("click", () => aktionen.oeffneBuch(i)); buchtabs.appendChild(tab);
    buchliste.appendChild(buchKnopf(b, i));
  });
  const tabs = Array.from(buchtabs.children);
  function markiereBuch(index) {                        // index oder null
    tabs.forEach((t, j) => t.classList.toggle("aktiv", j === index));
    $("#regal-knopf").classList.toggle("da", index !== null);
  }

  /* ---------- Inhaltsverzeichnis-Dialog (schmale Bildschirme) ---------- */
  const inhaltKnopf = $("#inhalt-knopf"), iv = $("#inhaltsverzeichnis"), ivListe = $("#iv-liste");
  function eintrag(jahr, titel, unter, klick) {
    const li = document.createElement("li");
    li.innerHTML = `<button type="button"><span class="jahr">${esc(jahr)}</span><span><span class="titel">${esc(titel)}</span>${unter ? `<span class="unter">${esc(unter)}</span>` : ""}</span></button>`;
    li.querySelector("button").addEventListener("click", () => { schliesseInhalt(); klick(); });
    return li;
  }
  function fuelleDialog() {
    const aktiv = aktionen.aktuellesBuch();
    ivListe.innerHTML = "";
    if (aktiv !== null) {
      const b = BUECHER[aktiv];
      ivListe.appendChild(Object.assign(document.createElement("h3"), { textContent: b.titel }));
      b.kapitel.forEach((k, i) => ivListe.appendChild(eintrag(k.jahr, k.titel, k.untertitel, () => aktionen.springeZuKapitel(i))));
      ivListe.appendChild(eintrag("", "Kontakt und weitere Bücher", "", () => aktionen.springeZumSchluss()));
    }
    ivListe.appendChild(Object.assign(document.createElement("h3"), { textContent: aktiv === null ? "Bücher im Regal" : "Andere Bücher" }));
    BUECHER.forEach((b, i) => { if (i !== aktiv) ivListe.appendChild(eintrag("", b.titel, b.untertitel || "", () => aktionen.oeffneBuch(i))); });
  }
  function oeffneInhalt() { fuelleDialog(); iv.classList.add("offen"); inhaltKnopf.setAttribute("aria-expanded", "true"); document.body.classList.add("gesperrt"); $("#iv-schliessen").focus(); }
  function schliesseInhalt() { iv.classList.remove("offen"); inhaltKnopf.setAttribute("aria-expanded", "false"); document.body.classList.remove("gesperrt"); }
  const inhaltOffen = () => iv.classList.contains("offen");
  inhaltKnopf.addEventListener("click", () => inhaltOffen() ? schliesseInhalt() : oeffneInhalt());
  $("#iv-schliessen").addEventListener("click", schliesseInhalt);
  $("#marke").addEventListener("click", () => { schliesseInhalt(); aktionen.zurueckInsRegal(); });
  $("#regal-knopf").addEventListener("click", () => aktionen.zurueckInsRegal());

  /* ---------- Randnotizen eines Buches ---------- */
  const panels = [], panelContainer = $("#kapitel-container");
  const inhaltsseite = $("#inhaltsseite"), isListe = $("#is-liste"), schluss = $("#schluss"), hinweis = $("#hinweis");
  const inhaltsPanel = inhaltsseite.querySelector(".kapitel-inhalt");

  function bauePanels(buch) {
    panelContainer.innerHTML = ""; panels.length = 0;
    buch.def.kapitel.forEach((k, i) => {
      const art = document.createElement("article");
      art.className = "ebene kapitel"; art.id = "kapitel-" + i;
      art.innerHTML = `<div class="kapitel-inhalt"><div class="kapitel-text">
        <p class="jahr">${esc(k.jahr)}</p>
        <h2>${esc(k.titel)}</h2>
        ${k.untertitel ? `<p class="untertitel">${esc(k.untertitel)}</p>` : ""}
        <p class="text">${esc(k.text)}</p>
        ${k.zitat ? `<blockquote>„${esc(k.zitat)}“${k.quelle ? `<footer>${esc(k.quelle)}</footer>` : ""}</blockquote>` : ""}
        <button class="galerie-knopf" type="button">Bilder ansehen</button>
      </div><i class="mehr" aria-hidden="true"></i></div>`;
      panelContainer.appendChild(art);
      panels.push(art.querySelector(".kapitel-inhalt"));
    });
    $("#is-buch").textContent = buch.def.titel + (buch.def.untertitel ? " – " + buch.def.untertitel : "");
    isListe.innerHTML = "";
    buch.def.kapitel.forEach((k, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<button type="button"><span class="jahr">${esc(k.jahr)}</span><span class="titel">${esc(k.titel)}</span></button>`;
      li.querySelector("button").addEventListener("click", () => aktionen.springeZuKapitel(i));
      isListe.appendChild(li);
    });
    schlussBuecher.innerHTML = "";
    BUECHER.forEach((b, i) => { if (i !== buch.index) schlussBuecher.appendChild(buchKnopf(b, i)); });
  }
  function leerePanels() { panelContainer.innerHTML = ""; panels.length = 0; }
  function setzeHinweis(text) { $("#hinweis-text").textContent = text; }

  /* ---------- Galerie: Bilderliste eines Ordners (PHP, sonst bilder.json) ---------- */
  const galerieCache = {};
  function titelAusDatei(name) {
    return name.replace(/\.[^.]+$/, "").replace(/^\d+[\s_-]*/, "").replace(/[_-]+/g, " ").replace(/^\w/, c => c.toUpperCase());
  }
  async function holeListe(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(url);
    const j = await r.json();
    if (!Array.isArray(j)) throw new Error("keine Liste");
    return j;
  }
  async function ladeGalerie(ordner) {
    if (galerieCache[ordner]) return galerieCache[ordner];
    if (window.CHRONIK_DEMO_BILDER && window.CHRONIK_DEMO_BILDER[ordner]) return (galerieCache[ordner] = window.CHRONIK_DEMO_BILDER[ordner]);
    let liste = [];
    try { liste = await holeListe(`bilder.php?ordner=${encodeURIComponent(ordner)}`); }
    catch (e) { try { liste = await holeListe(`bilder/${ordner}/bilder.json`); } catch (e2) { liste = []; } }
    const bilder = liste.map(e => typeof e === "string" ? { datei: e } : e).filter(e => e && e.datei)
      .map(e => ({ src: `bilder/${ordner}/${e.datei}`, titel: e.titel || titelAusDatei(e.datei) }));
    return (galerieCache[ordner] = bilder);
  }
  /* Galerieknöpfe eines Buches aktivieren.
     beiFoto(kapitelIndex, bilder): erstes Bild auf die Buchseite kleben
     beiKnopf(): Layout hat sich geändert (Knopf eingeblendet) */
  let galerien = {};
  function aktiviereGalerien(buch, beiFoto, beiKnopf) {
    galerien = {};
    buch.def.kapitel.forEach(async (k, i) => {
      if (!k.galerie) return;
      const bilder = await ladeGalerie(k.galerie);
      if (!bilder.length || aktionen.aktuellesBuch() !== buch.index || !panels[i]) return;
      galerien[i] = bilder;
      const knopf = panels[i].querySelector(".galerie-knopf");
      knopf.textContent = bilder.length === 1 ? "Bild ansehen" : `Bilder ansehen (${bilder.length})`;
      knopf.classList.add("da");
      knopf.addEventListener("click", () => oeffneGalerie(buch, i));
      if (beiKnopf) beiKnopf();
      beiFoto(i, bilder);
    });
  }
  function oeffneGalerie(buch, i) {
    if (!galerien[i]) return false;
    const k = buch.def.kapitel[i];
    oeffneLichtbox(galerien[i], `${k.jahr} – ${k.titel}`, 0); return true;
  }

  /* ---------- Lightbox ---------- */
  const lb = { el: $("#lichtbox"), bild: $("#lb-bild"), bu: $("#lb-bu"), zaehler: $("#lb-zaehler"), titel: $("#lb-titel"), streifen: $("#lb-streifen"), bilder: [], index: 0, zurueckZu: null };
  const lichtboxOffen = () => lb.el.classList.contains("offen");
  function zeigeBild(i) {
    const n = lb.bilder.length; if (!n) return;
    lb.index = (i + n) % n; const b = lb.bilder[lb.index];
    lb.bild.src = b.src; lb.bild.alt = b.titel || ""; lb.bu.textContent = b.titel || "";
    lb.zaehler.textContent = `${lb.index + 1} von ${n}`;
    Array.from(lb.streifen.children).forEach((k, j) => k.classList.toggle("aktiv", j === lb.index));
    const aktivK = lb.streifen.children[lb.index]; if (aktivK) aktivK.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }
  function oeffneLichtbox(bilder, titel, start) {
    lb.bilder = bilder; lb.titel.textContent = titel; lb.zurueckZu = document.activeElement;
    lb.streifen.innerHTML = "";
    bilder.forEach((b, j) => {
      const k = document.createElement("button"); k.type = "button"; k.setAttribute("aria-label", `Bild ${j + 1}`);
      const im = document.createElement("img"); im.src = b.src; im.alt = ""; im.loading = "lazy"; k.appendChild(im);
      k.addEventListener("click", () => zeigeBild(j)); lb.streifen.appendChild(k);
    });
    lb.el.classList.add("offen"); document.body.classList.add("gesperrt");
    zeigeBild(start || 0); $("#lb-zu").focus();
  }
  function schliesseLichtbox() {
    lb.el.classList.remove("offen"); document.body.classList.remove("gesperrt"); lb.bild.src = "";
    if (lb.zurueckZu && lb.zurueckZu.focus) lb.zurueckZu.focus();
  }
  $("#lb-zu").addEventListener("click", schliesseLichtbox);
  $("#lb-zurueck").addEventListener("click", () => zeigeBild(lb.index - 1));
  $("#lb-weiter").addEventListener("click", () => zeigeBild(lb.index + 1));
  lb.el.addEventListener("click", ev => { if (ev.target === lb.el || ev.target.classList.contains("buehne")) schliesseLichtbox(); });
  let wischStart = null;
  lb.el.addEventListener("touchstart", ev => { wischStart = ev.touches[0].clientX; }, { passive: true });
  lb.el.addEventListener("touchend", ev => {
    if (wischStart === null) return; const dx = ev.changedTouches[0].clientX - wischStart; wischStart = null;
    if (Math.abs(dx) > 50) zeigeBild(lb.index + (dx < 0 ? 1 : -1));
  });
  addEventListener("keydown", ev => {
    if (lichtboxOffen()) {
      if (ev.key === "Escape") schliesseLichtbox();
      else if (ev.key === "ArrowLeft") zeigeBild(lb.index - 1);
      else if (ev.key === "ArrowRight") zeigeBild(lb.index + 1);
    } else if (ev.key === "Escape") {
      if (inhaltOffen()) schliesseInhalt(); else aktionen.zurueckInsRegal();
    }
  });

  /* ---------- Fallback ohne WebGL: Inhalte als einfache Liste ---------- */
  function zeigeFallback() {
    const f = document.createElement("main"); f.className = "textseite fallback";
    f.innerHTML = `<h1>${esc(INHALT.verein)}</h1><p>${esc(INHALT.intro.text)}</p>` + BUECHER.map(b =>
      `<h2>${esc(b.titel)}${b.untertitel ? " – " + esc(b.untertitel) : ""}</h2>` +
      b.kapitel.map(k => `<h3>${esc(k.jahr)} · ${esc(k.titel)}</h3><p>${esc(k.text)}</p>`).join("")).join("") +
      `<address>${INHALT.schluss.kontakt.map(esc).join("<br>")}</address>`;
    document.body.appendChild(f); document.body.classList.add("ohne-3d");
  }

  return {
    panels, inhaltsseite, inhaltsPanel, schluss, hinweis,
    markiereBuch, bauePanels, leerePanels, setzeHinweis, aktiviereGalerien, oeffneGalerie, zeigeFallback,
    schliesseInhalt, lichtboxOffen, inhaltOffen,
  };
};
