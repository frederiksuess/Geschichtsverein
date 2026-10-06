/* =====================================================================
   MODUL BUCH
   Baut aus einer Buchdefinition (Titel, Farbe, Kapitel) ein 3D-Buch:
   zwei Deckel mit je einem festen Buchblock, Buchrücken, Blätter.
   Die Seitentexturen werden erst beim Aufschlagen gezeichnet und beim
   Zurückstellen wieder freigegeben (Grafikspeicher auf Mobilgeräten).
   ===================================================================== */
"use strict";
window.Chronik = window.Chronik || {};

/* Maße in Szeneneinheiten – auch die Szene (Regalhöhe) greift darauf zu */
window.Chronik.BUCHMASSE = Object.freeze({
  W: 1.0,          // Seitenbreite
  H: 1.4,          // Seitenhöhe
  HB: 1.46,        // Höhe eines Deckels (H + 0.06)
  T: 0.006,        // Dicke eines Blattes
  B: 0.06,         // Dicke der beiden festen Buchblöcke
  DECKEL: 0.035,   // Dicke eines Deckels
  SEGMENTE: 28,    // Unterteilung eines Blattes für die Wölbung
});

window.Chronik.erstelleBuchfabrik = function erstelleBuchfabrik({ THREE, scene, tex }) {
  const MASSE = window.Chronik.BUCHMASSE;
  const { W, H, HB, T, B, DECKEL } = MASSE;
  const ZB = DECKEL + B;               // Höhe, auf der die Blätter liegen

  function textur(canvas, farbraum = true) {
    const t = new THREE.CanvasTexture(canvas);
    if (farbraum) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8; return t;
  }
  function wiederholend(...texturen) { texturen.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; }); return texturen; }

  /* Gemeinsame Materialien und Geometrien aller Bücher */
  const papierRel = textur(tex.papierRelief(), false); wiederholend(papierRel); papierRel.repeat.set(2, 2.8);
  const papierMaterial = (karte, seite) => new THREE.MeshStandardMaterial({
    map: karte, bumpMap: papierRel, bumpScale: 0.0015, roughness: 0.92, metalness: 0, envMapIntensity: 0.3, side: seite || THREE.FrontSide,
  });
  const leerTex = textur(tex.seiteLeer(500));          // Platzhalter, bis ein Buch aufgeschlagen wird
  const vorsatzMat = papierMaterial(leerTex);
  const vorsatzMatLinks = papierMaterial(textur(tex.seiteLeer(501)));
  const schnittMat = new THREE.MeshStandardMaterial({ map: textur(tex.schnitt()), roughness: 0.95, envMapIntensity: 0.2 });
  const deckelGeo = new THREE.BoxGeometry(W + 0.05, HB, DECKEL); deckelGeo.translate((W + 0.05) / 2 - 0.02, 0, 0);
  const blockGeo = new THREE.BoxGeometry(W - 0.004, H - 0.01, B);

  function lederMaterial(satz, extra) {
    return new THREE.MeshStandardMaterial(Object.assign({
      map: textur(satz.farbe), bumpMap: textur(satz.relief, false), bumpScale: 0.004,
      roughnessMap: textur(satz.rau, false), roughness: 1, metalness: 0, envMapIntensity: 0.8,
    }, extra || {}));
  }

  /* --- Ein Buch bauen (geschlossen, Blätter ohne Inhalt) --- */
  function erstelleBuch(def, index) {
    const K = def.kapitel.length, N = K + 1;           // N Blätter: Inhaltsseite + ein Blatt je Kapitel
    const GESAMT = 2 * DECKEL + 2 * B + N * T;
    const DECKEL_ZU = ZB + N * T + B + DECKEL / 2 + 0.002, DECKEL_AUF = DECKEL / 2;

    const klein = tex.lederSatz(512, 512, 3 + index, def.farbe, null);
    const lederMat = lederMaterial(klein);
    wiederholend(lederMat.map, lederMat.bumpMap, lederMat.roughnessMap);
    // Deckel und Rücken tragen Goldprägung: Metallkarte aktiv, metalness über die Karte gesteuert
    const deckelSatz = tex.lederSatz(tex.PW, tex.PH, 21 + index, def.farbe, tex.deckelDeko(def));
    const deckelMat = lederMaterial(deckelSatz, { bumpScale: 0.005, envMapIntensity: 0.9, metalness: 1, metalnessMap: textur(deckelSatz.metall, false) });
    const rueckenSatz = tex.lederSatz(256, tex.PH, 77 + index, def.farbe, tex.rueckenDeko(def));
    const rueckenMat = lederMaterial(rueckenSatz, { envMapIntensity: 0.9, metalness: 1, metalnessMap: textur(rueckenSatz.metall, false) });

    const gruppe = new THREE.Group(); scene.add(gruppe);
    const schatten = (m) => { m.castShadow = m.receiveShadow = true; return m; };

    // Rückdeckel und rechter Buchblock (fest)
    const mesh = (geo, materialien, x, y, z) => { const m = schatten(new THREE.Mesh(geo, materialien)); m.position.set(x, y, z); return m; };
    gruppe.add(mesh(deckelGeo, [lederMat, lederMat, lederMat, lederMat, vorsatzMat, lederMat], 0, 0, DECKEL / 2));
    gruppe.add(mesh(blockGeo, [schnittMat, schnittMat, schnittMat, schnittMat, vorsatzMat, vorsatzMat], W / 2, 0, DECKEL + B / 2));

    // Vorderdeckel mit linkem Buchblock, der beim Öffnen mitschwingt
    const deckel = new THREE.Group(); gruppe.add(deckel);
    deckel.add(mesh(deckelGeo, [lederMat, lederMat, lederMat, lederMat, deckelMat, vorsatzMat], 0, 0, 0));
    deckel.add(mesh(blockGeo, [schnittMat, schnittMat, schnittMat, schnittMat, vorsatzMat, vorsatzMatLinks], W / 2, 0, -(DECKEL / 2 + B / 2)));
    deckel.position.z = DECKEL_ZU;

    // Buchrücken: Block im geschlossenen Zustand, legt sich beim Öffnen flach
    const ruecken = new THREE.Mesh(new THREE.BoxGeometry(0.05, HB, 1), [lederMat, rueckenMat, lederMat, lederMat, lederMat, lederMat]);
    ruecken.position.set(-0.045, 0, GESAMT / 2); ruecken.scale.z = GESAMT; ruecken.castShadow = true; gruppe.add(ruecken);

    // Unsichtbarer Treffer-Körper für Maus und Finger
    const treffer = new THREE.Mesh(new THREE.BoxGeometry(W + 0.14, HB + 0.02, GESAMT + 0.02), new THREE.MeshBasicMaterial({ visible: false }));
    treffer.position.set((W - 0.04) / 2, 0, GESAMT / 2); gruppe.add(treffer);

    // Blätter: Blatt i zeigt vorne die rechte Seite von Kapitel i-1, hinten die linke Seite von Kapitel i
    const blaetter = [];
    for (let i = 0; i < N; i++) {
      const geo = new THREE.PlaneGeometry(W, H, MASSE.SEGMENTE, 1); geo.translate(W / 2, 0, 0);
      const vorne = schatten(new THREE.Mesh(geo, papierMaterial(leerTex, THREE.FrontSide)));
      const hinten = schatten(new THREE.Mesh(geo, papierMaterial(leerTex, THREE.BackSide)));
      const g = new THREE.Group(); g.add(vorne, hinten); gruppe.add(g);
      const blatt = {
        gruppe: g, geo, basis: geo.attributes.position.array.slice(), vorne, hinten,
        p: 0, pAlt: -1, zRechts: ZB + (N - i) * T, zLinks: ZB + (i + 1) * T,
        rectoCanvas: null, recto: null, verso: null, fotoRect: null,
        kapitelIndex: i - 1,              // Kapitel, dessen rechte Seite dieses Blatt vorne zeigt
      };
      g.position.z = blatt.zRechts;
      blaetter.push(blatt);
    }

    return {
      def, index, K, N, GESAMT, DECKEL_ZU, DECKEL_AUF, gruppe, deckel, ruecken, treffer, blaetter, gebaut: false,
      pose: { x: 0, y: 0, z: 0, rx: 0, ry: Math.PI / 2, rz: 0 },   // aktuelle Lage (wird animiert)
      regal: { x: 0, y: 0, z: 0 },                                  // Standplatz im Regal
      hover: 0, hoverZiel: 0,
      zustandDeckel: { r: 0, z: DECKEL_ZU }, zustandRuecken: { s: GESAMT, z: GESAMT / 2 },
    };
  }

  /* --- Seiten zeichnen und wieder freigeben --- */
  function seitenZeichnen(buch) {
    if (buch.gebaut) return; buch.gebaut = true;
    buch.blaetter.forEach((b, i) => {
      b.rectoCanvas = i === 0 ? tex.seiteInhalt(buch.def) : tex.seiteRechts(buch.def.kapitel[i - 1], i - 1, null);
      b.recto = textur(b.rectoCanvas);
      b.verso = textur(i < buch.K ? tex.seiteLinks(buch.def.kapitel[i], i) : tex.seiteSchluss());
      b.verso.wrapS = THREE.RepeatWrapping; b.verso.repeat.x = -1; b.verso.offset.x = 1;   // Rückseite spiegeln
      b.vorne.material.map = b.recto; b.hinten.material.map = b.verso;
      b.vorne.material.needsUpdate = b.hinten.material.needsUpdate = true;
    });
  }
  function seitenFreigeben(buch) {
    if (!buch.gebaut) return; buch.gebaut = false;
    buch.blaetter.forEach(b => {
      if (b.recto) b.recto.dispose(); if (b.verso) b.verso.dispose();
      b.recto = b.verso = null; b.rectoCanvas = null; b.fotoRect = null;
      b.vorne.material.map = leerTex; b.hinten.material.map = leerTex;
      b.vorne.material.needsUpdate = b.hinten.material.needsUpdate = true;
    });
  }
  function fotoEinkleben(buch, kapitelIndex, img, titel) {   // erstes Galeriebild nachträglich auf die Seite
    if (!buch.gebaut) return;
    const blatt = buch.blaetter[kapitelIndex + 1];
    tex.seiteRechts(buch.def.kapitel[kapitelIndex], kapitelIndex, { img, titel }, blatt.rectoCanvas);
    blatt.fotoRect = blatt.rectoCanvas.fotoRect || null;   // für Klick auf das Foto
    blatt.recto.needsUpdate = true;
  }

  /* --- Blatt-Geometrie für den aktuellen Umblätter-Fortschritt p (0 rechts … 1 links) --- */
  function aktualisiereBlatt(b) {
    if (b.p === b.pAlt) return; b.pAlt = b.p;
    const p = b.p, s = p * p * (3 - 2 * p);
    b.gruppe.rotation.y = -Math.PI * p;
    b.gruppe.position.z = b.zRechts + (b.zLinks - b.zRechts) * s + 0.015 * Math.sin(Math.PI * p);
    const biegung = 0.2 * Math.sin(2 * Math.PI * p);  // wölbt sich immer vom Stapel weg
    const arr = b.geo.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) arr[i + 2] = biegung * Math.sin(Math.PI * b.basis[i] / W);
    b.geo.attributes.position.needsUpdate = true;
    b.geo.computeVertexNormals();
  }

  /* --- Pose je Frame anwenden --- */
  function anwenden(b) {
    b.hover += (b.hoverZiel - b.hover) * 0.12;
    b.gruppe.position.set(b.pose.x, b.pose.y, b.pose.z + b.hover);
    b.gruppe.rotation.set(b.pose.rx, b.pose.ry, b.pose.rz);
    b.deckel.rotation.y = b.zustandDeckel.r; b.deckel.position.z = b.zustandDeckel.z;
    b.ruecken.scale.z = b.zustandRuecken.s; b.ruecken.position.z = b.zustandRuecken.z;
    b.blaetter.forEach(aktualisiereBlatt);
  }

  /* --- Schmuckloser Füllband fürs Regal --- */
  function erstelleFueller(i, farbe) {
    const dicke = 0.12 + (i % 3) * 0.04, hoehe = HB - 0.08 - (i % 2) * 0.06;
    const l = tex.lederSatz(256, 256, 300 + i, farbe, null);
    const m = new THREE.MeshStandardMaterial({ map: textur(l.farbe), bumpMap: textur(l.relief, false), bumpScale: 0.003, roughness: 0.75, envMapIntensity: 0.6 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(dicke, hoehe, W + 0.02), [m, m, m, m, m, schnittMat]);
    mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
    return { mesh, dicke, hoehe };
  }

  return { MASSE, textur, erstelleBuch, erstelleFueller, seitenZeichnen, seitenFreigeben, fotoEinkleben, anwenden };
};
