/* =====================================================================
   MODUL SZENE
   Renderer, Licht, Umgebungsreflexionen, Regal, Staub und die
   bildschirmabhängige Kameraeinstellung. Weiß nichts von Büchern,
   Scrollen oder HTML – es stellt den Raum bereit.
   ===================================================================== */
"use strict";
window.Chronik = window.Chronik || {};

window.Chronik.erstelleSzene = function erstelleSzene({ THREE, canvas, mobil, tex, reduzierteBewegung }) {
  const { HB } = window.Chronik.BUCHMASSE;
  const textur = (c, farbraum = true) => { const t = new THREE.CanvasTexture(c); if (farbraum) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };

  const RAUMFARBE = 0x1b120d;

  /* ---------- Renderer und Kamera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobil ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(RAUMFARBE);
  scene.fog = new THREE.Fog(RAUMFARBE, 5, 12);
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 60);

  /* Umgebungsreflexionen: dunkler Raum mit warmem Fenster und Kerzenlicht */
  {
    const raum = new THREE.Scene();
    raum.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 12), new THREE.MeshBasicMaterial({ color: 0x1e130d, side: THREE.BackSide })));
    const flaeche = (w, h, farbe, x, y, z) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: farbe }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); raum.add(m);
    };
    flaeche(4, 5, 0xffe4bf, 3, 4, 4);        // Fenster
    flaeche(6, 3, 0x5a4030, -5, 2, 1);       // Aufhellung
    flaeche(1, 1.5, 0xffb070, -3, 1.5, 3);   // Kerze
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(raum, 0.03).texture; pmrem.dispose();
  }

  /* ---------- Licht ---------- */
  scene.add(new THREE.AmbientLight(0x6b5440, 0.6));
  const sonne = new THREE.DirectionalLight(0xffe3bb, 1.5);
  sonne.position.set(1.6, 3.2, 2.8); sonne.castShadow = true;
  sonne.shadow.mapSize.set(mobil ? 1024 : 2048, mobil ? 1024 : 2048);
  sonne.shadow.camera.left = sonne.shadow.camera.bottom = -3;
  sonne.shadow.camera.right = sonne.shadow.camera.top = 3;
  sonne.shadow.camera.near = 0.5; sonne.shadow.camera.far = 10; sonne.shadow.bias = -0.0012; sonne.shadow.normalBias = 0.01;
  scene.add(sonne);
  const kerze = new THREE.PointLight(0xffb070, 0.8, 8, 2);
  kerze.position.set(-1.8, 1.2, 1.8); scene.add(kerze);

  /* ---------- Holz: Boden und Regal ---------- */
  const holz = tex.holzSatz();
  const holzTex = textur(holz.farbe), holzRel = textur(holz.relief, false);
  [holzTex, holzRel].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); });
  const holzMat = new THREE.MeshStandardMaterial({ map: holzTex, bumpMap: holzRel, bumpScale: 0.01, roughness: 0.68, metalness: 0.02, envMapIntensity: 0.6 });
  const holzMatDunkel = holzMat.clone(); holzMatDunkel.color = new THREE.Color(0x8a7a6a);
  const bodenTex = holzTex.clone(); bodenTex.repeat.set(10, 10); bodenTex.needsUpdate = true;
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: bodenTex, roughness: 0.8, envMapIntensity: 0.3 }));
  boden.rotation.x = -Math.PI / 2; boden.position.y = -1.9; boden.receiveShadow = true; scene.add(boden);

  const REGAL = {
    Y: -HB / 2 - 0.001,      // Oberkante des Bretts, auf dem die Bücher stehen
    HALBBREITE: 1.75,
    TIEFE: 1.5,
    MITTE_Z: -0.45,          // Mitte der Bretter in der Tiefe
    FRONT_Z: -0.04,          // Vorderkante der Buchrücken
    FACH: HB + 0.4,          // Höhe eines Fachs
  };
  const regal = new THREE.Group(); scene.add(regal);
  const brett = (w, h, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || holzMat);
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; regal.add(m); return m;
  };
  {
    const { Y, HALBBREITE: RB, TIEFE, MITTE_Z, FACH } = REGAL;
    const breite = RB * 2 + 0.1;
    [-1, 0, 1, 2].forEach(f => brett(breite, 0.06, TIEFE, 0, Y - 0.03 + f * FACH, MITTE_Z));                  // Böden der Fächer
    [-1, 0, 1].forEach(f => {                                                                                   // Seitenwände je Fach
      brett(0.06, FACH, TIEFE, -RB - 0.02, Y + FACH / 2 + f * FACH - 0.03, MITTE_Z);
      brett(0.06, FACH, TIEFE, RB + 0.02, Y + FACH / 2 + f * FACH - 0.03, MITTE_Z);
    });
    brett(breite, FACH * 3, 0.04, 0, Y + FACH / 2, MITTE_Z - TIEFE / 2 - 0.02, holzMatDunkel);                  // Rückwand
  }

  /* ---------- Staub im Licht ---------- */
  const staubAnzahl = mobil ? 160 : 420;
  const staubPos = new Float32Array(staubAnzahl * 3);
  for (let i = 0; i < staubAnzahl; i++) { staubPos[i * 3] = (Math.random() - 0.5) * 6; staubPos[i * 3 + 1] = Math.random() * 4 - 1.5; staubPos[i * 3 + 2] = (Math.random() - 0.5) * 4 + 0.5; }
  const staubGeo = new THREE.BufferGeometry(); staubGeo.setAttribute("position", new THREE.BufferAttribute(staubPos, 3));
  scene.add(new THREE.Points(staubGeo, new THREE.PointsMaterial({ color: 0xffdcb0, size: 0.013, transparent: true, opacity: 0.5, depthWrite: false })));
  function staubBewegen(t) {
    if (reduzierteBewegung) return;
    const arr = staubGeo.attributes.position.array;
    for (let i = 0; i < staubAnzahl; i++) {
      arr[i * 3 + 1] += 0.0006 + 0.0004 * Math.sin(t + i);
      arr[i * 3] += 0.0004 * Math.cos(t * 0.6 + i * 0.3);
      if (arr[i * 3 + 1] > 2.5) arr[i * 3 + 1] = -1.5;
    }
    staubGeo.attributes.position.needsUpdate = true;
  }

  /* ---------- Kamera: Bildausschnitt je nach Seitenverhältnis und Ansicht ---------- */
  /* Rückgabe: zielFaktor (Abstandsfaktor), seitwaerts (Versatz im Querformat), hochVersatz (Hochformat) */
  const framing = { hochformat: false, seitwaerts: 0, hochVersatz: 0, zielFaktor: 1, abstandFaktor: 1 };
  const GRUNDABSTAND = 2.9, GRUND_HALBWINKEL = 21 * Math.PI / 180;
  function berechneFraming(ansicht) {                   // ansicht: "regal" | "lesen"
    const aspekt = innerWidth / innerHeight;
    const hochformat = aspekt < 1.1;
    let breite, hoehe;                                   // halbe sichtbare Breite/Höhe, die mindestens hineinpassen muss
    if (ansicht === "regal") { breite = hochformat ? 1.0 : 1.85; hoehe = hochformat ? 1.9 : 1.2; }
    else if (hochformat) { breite = 1.15; hoehe = 2.0; }
    else { breite = 1.95; hoehe = 0.95; }
    const E = Math.max(hoehe, breite / aspekt);
    framing.hochformat = hochformat;
    framing.zielFaktor = E / (GRUNDABSTAND * Math.tan(GRUND_HALBWINKEL));
    framing.seitwaerts = hochformat ? 0 : 0.72;
    framing.hochVersatz = hochformat ? 0.42 * E : 0;
  }
  function groesse() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }
  groesse();

  const zielVektor = new THREE.Vector3();
  function kameraAnwenden(kam, ziel, layout) {           // kam/ziel: {x,y,z}; layout 0 = mittig, 1 = Platz für Text
    framing.abstandFaktor += (framing.zielFaktor - framing.abstandFaktor) * 0.08;
    const f = framing.abstandFaktor;
    camera.position.set(ziel.x + (kam.x - ziel.x) * f, ziel.y + (kam.y - ziel.y) * f, ziel.z + (kam.z - ziel.z) * f);
    camera.lookAt(ziel.x + framing.seitwaerts * layout, ziel.y - framing.hochVersatz * layout, ziel.z);
    const d = camera.position.distanceTo(zielVektor.set(ziel.x, ziel.y, ziel.z));
    scene.fog.near = d + 1.6; scene.fog.far = d + 9;
  }
  function lichtSetzen(faktor) { sonne.intensity = 1.5 * faktor; kerze.intensity = 0.8 * faktor; }
  function rendern() { renderer.render(scene, camera); }

  return { renderer, scene, camera, REGAL, framing, berechneFraming, groesse, kameraAnwenden, lichtSetzen, staubBewegen, rendern };
};
