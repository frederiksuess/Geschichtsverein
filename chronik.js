/* =====================================================================
   HAUPTPROGRAMM
   Verbindet die Module: Szene (Raum, Kamera), Buchfabrik (3D-Bücher),
   Texturen (Seiten) und Oberfläche (HTML). Steuert die Zustände
   regal → auszug → lesen → rueckgabe → regal und die Scroll-Zeitleiste
   des aufgeschlagenen Buches.
   Für Textänderungen ist nur js/inhalt.js anzufassen.
   ===================================================================== */
"use strict";
(async function start() {
  const { INHALT, Chronik } = window;
  const $ = (s) => document.querySelector(s);
  const reduzierteBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobil = Math.min(innerWidth, innerHeight) < 600 || /Android|iPhone|iPad/i.test(navigator.userAgent);

  /* ============================ Konfiguration ============================
     Alle Positionen in Szeneneinheiten (Seitenbreite = 1). Die Lese-
     position liegt deutlich vor dem Regal (Buchrücken bei z ≈ 0), damit
     das aufgeschlagene Buch nie in die Regalbretter ragt.            */
  const KONFIG = {
    kamera: {
      regal: { kam: { x: 0.15, y: 0.15, z: 3.6 }, ziel: { x: 0, y: 0, z: -0.3 } },
      lesen: { kam: { x: 0, y: 0.3, z: 3.7 }, ziel: { x: 0, y: -0.02, z: 0.9 } },
      schluss: { kam: { y: 0.75, z: 4.1 }, ziel: { y: -0.25 } },
    },
    pose: {
      lesenZu: { x: -0.48, y: -0.08, z: 0.95, rx: -0.42, ry: 0, rz: 0 },   // geschlossen vor der Kamera
      lesenAufX: -0.02,                                                   // x-Verschiebung nach dem Öffnen (Doppelseite mittig)
      schluss: { y: -0.3, z: 0.85, rx: -0.65 },                          // abgesenkt, aber vor dem Regal
      auszugTiefe: 1.25,                                                  // wie weit das Buch aus dem Regal gleitet
      hoverTiefe: 0.14,                                                   // Vorrücken bei Mauszeiger
    },
    scroll: {                                                             // Zeiten in Abschnitten (1 Abschnitt = 100 vh)
      inhaltAus: 0.55, hinweisAus: 0.3,
      blattDauer: 0.5, panelEin: 0.32, panelAus: 0.86, textSchub: 0.5, textSchubDauer: 0.34,
      schlussPanelAus: 0.05, abdunkeln: 0.35, schlussEin: 0.5,
    },
    anim: { auszug: 1, rueckgabe: 1 },                                    // Zeitfaktoren der Übergänge
  };
  const d = reduzierteBewegung ? 0.001 : 1;

  /* ============================ Module aufbauen ============================ */
  let modus = "regal", aktiv = null;                  // regal | auszug | lesen | rueckgabe
  const ui = Chronik.erstelleOberflaeche({
    INHALT,
    aktionen: {
      oeffneBuch: (i) => oeffneBuch(i),
      zurueckInsRegal: () => zurueckInsRegal(),
      springeZuKapitel: (i) => springeZu(1 + i + 0.6),
      springeZumSchluss: () => springeZu(abschnitte() - 0.25),
      aktuellesBuch: () => aktiv,
    },
  });

  if (!window.THREE || !window.WebGLRenderingContext) { ui.zeigeFallback(); $("#laden").classList.add("fertig"); return; }
  gsap.registerPlugin(ScrollTrigger);

  try {
    await Promise.all(['700 200px "Alegreya"', '500 170px "Alegreya"', 'italic 500 72px "Alegreya"', '400 40px "Alegreya"', 'italic 400 40px "Alegreya"', '400 36px "Alegreya Sans"']
      .map(f => document.fonts.load(f)));
  } catch (e) { /* Systemschriften als Rückfall */ }

  function ladeBild(url) {
    return new Promise(res => {
      if (!url) return res(null);
      const img = new Image(); const timer = setTimeout(() => res(null), 6000);
      img.onload = () => { clearTimeout(timer); res(img); };
      img.onerror = () => { clearTimeout(timer); res(null); };
      img.src = url;
    });
  }
  const tx = INHALT.texturen || {};
  const [lederBild, papierBild, holzBild] = await Promise.all([ladeBild(tx.leder), ladeBild(tx.papier), ladeBild(tx.holz)]);

  const tex = Chronik.erstelleTexturen({ mobil, lederBild, papierBild, holzBild });
  let szene;
  try {
    szene = Chronik.erstelleSzene({ THREE, canvas: $("#szene"), mobil, tex, reduzierteBewegung });
  } catch (e) { ui.zeigeFallback(); $("#laden").classList.add("fertig"); return; }
  const fabrik = Chronik.erstelleBuchfabrik({ THREE, scene: szene.scene, tex });
  const { HB } = fabrik.MASSE;

  /* ============================ Bücher ins Regal stellen ============================ */
  const buecher = INHALT.buecher.map((def, i) => fabrik.erstelleBuch(def, i));
  const fuellFarben = ["#3b2a22", "#2c2a33", "#4a3b24", "#2f3a3a", "#55302a", "#3a3326"];
  const fueller = Array.from({ length: mobil ? 2 : 4 }, (_, i) => fabrik.erstelleFueller(i, fuellFarben[i % fuellFarben.length]));
  {
    const links = fueller.slice(0, Math.ceil(fueller.length / 2)), rechts = fueller.slice(links.length);
    const reihe = [...links.map(f => ({ f })), ...buecher.map(b => ({ b })), ...rechts.map(f => ({ f }))];
    const spalt = 0.02, { FRONT_Z } = szene.REGAL;
    const breite = reihe.reduce((s, e) => s + (e.b ? e.b.GESAMT : e.f.dicke) + spalt, -spalt);
    let x = -breite / 2;
    reihe.forEach(e => {
      if (e.b) {
        e.b.regal = { x, y: 0, z: FRONT_Z };
        Object.assign(e.b.pose, e.b.regal, { rx: 0, ry: Math.PI / 2, rz: 0 });
        x += e.b.GESAMT + spalt;
      } else {
        e.f.mesh.position.set(x + e.f.dicke / 2, -HB / 2 + e.f.hoehe / 2, FRONT_Z - (fabrik.MASSE.W + 0.02) / 2 + 0.04);
        x += e.f.dicke + spalt;
      }
    });
  }

  /* ============================ Zustand, Kamera, Render-Schleife ============================ */
  const zustand = { kam: { ...KONFIG.kamera.regal.kam }, ziel: { ...KONFIG.kamera.regal.ziel }, layout: 1, licht: 1 };
  szene.berechneFraming("regal"); szene.framing.abstandFaktor = szene.framing.zielFaktor;
  addEventListener("resize", () => { szene.groesse(); szene.berechneFraming(modus === "regal" || modus === "rueckgabe" ? "regal" : "lesen"); });

  const uhr = new THREE.Clock();
  let ersterFrame = true;
  (function zeichnen() {
    buecher.forEach(fabrik.anwenden);
    szene.kameraAnwenden(zustand.kam, zustand.ziel, zustand.layout);
    szene.lichtSetzen(zustand.licht);
    szene.staubBewegen(uhr.getElapsedTime());
    szene.rendern();
    if (ersterFrame) { ersterFrame = false; $("#laden").classList.add("fertig"); document.body.classList.add("regal"); $("#intro").classList.add("aktiv"); }
    requestAnimationFrame(zeichnen);
  })();

  /* ============================ Maus und Finger am Regal ============================ */
  const canvas = $("#szene"), raycaster = new THREE.Raycaster(), zeiger = new THREE.Vector2();
  function buchUnter(ev) {
    zeiger.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(zeiger, szene.camera);
    const hit = raycaster.intersectObjects(buecher.map(b => b.treffer))[0];
    return hit ? buecher.find(b => b.treffer === hit.object) : null;
  }
  let letzterHover = null, zeigerStart = null;
  addEventListener("pointermove", ev => {
    if (modus !== "regal") return;
    const b = buchUnter(ev);
    if (b === letzterHover) return;
    buecher.forEach(x => { x.hoverZiel = x === b ? KONFIG.pose.hoverTiefe : 0; });
    canvas.classList.toggle("greifbar", !!b); letzterHover = b;
  });
  canvas.addEventListener("pointerdown", ev => { zeigerStart = { x: ev.clientX, y: ev.clientY }; });
  canvas.addEventListener("pointerup", ev => {
    if (modus !== "regal" || !zeigerStart) return;
    const bewegt = Math.hypot(ev.clientX - zeigerStart.x, ev.clientY - zeigerStart.y) > 12; zeigerStart = null;
    const b = bewegt ? null : buchUnter(ev); if (b) oeffneBuch(b.index);
  });

  /* ============================ Scroll-Zeitleiste eines Buches ============================ */
  let tl = null, sprung = null;
  const abschnitte = () => (aktiv === null ? 1 : INHALT.buecher[aktiv].kapitel.length + 2);   // Inhalt, K Kapitel, Schluss
  const ueberlauf = (panel) => Math.max(0, panel.scrollHeight - panel.clientHeight);
  gsap.set([ui.schluss, "#abdunkeln", ui.inhaltsPanel], { opacity: 0 });

  function baueZeitleiste(buch) {
    const K = buch.K, A = K + 2, Z = KONFIG.scroll;
    $("#scroll").style.height = (A * 100) + "vh";
    window.scrollTo(0, 0);
    tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: "#scroll", start: "top top", end: "bottom bottom",
        scrub: reduzierteBewegung ? true : 0.9, invalidateOnRefresh: true,
        onUpdate(st) { setzeLesezustand(st.progress); },
      },
    });
    setzeLesezustand(0);
    // Langer Text wird nicht im Panel gescrollt, sondern vom Seiten-Scroll nach oben geschoben
    const schiebeText = (panel, start, dauer) => {
      const text = panel.querySelector(".kapitel-text"), mehr = panel.querySelector(".mehr");
      if (text) tl.to(text, { y: () => -ueberlauf(panel), duration: dauer, ease: "none" }, start);
      if (mehr) tl.to(mehr, { opacity: 0, duration: dauer * 0.6, ease: "none" }, start);
    };
    // Abschnitt 0: Inhaltsverzeichnis
    schiebeText(ui.inhaltsPanel, 0.1, 0.4);
    tl.to(ui.inhaltsPanel, { opacity: 0, y: -14, duration: 0.25, ease: "power1.in" }, Z.inhaltAus)
      .to(ui.hinweis, { opacity: 0, duration: 0.25 }, Z.hinweisAus);
    // Abschnitte 1 … K: je ein Blatt und seine Randnotiz
    buch.def.kapitel.forEach((_, i) => {
      const s = 1 + i, letztes = i === K - 1;
      tl.to(buch.blaetter[i], { p: 1, duration: Z.blattDauer, ease: "power1.inOut" }, s)
        .to(ui.panels[i], { opacity: 1, y: 0, duration: 0.28, ease: "power1.out" }, s + Z.panelEin);
      schiebeText(ui.panels[i], s + Z.textSchub, Z.textSchubDauer);
      tl.to(ui.panels[i], { opacity: 0, y: -14, duration: 0.18, ease: "power1.in" }, letztes ? K + 1 + Z.schlussPanelAus : s + Z.panelAus);
    });
    // Abschnitt K+1: Schluss – das Buch bleibt vor dem Regal, sinkt leicht ab, der Raum dunkelt ab
    const e = K + 1, S = KONFIG.pose.schluss, KS = KONFIG.kamera.schluss;
    tl.to(zustand, { layout: 0, duration: 0.7 }, e)
      .to(buch.pose, { ...S, duration: 0.9 }, e)
      .to(zustand.kam, { ...KS.kam, duration: 0.9 }, e)
      .to(zustand.ziel, { ...KS.ziel, duration: 0.9 }, e)
      .to(zustand, { licht: 0.5, duration: 0.9 }, e)
      .to("#abdunkeln", { opacity: 1, duration: 0.5, ease: "power1.out" }, e + Z.abdunkeln)
      .to(ui.schluss, { opacity: 1, duration: 0.4, ease: "power1.out" }, e + Z.schlussEin)
      .to({}, { duration: 0.1 }, A - 0.1);
    document.querySelectorAll(".kapitel-inhalt").forEach(p => {
      const text = p.querySelector(".kapitel-text"), mehr = p.querySelector(".mehr");
      if (text) gsap.set(text, { y: 0 });
      if (mehr) gsap.set(mehr, { opacity: ueberlauf(p) > 0 ? 1 : 0 });
    });
    ScrollTrigger.refresh();
  }
  /* Welche Ebene ist gerade sichtbar und damit klickbar? (aufgerufen bei jedem Scroll-Schritt) */
  let lesezeit = 0;
  function setzeLesezustand(progress) {
    const K = buecher[aktiv].K, A = K + 2;
    lesezeit = progress * A;
    const aktuell = aktuellesKapitel();
    $("#fortschritt i").style.width = (progress * 100) + "%";
    ui.panels.forEach((p, i) => p.classList.toggle("aktiv", i === aktuell && lesezeit < K + 1.15));
    ui.inhaltsPanel.classList.toggle("aktiv", lesezeit < 0.6);
    ui.schluss.classList.toggle("aktiv", lesezeit > K + 1.5);
  }
  // Kapitel i belegt den Abschnitt [1+i, 2+i): Blatt umschlagen, Randnotiz lesen. -1 = Inhaltsverzeichnis, K = Schluss
  const aktuellesKapitel = () => Math.floor(lesezeit - 1 + 1e-6);
  function aktualisiereUeberlauf() {                                       // nach Layoutänderungen (z. B. Galerieknopf eingeblendet)
    document.querySelectorAll(".kapitel-inhalt .mehr").forEach(m => gsap.set(m, { opacity: ueberlauf(m.parentElement) > 0 ? 1 : 0 }));
    ScrollTrigger.refresh();
  }
  function zerstoereZeitleiste() {
    if (tl) { if (tl.scrollTrigger) tl.scrollTrigger.kill(); tl.kill(); tl = null; }
    if (sprung) { sprung.kill(); sprung = null; }
    $("#scroll").style.height = "100vh"; window.scrollTo(0, 0);
    $("#fortschritt i").style.width = "0";
    gsap.set([ui.schluss, "#abdunkeln"], { opacity: 0 });
    gsap.set(ui.inhaltsPanel, { opacity: 0, y: 0 });
    ui.panels.forEach(p => p.classList.remove("aktiv")); ui.schluss.classList.remove("aktiv"); ui.inhaltsPanel.classList.remove("aktiv");
  }
  function springeZu(zeit) {
    if (!tl || !tl.scrollTrigger) return;
    const st = tl.scrollTrigger, ziel = st.start + (zeit / abschnitte()) * (st.end - st.start);
    if (sprung) sprung.kill();
    if (reduzierteBewegung) { window.scrollTo(0, ziel); return; }
    const o = { y: window.scrollY }, dauer = Math.min(2.2, 0.6 + Math.abs(ziel - o.y) / innerHeight * 0.18);
    sprung = gsap.to(o, { y: ziel, duration: dauer, ease: "power2.inOut", onUpdate: () => window.scrollTo(0, o.y) });
  }

  /* ============================ Blättern per Klick und Wischen ============================ */
  function blaettere(richtung) {                                           // +1 vor, -1 zurück
    if (modus !== "lesen") return;
    const K = buecher[aktiv].K, k = aktuellesKapitel();
    const ziel = k + richtung;
    if (ziel < 0) springeZu(0.2);                                           // zurück zum Inhaltsverzeichnis
    else if (ziel >= K) springeZu(abschnitte() - 0.25);                    // vor zum Schluss
    else springeZu(1 + ziel + 0.6);
  }
  const bedienelement = (ev) => ev.target && ev.target.closest && ev.target.closest("button, a, #menue, #lichtbox, #inhaltsverzeichnis");
  let leseZeiger = null;
  addEventListener("pointerdown", ev => {
    leseZeiger = (modus === "lesen" && !bedienelement(ev) && !ui.lichtboxOffen() && !ui.inhaltOffen()) ? { x: ev.clientX, y: ev.clientY, t: performance.now() } : null;
  });
  addEventListener("pointermove", ev => {                                  // Zeiger über dem eingeklebten Foto?
    if (modus !== "lesen" || ev.pointerType === "touch") return;
    zeiger.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(zeiger, szene.camera);
    const buch = buecher[aktiv];
    const hit = raycaster.intersectObject(buch.gruppe, true).find(h => h.object !== buch.treffer);
    const blatt = hit && buch.blaetter.find(b => b.vorne === hit.object);
    const r = blatt && blatt.fotoRect, u = hit && hit.uv ? hit.uv.x : -1, v = hit && hit.uv ? 1 - hit.uv.y : -1;
    document.body.classList.toggle("greifbar", !!(r && u >= r.x0 && u <= r.x1 && v >= r.y0 && v <= r.y1));
  });
  addEventListener("pointerup", ev => {
    if (!leseZeiger || modus !== "lesen") { leseZeiger = null; return; }
    const dx = ev.clientX - leseZeiger.x, dy = ev.clientY - leseZeiger.y, dauer = performance.now() - leseZeiger.t;
    leseZeiger = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dauer < 700) { blaettere(dx < 0 ? 1 : -1); return; }   // Wischen
    if (Math.hypot(dx, dy) > 10) return;                                                                            // Scrollen, kein Klick
    const buch = buecher[aktiv];
    zeiger.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(zeiger, szene.camera);
    const hit = raycaster.intersectObject(buch.gruppe, true).find(h => h.object !== buch.treffer);
    if (!hit) return;
    // Klick auf das eingeklebte Foto öffnet die Galerie
    const blatt = buch.blaetter.find(b => b.vorne === hit.object);
    if (blatt && blatt.fotoRect && hit.uv) {
      const u = hit.uv.x, v = 1 - hit.uv.y, r = blatt.fotoRect;
      if (u >= r.x0 && u <= r.x1 && v >= r.y0 && v <= r.y1 && ui.oeffneGalerie(buch, blatt.kapitelIndex)) return;
    }
    const lokal = buch.gruppe.worldToLocal(hit.point.clone());
    blaettere(lokal.x < 0 ? -1 : 1);                                       // linke Seite zurück, rechte Seite vor
  });

  /* ============================ Buch aufschlagen ============================ */
  function oeffneBuch(i) {
    if (modus === "auszug" || modus === "rueckgabe") return;
    if (modus === "lesen") { if (aktiv === i) springeZu(0); else zurueckInsRegal(() => oeffneBuch(i)); return; }
    const buch = buecher[i], P = KONFIG.pose, KL = KONFIG.kamera.lesen, f = KONFIG.anim.auszug * d;
    modus = "auszug"; aktiv = i;
    buecher.forEach(b => { b.hoverZiel = 0; }); canvas.classList.remove("greifbar");
    document.body.classList.remove("regal"); $("#intro").classList.remove("aktiv");
    ui.markiereBuch(i);
    fabrik.seitenZeichnen(buch); ui.bauePanels(buch);
    ui.aktiviereGalerien(buch, async (k, bilder) => {
      const img = await ladeBild(bilder[0].src);
      if (img && aktiv === buch.index) fabrik.fotoEinkleben(buch, k, img, bilder[0].titel);
    }, () => { if (modus === "lesen") aktualisiereUeberlauf(); });
    history.replaceState(null, "", "#" + buch.def.id);
    szene.berechneFraming("lesen");
    gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete() { modus = "lesen"; baueZeitleiste(buch); gsap.to(ui.inhaltsPanel, { opacity: 1, y: 0, duration: 0.5 }); } })
      .to("#intro", { opacity: 0, y: -20, duration: 0.4 * f }, 0)
      .to(ui.hinweis, { opacity: 0, duration: 0.3 * f, onComplete: () => ui.setzeHinweis(INHALT.intro.hinweisLesen) }, 0)
      .to(buch.pose, { z: buch.regal.z + P.auszugTiefe, duration: 0.9 * f }, 0)                 // herausziehen
      .to(buch.pose, { ...P.lesenZu, duration: 1.1 * f }, 0.75 * f)                               // vor die Kamera
      .to(zustand.kam, { ...KL.kam, duration: 1.3 * f }, 0.6 * f)
      .to(zustand.ziel, { ...KL.ziel, duration: 1.3 * f }, 0.6 * f)
      .to(buch.zustandDeckel, { r: -Math.PI, duration: 0.9 * f }, 1.9 * f)                        // aufschlagen
      .to(buch.zustandDeckel, { z: buch.DECKEL_AUF, duration: 0.9 * f, ease: "power1.inOut" }, 1.9 * f)
      .to(buch.zustandRuecken, { s: fabrik.MASSE.DECKEL, z: fabrik.MASSE.DECKEL / 2, duration: 0.9 * f, ease: "power1.inOut" }, 1.9 * f)
      .to(buch.pose, { x: P.lesenAufX, duration: 0.9 * f }, 1.9 * f)
      .to(zustand, { layout: 1, duration: 0.8 * f }, 2.2 * f)
      .to(ui.hinweis, { opacity: 1, duration: 0.4 * f }, 2.6 * f);
  }

  /* ============================ Buch zurückstellen ============================ */
  function zurueckInsRegal(danach) {
    if (modus !== "lesen") return;
    const buch = buecher[aktiv], P = KONFIG.pose, KR = KONFIG.kamera.regal, f = KONFIG.anim.rueckgabe * d;
    modus = "rueckgabe";
    document.body.classList.remove("greifbar");
    zerstoereZeitleiste();
    ui.markiereBuch(null);
    history.replaceState(null, "", location.pathname + location.search);
    szene.berechneFraming("regal");
    gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete() {
      modus = "regal"; aktiv = null;
      fabrik.seitenFreigeben(buch); ui.leerePanels();
      document.body.classList.add("regal"); $("#intro").classList.add("aktiv");
      if (danach) danach();
    } })
      .to(buch.blaetter, { p: 0, duration: 0.6 * f, ease: "power1.inOut" }, 0)                   // Blätter zurück
      .to(zustand, { layout: 1, licht: 1, duration: 0.6 * f }, 0)
      .to(ui.hinweis, { opacity: 0, duration: 0.2 * f, onComplete: () => ui.setzeHinweis(INHALT.intro.hinweis) }, 0)
      .to(buch.zustandDeckel, { r: 0, z: buch.DECKEL_ZU, duration: 0.8 * f }, 0.4 * f)           // zuklappen
      .to(buch.zustandRuecken, { s: buch.GESAMT, z: buch.GESAMT / 2, duration: 0.8 * f, ease: "power1.inOut" }, 0.4 * f)
      .to(buch.pose, { ...P.lesenZu, duration: 0.8 * f }, 0.4 * f)
      .to(buch.pose, { ...buch.regal, z: buch.regal.z + P.auszugTiefe, rx: 0, ry: Math.PI / 2, rz: 0, duration: 1.0 * f }, 1.1 * f)   // vor das Fach
      .to(zustand.kam, { ...KR.kam, duration: 1.2 * f }, 1.0 * f)
      .to(zustand.ziel, { ...KR.ziel, duration: 1.2 * f }, 1.0 * f)
      .to(buch.pose, { z: buch.regal.z, duration: 0.8 * f }, 2.0 * f)                             // einschieben
      .to("#intro", { opacity: 1, y: 0, duration: 0.5 * f }, 2.3 * f)
      .to(ui.hinweis, { opacity: 1, duration: 0.4 * f }, 2.5 * f);
  }

  /* Direktlink: index.html#verein */
  const startIndex = INHALT.buecher.findIndex(b => b.id === location.hash.replace("#", ""));
  if (startIndex >= 0) setTimeout(() => oeffneBuch(startIndex), 600);
})();
