/* =====================================================================
   MODUL TEXTUREN
   Zeichnet alle Oberflächen auf Canvas-Elemente: Pergamentseiten mit
   Text, Leder mit Prägung, Papierkanten, Holz. Kennt weder three.js-
   Szene noch Scroll-Logik – es liefert nur fertige Canvas-Elemente.
   ===================================================================== */
"use strict";
window.Chronik = window.Chronik || {};

window.Chronik.erstelleTexturen = function erstelleTexturen({ mobil, lederBild, papierBild, holzBild }) {

  /* Alle Seiten werden in einem logischen Koordinatensystem von 1024 × 1434
     gezeichnet; auf Mobilgeräten ist die tatsächliche Auflösung kleiner. */
  const LW = 1024, LH = 1434;
  const PW = mobil ? 768 : 1024, PH = Math.round(PW * (LH / LW));
  const S = PW / LW;
  const RAND = 108;                                   // Seitenrand
  const TINTE = "#2b2118", TINTE_LEISE = "#6a5a44", SEPIA = "#7a4a22";
  const SCHRIFT = '"Alegreya"', SCHRIFT_SANS = '"Alegreya Sans"';

  /* ---------- Grundwerkzeuge ---------- */
  function zufall(seed) {                              // deterministisch, damit Seiten gleich bleiben
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function leinwand(w, h) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    return [c, c.getContext("2d")];
  }
  function seitenLeinwand(c) {                         // Seite neu beginnen (vorhandenes Canvas wiederverwenden)
    if (!c) { c = document.createElement("canvas"); c.width = PW; c.height = PH; }
    const ctx = c.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, PW, PH); ctx.scale(S, S);
    return [c, ctx];
  }
  function bildFuellen(ctx, img, w, h) {               // Bild formatfüllend einpassen
    const r = Math.max(w / img.width, h / img.height);
    ctx.drawImage(img, (w - img.width * r) / 2, (h - img.height * r) / 2, img.width * r, img.height * r);
  }
  function umbrechen(ctx, text, x, y, maxW, lh) {      // Fließtext umbrechen, gibt nächste freie y-Position zurück
    const worte = String(text).split(" "); let zeile = "";
    for (const wort of worte) {
      const test = zeile ? zeile + " " + wort : wort;
      if (ctx.measureText(test).width > maxW && zeile) { ctx.fillText(zeile, x, y); zeile = wort; y += lh; }
      else zeile = test;
    }
    if (zeile) { ctx.fillText(zeile, x, y); y += lh; }
    return y;
  }
  function passendeGroesse(ctx, text, start, maxW, vorlage) {   // Schrift verkleinern, bis der Text passt
    let g = start;
    for (; g > 40; g -= 6) { ctx.font = vorlage.replace("{g}", g); if (ctx.measureText(text).width <= maxW) break; }
    return g;
  }
  function kuerzen(ctx, text, maxW) {
    while (ctx.measureText(text).width > maxW && text.length > 4) text = text.slice(0, -2).trimEnd() + "…";
    return text;
  }
  function zierlinie(ctx, x1, x2, y, farbe) {          // Linie mit Raute in der Mitte
    const m = (x1 + x2) / 2;
    ctx.strokeStyle = farbe; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(m - 22, y); ctx.moveTo(m + 22, y); ctx.lineTo(x2, y); ctx.stroke();
    ctx.fillStyle = farbe; ctx.beginPath();
    ctx.moveTo(m, y - 9); ctx.lineTo(m + 9, y); ctx.lineTo(m, y + 9); ctx.lineTo(m - 9, y); ctx.closePath(); ctx.fill();
  }
  function farbton(hex, f) {                           // Hex-Farbe aufhellen (f > 1) oder abdunkeln (f < 1)
    const n = parseInt(hex.replace("#", ""), 16);
    const k = v => Math.max(0, Math.min(255, Math.round(v * f)));
    return `rgb(${k(n >> 16)},${k((n >> 8) & 255)},${k(n & 255)})`;
  }
  function seitenzahl(ctx, nummer, rechts) {
    ctx.font = `400 30px ${SCHRIFT}`; ctx.fillStyle = TINTE_LEISE; ctx.textAlign = rechts ? "right" : "left";
    ctx.fillText(String(nummer), rechts ? LW - RAND : RAND, LH - 70);
  }

  /* ---------- Pergament ---------- */
  function pergament(ctx, seed) {
    const rnd = zufall(seed);
    if (papierBild) bildFuellen(ctx, papierBild, LW, LH);
    else {
      const g = ctx.createRadialGradient(LW / 2, LH / 2, LW * 0.15, LW / 2, LH / 2, LW * 0.9);
      g.addColorStop(0, "#ede3cb"); g.addColorStop(0.7, "#dccdab"); g.addColorStop(1, "#c3ad83");
      ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
      for (let i = 0; i < 3000; i++) { ctx.fillStyle = `rgba(95,65,25,${rnd() * 0.09})`; ctx.fillRect(rnd() * LW, rnd() * LH, 1 + rnd() * 2.5, 1 + rnd() * 2.5); }
      ctx.strokeStyle = "rgba(80,55,20,0.05)"; ctx.lineWidth = 1;
      for (let i = 0; i < 60; i++) { ctx.beginPath(); const x = rnd() * LW, y = rnd() * LH; ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 300, y + (rnd() - 0.5) * 40); ctx.stroke(); }
    }
    for (let i = 0; i < 16; i++) {                     // Stockflecken
      const x = rnd() * LW, y = rnd() * LH, r = 30 + rnd() * 110;
      const f = ctx.createRadialGradient(x, y, 0, x, y, r);
      f.addColorStop(0, `rgba(130,85,30,${0.05 + rnd() * 0.08})`); f.addColorStop(1, "rgba(130,85,30,0)");
      ctx.fillStyle = f; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const k = ctx.createLinearGradient(0, 0, 0, LH);   // abgegriffene Ränder
    k.addColorStop(0, "rgba(90,60,25,0.18)"); k.addColorStop(0.06, "rgba(90,60,25,0)"); k.addColorStop(0.94, "rgba(90,60,25,0)"); k.addColorStop(1, "rgba(90,60,25,0.22)");
    ctx.fillStyle = k; ctx.fillRect(0, 0, LW, LH);
    const q = ctx.createLinearGradient(0, 0, LW, 0);
    q.addColorStop(0, "rgba(90,60,25,0.06)"); q.addColorStop(0.05, "rgba(90,60,25,0)"); q.addColorStop(0.93, "rgba(90,60,25,0)"); q.addColorStop(1, "rgba(90,60,25,0.25)");
    ctx.fillStyle = q; ctx.fillRect(0, 0, LW, LH);
  }
  function papierRelief() {                            // Bump-Map, eine für alle Seiten
    const [c, ctx] = leinwand(512, 512); const rnd = zufall(42);
    ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { const v = 100 + rnd() * 56; ctx.fillStyle = `rgba(${v},${v},${v},0.5)`; ctx.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 3, 1 + rnd() * 2); }
    ctx.lineWidth = 1;
    for (let i = 0; i < 400; i++) { const v = 90 + rnd() * 80; ctx.strokeStyle = `rgba(${v},${v},${v},0.35)`; ctx.beginPath(); const x = rnd() * 512, y = rnd() * 512; ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 60, y + (rnd() - 0.5) * 8); ctx.stroke(); }
    return c;
  }

  /* ---------- Buchseiten ---------- */
  function seiteLeer(seed, c) { const [cv, ctx] = seitenLeinwand(c); pergament(ctx, seed); return cv; }

  function seiteInhalt(buch, c) {                      // Erste Seite: Inhaltsverzeichnis
    c = seiteLeer(11, c); const ctx = c.getContext("2d");
    ctx.textAlign = "center"; ctx.fillStyle = TINTE_LEISE; ctx.font = `italic 400 36px ${SCHRIFT}`;
    umbrechen(ctx, buch.titel + (buch.untertitel ? " – " + buch.untertitel : ""), LW / 2, 200, LW - 2 * RAND, 44);
    ctx.fillStyle = SEPIA; ctx.font = `500 110px ${SCHRIFT}`; ctx.fillText("Inhalt", LW / 2, 340);
    zierlinie(ctx, LW / 2 - 140, LW / 2 + 140, 390, SEPIA);
    const n = buch.kapitel.length, oben = 470, unten = LH - 170;
    const lh = Math.min(74, (unten - oben) / Math.max(n, 1));
    const schrift = Math.min(38, Math.round(lh * 0.5));
    buch.kapitel.forEach((k, i) => {
      const y = oben + i * lh;
      ctx.textAlign = "left"; ctx.fillStyle = SEPIA; ctx.font = `700 ${schrift}px ${SCHRIFT}`;
      ctx.fillText(k.jahr, RAND, y);
      const jb = Math.max(ctx.measureText(k.jahr).width + 28, 190);
      ctx.fillStyle = TINTE; ctx.font = `400 ${schrift}px ${SCHRIFT}`;
      ctx.fillText(kuerzen(ctx, k.titel, LW - 2 * RAND - jb - 90), RAND + jb, y);
      ctx.textAlign = "right"; ctx.fillStyle = TINTE_LEISE; ctx.font = `400 ${Math.round(schrift * 0.85)}px ${SCHRIFT}`;
      ctx.fillText(String(2 * i + 2), LW - RAND, y);
    });
    return c;
  }

  function seiteLinks(k, i, c) {                       // Linke Seite: Jahr und Titel
    c = seiteLeer(100 + i, c); const ctx = c.getContext("2d");
    ctx.textAlign = "center"; ctx.fillStyle = SEPIA;
    const g = passendeGroesse(ctx, k.jahr, k.jahr.length <= 5 ? 250 : 170, LW - 2 * RAND, `700 {g}px ${SCHRIFT}`);
    ctx.font = `700 ${g}px ${SCHRIFT}`; ctx.fillText(k.jahr, LW / 2, 560);
    zierlinie(ctx, LW / 2 - 200, LW / 2 + 200, 640, SEPIA);
    ctx.fillStyle = TINTE; ctx.font = `italic 500 76px ${SCHRIFT}`;
    const y = umbrechen(ctx, k.titel, LW / 2, 760, LW - 2 * RAND, 88);
    if (k.untertitel) { ctx.font = `400 36px ${SCHRIFT_SANS}`; ctx.fillStyle = TINTE_LEISE; umbrechen(ctx, k.untertitel, LW / 2, y + 20, LW - 2 * RAND - 80, 46); }
    seitenzahl(ctx, 2 * i + 2, false);
    return c;
  }

  function foto(ctx, bild, titel, oben) {              // „eingeklebtes“ Foto mit Fotoecken; gibt dessen Rechteck zurück
    const frei = LH - 150 - oben;
    if (frei <= 300) return null;
    const maxW = LW - 2 * RAND - 60, maxH = frei - 70;
    const r = Math.min(maxW / bild.width, maxH / bild.height);
    const bw = bild.width * r, bh = bild.height * r, cx = LW / 2, cy = oben + 20 + bh / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.025);
    ctx.shadowColor = "rgba(40,25,10,0.45)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#f2eadb"; ctx.fillRect(-bw / 2 - 16, -bh / 2 - 16, bw + 32, bh + 32);
    ctx.shadowColor = "transparent";
    ctx.drawImage(bild, -bw / 2, -bh / 2, bw, bh);
    ctx.fillStyle = "rgba(120,80,30,0.12)"; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);   // Sepia-Schleier
    ctx.fillStyle = TINTE;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      const ex = sx * (bw / 2 + 16), ey = sy * (bh / 2 + 16);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - sx * 46, ey); ctx.lineTo(ex, ey - sy * 46); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
    if (titel) { ctx.font = `italic 400 30px ${SCHRIFT}`; ctx.fillStyle = TINTE_LEISE; ctx.textAlign = "center"; umbrechen(ctx, titel, LW / 2, cy + bh / 2 + 62, LW - 2 * RAND, 38); }
    return { x0: (cx - bw / 2 - 16) / LW, y0: (cy - bh / 2 - 16) / LH, x1: (cx + bw / 2 + 16) / LW, y1: (cy + bh / 2 + 16) / LH };   // relativ (0…1)
  }

  function seiteRechts(k, i, bild, c) {                // Rechte Seite: Text, Zitat, optional Foto
    c = seiteLeer(200 + i, c); const ctx = c.getContext("2d");
    ctx.textAlign = "left"; ctx.fillStyle = TINTE; ctx.font = `400 41px ${SCHRIFT}`;
    let y = umbrechen(ctx, k.text, RAND, 240, LW - 2 * RAND, 60);
    if (k.zitat) {
      y += 50; ctx.font = `italic 400 41px ${SCHRIFT}`; ctx.fillStyle = SEPIA;
      y = umbrechen(ctx, "„" + k.zitat + "“", RAND + 40, y, LW - 2 * RAND - 80, 58);
      if (k.quelle) { ctx.font = `400 29px ${SCHRIFT_SANS}`; ctx.fillStyle = TINTE_LEISE; y = umbrechen(ctx, k.quelle, RAND + 40, y + 10, LW - 2 * RAND - 80, 38); }
    }
    c.fotoRect = (bild && bild.img) ? foto(ctx, bild.img, bild.titel, y + 60) : null;
    seitenzahl(ctx, 2 * i + 3, true);
    return c;
  }

  function seiteSchluss(c) {
    c = seiteLeer(999, c); const ctx = c.getContext("2d");
    ctx.textAlign = "center"; ctx.fillStyle = TINTE_LEISE; ctx.font = `italic 400 54px ${SCHRIFT}`;
    ctx.fillText("Fortsetzung folgt.", LW / 2, LH / 2); zierlinie(ctx, LW / 2 - 120, LW / 2 + 120, LH / 2 + 70, SEPIA);
    return c;
  }

  /* ---------- Leder: Farbe, Relief, Rauheit und Metall (für Goldprägung) ---------- */
  function lederSatz(w, h, seed, farbe, deko) {
    const rnd = zufall(seed);
    const [narbe, nctx] = leinwand(w, h);
    nctx.fillStyle = "#7a7a7a"; nctx.fillRect(0, 0, w, h);
    const zellen = Math.round(w * h / 420);
    for (let i = 0; i < zellen; i++) {
      const x = rnd() * w, y = rnd() * h, r = 4 + rnd() * 9, v = 95 + rnd() * 70;
      const g = nctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${v},${v},${v},0.9)`); g.addColorStop(1, `rgba(${v},${v},${v},0)`);
      nctx.fillStyle = g; nctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    nctx.strokeStyle = "rgba(60,60,60,0.5)"; nctx.lineWidth = 1;
    for (let i = 0; i < zellen / 6; i++) { nctx.beginPath(); const x = rnd() * w, y = rnd() * h; nctx.moveTo(x, y); nctx.lineTo(x + (rnd() - 0.5) * 30, y + (rnd() - 0.5) * 30); nctx.stroke(); }

    const [farb, fctx] = leinwand(w, h);
    if (lederBild) {
      bildFuellen(fctx, lederBild, w, h);
      fctx.globalCompositeOperation = "multiply"; fctx.fillStyle = farbton(farbe, 1.6); fctx.fillRect(0, 0, w, h);
      fctx.globalCompositeOperation = "source-over";
    } else {
      const g = fctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, farbton(farbe, 1.25)); g.addColorStop(0.5, farbe); g.addColorStop(1, farbton(farbe, 0.72));
      fctx.fillStyle = g; fctx.fillRect(0, 0, w, h);
      fctx.globalAlpha = 0.55; fctx.globalCompositeOperation = "overlay"; fctx.drawImage(narbe, 0, 0);
      fctx.globalCompositeOperation = "multiply"; fctx.globalAlpha = 0.35; fctx.drawImage(narbe, 0, 0);
      fctx.globalAlpha = 1; fctx.globalCompositeOperation = "source-over";
    }
    const ab = fctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.95);   // Gebrauchsspuren
    ab.addColorStop(0, "rgba(0,0,0,0)"); ab.addColorStop(1, "rgba(0,0,0,0.45)");
    fctx.fillStyle = ab; fctx.fillRect(0, 0, w, h);
    const [rau, rctx] = leinwand(w, h); rctx.fillStyle = "#a0a0a0"; rctx.fillRect(0, 0, w, h);
    rctx.globalAlpha = 0.5; rctx.drawImage(narbe, 0, 0); rctx.globalAlpha = 1;
    const [metall, mctx] = leinwand(w, h); mctx.fillStyle = "#000"; mctx.fillRect(0, 0, w, h);
    if (deko) {
      const gold = fctx.createLinearGradient(0, 0, w, h);
      gold.addColorStop(0, "#e6c77e"); gold.addColorStop(0.45, "#b88f3f"); gold.addColorStop(0.7, "#f0d99a"); gold.addColorStop(1, "#a67c33");
      deko(fctx, gold, true);          // Farbe: Gold mit Schatten
      deko(nctx, "#c8c8c8", false);    // Relief: leicht erhaben
      deko(rctx, "#404040", false);    // Rauheit: Gold ist glatter
      deko(mctx, "#e8e8e8", false);    // Metall: Gold glänzt
    }
    return { farbe: farb, relief: narbe, rau, metall };
  }
  function deckelDeko(buch) {                          // Rahmen, Eckornamente, Titel auf dem Vorderdeckel
    return (ctx, fuellung, mitSchatten) => {
      const w = LW, h = LH;
      ctx.save(); ctx.scale(S, S);
      ctx.strokeStyle = fuellung; ctx.fillStyle = fuellung;
      if (mitSchatten) { ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 3; ctx.shadowOffsetY = 2; }
      ctx.lineWidth = 7; ctx.strokeRect(70, 70, w - 140, h - 140);
      ctx.lineWidth = 2.5; ctx.strokeRect(94, 94, w - 188, h - 188);
      [[94, 94], [w - 94, 94], [94, h - 94], [w - 94, h - 94]].forEach(([x, y]) => {
        const sx = x < w / 2 ? 1 : -1, sy = y < h / 2 ? 1 : -1;
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + sx * 46, y); ctx.quadraticCurveTo(x, y, x, y + sy * 46); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + sx * 24, y + sy * 24, 5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.textAlign = "center";
      const g = passendeGroesse(ctx, buch.titel, 190, w - 220, `500 {g}px ${SCHRIFT}`);
      ctx.font = `500 ${g}px ${SCHRIFT}`; ctx.fillText(buch.titel, w / 2, h * 0.43);
      if (buch.untertitel) { ctx.font = `italic 500 66px ${SCHRIFT}`; umbrechen(ctx, buch.untertitel, w / 2, h * 0.43 + 110, w - 300, 78); }
      zierlinie(ctx, w / 2 - 170, w / 2 + 170, h * 0.68, fuellung);
      if (buch.zeile) { ctx.font = `400 34px ${SCHRIFT_SANS}`; umbrechen(ctx, buch.zeile, w / 2, h * 0.82, w - 260, 44); }
      ctx.restore();
    };
  }
  function rueckenDeko(buch) {                         // Bünde und Titel auf dem Buchrücken
    return (ctx, fuellung) => {
      const w = 256, h = LH;
      ctx.save(); ctx.scale(1, S); ctx.strokeStyle = fuellung; ctx.fillStyle = fuellung; ctx.lineWidth = 6;
      [0.1, 0.17, 0.83, 0.9].forEach(f => { ctx.beginPath(); ctx.moveTo(0, h * f); ctx.lineTo(w, h * f); ctx.stroke(); });
      ctx.translate(w / 2, h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center";
      const g = passendeGroesse(ctx, buch.titel, 68, h * 0.55, `500 {g}px ${SCHRIFT}`);
      ctx.font = `500 ${g}px ${SCHRIFT}`; ctx.fillText(buch.titel, 0, 24);
      ctx.restore();
    };
  }

  /* ---------- Papierkanten und Holz ---------- */
  function schnitt() {
    const [c, ctx] = leinwand(512, 128); const rnd = zufall(5);
    ctx.fillStyle = "#d8c8a4"; ctx.fillRect(0, 0, 512, 128);
    for (let y = 0; y < 128; y += 2) { ctx.fillStyle = `rgba(90,60,25,${0.08 + rnd() * 0.25})`; ctx.fillRect(0, y, 512, 1); }
    const g = ctx.createLinearGradient(0, 0, 512, 0);
    g.addColorStop(0, "rgba(70,45,15,0.35)"); g.addColorStop(0.1, "rgba(0,0,0,0)"); g.addColorStop(0.9, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(70,45,15,0.35)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 128);
    return c;
  }
  function holzSatz() {
    const [c, ctx] = leinwand(1024, 1024); const [rel, rctx] = leinwand(1024, 1024); const rnd = zufall(9);
    rctx.fillStyle = "#808080"; rctx.fillRect(0, 0, 1024, 1024);
    if (holzBild) bildFuellen(ctx, holzBild, 1024, 1024);
    else { ctx.fillStyle = "#2b1b11"; ctx.fillRect(0, 0, 1024, 1024); }
    const maserung = (k, farbe, lw, y, amp, i) => {
      k.strokeStyle = farbe; k.lineWidth = lw; k.beginPath(); k.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 64) k.lineTo(x, y + Math.sin(x / 180 + i) * amp);
      k.stroke();
    };
    for (let i = 0; i < 320; i++) {
      const hell = rnd() > 0.6, a = 0.08 + rnd() * 0.3, lw = 1 + rnd() * 3, y = rnd() * 1024, amp = rnd() * 22;
      if (!holzBild) maserung(ctx, hell ? `rgba(125,85,48,${a})` : `rgba(8,4,2,${a})`, lw, y, amp, i);
      maserung(rctx, hell ? `rgba(170,170,170,${a})` : `rgba(80,80,80,${a})`, lw, y, amp, i);
    }
    return { farbe: c, relief: rel };
  }

  return { LW, LH, PW, PH, seiteLeer, seiteInhalt, seiteLinks, seiteRechts, seiteSchluss, papierRelief, lederSatz, deckelDeko, rueckenDeko, schnitt, holzSatz };
};
