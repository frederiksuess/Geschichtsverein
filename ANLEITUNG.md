# Chronik – Anleitung

Diese Website zeigt ein Bücherregal. Jedes Buch steht für einen Bereich (Chronik, Verein, Archiv), lässt sich aus dem Regal ziehen und wird beim Scrollen durchgeblättert; die erste Seite ist immer das Inhaltsverzeichnis. Alle Texte, Bilder und Pflichtangaben lassen sich ohne Programmierkenntnisse austauschen: Dateien per FTP ersetzen, fertig.

## 1. Was ist in dem Ordner?

```
chronik/
├── index.html          Die Website (muss nicht bearbeitet werden)
├── impressum.html      Pflichtseite – AUSFÜLLEN
├── datenschutz.html    Pflichtseite – AUSFÜLLEN
├── bilder.php          Liest die Bildordner für die Galerie aus (siehe Abschnitt 5)
├── ANLEITUNG.md        Diese Anleitung
├── css/
│   └── stil.css        Gestaltung
├── js/
│   ├── inhalt.js       ALLE TEXTE – die wichtigste Datei für Sie
│   ├── chronik.js      Hauptprogramm: Abläufe, Scroll-Steuerung (nicht bearbeiten)
│   ├── szene.js        Raum, Licht, Regal, Kamera
│   ├── buch.js         3D-Aufbau der Bücher
│   ├── texturen.js     Zeichnet Seiten, Leder und Holz
│   ├── oberflaeche.js  Menü, Randnotizen, Galerie, Lightbox
│   └── vendor/         three.js und GSAP (Bibliotheken, nicht anfassen)
├── fonts/              Schriften, selbst gehostet (datenschutzkonform)
├── bilder/             Ein Unterordner je Bildergalerie
│   ├── 1879-eisenbahn/
│   └── archiv-fotos/
└── texturen/           Optional: eigene Fotos für Leder, Papier, Holz
```

## 2. Auf den Server bringen (FTP)

1. Ein FTP-Programm öffnen (z. B. FileZilla, kostenlos) und mit den Zugangsdaten des Hosting-Anbieters verbinden.
2. In das Webverzeichnis wechseln. Es heißt je nach Anbieter `httpdocs`, `html`, `public_html`, `www` oder `htdocs`.
3. Den **gesamten Inhalt** des Ordners `chronik` dorthin hochladen (also `index.html`, die Ordner `css`, `js`, `fonts`, `bilder`, `texturen` usw.).
4. Die Domain im Browser aufrufen. Die Chronik sollte sofort erscheinen.

Soll die Chronik unter einer Unteradresse laufen, z. B. `www.verein.de/chronik/`, den Ordner `chronik` einfach komplett in das Webverzeichnis legen. Alle Pfade sind relativ, es muss nichts angepasst werden.

**Voraussetzungen:** Jeder normale Webspace reicht. Es werden keine Datenbank und keine besonderen Module benötigt. Für die automatische Bildergalerie sollte PHP aktiv sein (bei praktisch allen deutschen Anbietern Standard). Ohne PHP funktioniert die Galerie ebenfalls, dann mit einer kleinen Liste pro Ordner (siehe 5c).

**Wichtig: Ordnerstruktur beibehalten.** Die Ordner `css`, `js`, `fonts`, `bilder` und `texturen` müssen als Ordner auf dem Server liegen. Liegen alle Dateien lose im Hauptordner, erscheint die Seite ungestaltet und bleibt bei „Das Regal wird eingeräumt …“ stehen. FTP-Programme wie FileZilla übertragen Ordner automatisch richtig, wenn man die Ordner selbst (nicht nur ihren Inhalt) hochzieht. Den Ordneraufbau prüfen: `www.ihre-domain.de/css/stil.css` muss die Stildatei anzeigen.

**Testbetrieb auf GitHub Pages:** funktioniert ebenfalls, allerdings ohne PHP. Die Galerien nutzen dann automatisch die Listen `bilder.json` (siehe 5c). Hochladen am besten vom Computer: auf github.com unter „Add file › Upload files“ die Ordner und Dateien aus dem Ordner `chronik` per Ziehen ablegen – die Ordner bleiben dabei erhalten. Vom Smartphone aus lassen sich auf GitHub keine Ordner hochladen.

## 3. Texte ändern

Alle Texte stehen in **`js/inhalt.js`**. Die Datei mit einem Texteditor öffnen (Windows: Editor oder besser Notepad++; Mac: TextEdit im Modus „Reiner Text“), ändern, speichern, per FTP hochladen und `js/inhalt.js` auf dem Server überschreiben.

Die Datei ist kommentiert. Die wichtigsten Regeln:

- Text steht immer zwischen geraden Anführungszeichen: `"So wie hier"`.
- Anführungszeichen **im** Text als deutsche Zeichen schreiben: `„Zitat“`. Gerade Anführungszeichen `"` würden den Text vorzeitig beenden.
- Jeder Eintrag endet mit einem Komma.
- Zeilenumbrüche im Text sind nicht nötig, der Text bricht automatisch um.
- Wer unsicher ist: Datei vor dem Ändern kopieren und als Sicherung behalten.

### Aufbau: Bücher und Kapitel

Unter `buecher: [ … ]` steht jedes Buch im Regal als eigener Block:

```js
    {
      id: "verein",                              // Kurzname für Links (index.html#verein)
      titel: "Der Verein",                       // Goldprägung auf Deckel und Rücken
      untertitel: "Geschichtsverein Helsa seit 1990",
      zeile: "Helsa, Wickenrode, Eschenstruth, St. Ottilien und Waldhof",
      farbe: "#1f3a2c",                          // Lederfarbe
      kapitel: [ … ],
    },
```

Ein viertes Buch hinzufügen: einen Block kopieren, Titel, Farbe und Kapitel anpassen. Das Regal rückt die Bände automatisch zusammen. Der `titel` sollte kurz bleiben (bis etwa 10 Zeichen), damit er auf den Buchrücken passt. Die `farbe` ist ein Hex-Code, zum Beispiel `#4a1d18` (Oxblutrot), `#1f3a2c` (Tannengrün), `#243049` (Nachtblau), `#5a3a1a` (Braun).

### Ein Kapitel hinzufügen

Innerhalb von `kapitel: [ … ]` eines Buches einen bestehenden Block kopieren und zwischen zwei Blöcken einfügen:

```js
        {
          jahr: "1712",
          titel: "Der große Brand",
          untertitel: "Zwei Drittel der Altstadt in Schutt und Asche",
          text: "In der Nacht zum 4. August 1712 …",
          zitat: "Nur der Kirchturm stand noch.",       // optional
          quelle: "Ratsprotokoll vom 6. August 1712",   // optional
          galerie: "1712-brand",                        // optional, siehe Abschnitt 5
        },
```

Die Reihenfolge in der Datei ist die Reihenfolge im Buch. Inhaltsverzeichnis, Scrollweg und Menü passen sich automatisch an. Ein Kapitel entfernen: den Block (von `{` bis `},`) löschen.

Das Feld `jahr` muss keine Zahl sein – im Vereins- und Archivbuch stehen dort Stichworte wie „Vorstand“ oder „Termine“. Kurze Wörter wirken am besten; längere werden automatisch kleiner gesetzt.

### Textlänge

Der Text eines Kapitels sollte etwa 300 bis 550 Zeichen haben, damit er auf die rechte Buchseite passt. Ist ein Foto zugeordnet, bleibt bei kürzeren Texten mehr Platz dafür. Längere Texte werden auf der Buchseite abgeschnitten, in der Randnotiz neben dem Buch aber vollständig angezeigt.

## 4. Regal, Schluss und Pflichtangaben

Ebenfalls in `js/inhalt.js`:

- `verein`: Name im Menü.
- `intro`: Überschrift und Text am Regal sowie die beiden Scroll-Hinweise.
- `schluss`: Überschrift am Ende jedes Buches, Adresszeilen und der Knopf („Mitglied werden“). Darunter werden automatisch die anderen Bücher angeboten. Der `link` kann eine E-Mail-Adresse (`mailto:…`) oder eine Internetadresse (`https://…`) sein.
- `rechtliches`: Verweise auf Impressum und Datenschutz.

Direktlinks: `index.html#chronik`, `index.html#verein`, `index.html#archiv` öffnen das jeweilige Buch sofort (die `id` des Buches).

## 5. Bildergalerie

Jedes Kapitel kann eine Bildergalerie haben. Besucher öffnen sie über den Knopf „Bilder ansehen“ in der Randnotiz neben der Buchseite. Das erste Bild erscheint zusätzlich als eingeklebtes Foto auf der Buchseite.

### a) Ordner anlegen

Im Ordner `bilder/` einen Unterordner anlegen, z. B. `bilder/1712-brand/`. Erlaubt sind Buchstaben, Zahlen, Bindestrich und Unterstrich – keine Leerzeichen, keine Umlaute.

Dem Kapitel in `js/inhalt.js` den Ordnernamen zuweisen:

```js
      galerie: "1712-brand",
```

### b) Bilder hochladen

Bilder einfach per FTP in den Ordner legen. Sie erscheinen automatisch, sortiert nach Dateiname. Deshalb am besten durchnummerieren:

```
01_rathaus_vor_dem_brand.jpg
02_wiederaufbau_1715.jpg
03_gedenktafel.jpg
```

Erlaubte Formate: JPG, PNG, WEBP, GIF. Empfehlung: längste Seite 1600 bis 2000 Pixel, JPG-Qualität 80, unter 500 KB pro Bild. Große Originale vorher verkleinern (z. B. mit IrfanView, Vorschau am Mac oder squoosh.app).

**Bildunterschrift** ohne weiteres Zutun: Der Dateiname ohne Nummer und Endung, Unterstriche werden zu Leerzeichen. Aus `02_wiederaufbau_1715.jpg` wird „Wiederaufbau 1715“.

**Eigene Bildunterschriften:** Im Bildordner eine Datei `beschriftungen.json` anlegen:

```json
{
  "01_rathaus_vor_dem_brand.jpg": "Das alte Rathaus, Zeichnung von 1700",
  "03_gedenktafel.jpg": "Gedenktafel am Marktplatz, aufgestellt 1912"
}
```

Bilder ohne Eintrag erhalten weiterhin die automatische Unterschrift.

### c) Falls PHP nicht verfügbar ist

Ob PHP läuft, zeigt der Aufruf von `www.ihre-domain.de/bilder.php` im Browser. Erscheint `{"status":"ok", …}`, ist alles in Ordnung. Erscheint stattdessen der Programmtext oder ein Download, ist PHP nicht aktiv. Dann in jeden Bildordner eine Datei `bilder.json` legen, die die Bilder aufzählt:

```json
[
  { "datei": "01_rathaus_vor_dem_brand.jpg", "titel": "Das alte Rathaus" },
  { "datei": "02_wiederaufbau_1715.jpg", "titel": "Wiederaufbau 1715" }
]
```

Ein Beispiel liegt in `bilder/1879-eisenbahn/bilder.json`. Diese Liste wird nur verwendet, wenn PHP nicht antwortet.

## 6. Oberflächen des Buches (optional)

Das Buch wird mit berechneten Oberflächen gezeichnet (Leder mit Narbung, Pergament, Holztisch). Wer echte Fotos verwenden möchte, legt sie in den Ordner `texturen/`:

| Datei | Verwendung |
|---|---|
| `texturen/leder.jpg` | Einband und Buchrücken (Goldprägung wird darübergelegt) |
| `texturen/papier.jpg` | Buchseiten (Text wird darübergelegt) |
| `texturen/holz.jpg` | Tischplatte |

Empfehlung: quadratisch, nahtlos kachelbar, ca. 1024 × 1024 Pixel, JPG. Kostenlose, frei nutzbare Oberflächen gibt es z. B. bei ambientcg.com oder polyhaven.com (Lizenz CC0). Fehlt eine Datei, wird automatisch die berechnete Oberfläche genutzt.

## 7. Impressum und Datenschutz

`impressum.html` und `datenschutz.html` sind Vorlagen mit Platzhaltern. Beide im Texteditor öffnen und die kursiv bzw. farbig hervorgehobenen Stellen ersetzen. Für Vereine sind Impressum (§ 5 DDG) und Datenschutzerklärung verpflichtend.

Die Website selbst ist datensparsam aufgebaut: keine Cookies, keine Google-Schriften, keine externen Skripte, keine Besucherstatistik. In der Datenschutzerklärung muss daher im Wesentlichen nur der Hosting-Anbieter eingetragen werden.

## 8. Farben und Gestaltung (optional)

Grundfarben stehen am Anfang von `css/stil.css` im Block `:root` (Hintergrund, Pergament, Gold, Textfarben). Die Farben des 3D-Buches selbst (Lederton, Papierton) stehen in `js/chronik.js` in den Funktionen `lederSatz` und `pergament`.

## 9. Bedienung für Besucher

- **Blättern:** Scrollen oder Wischen (links = vor, rechts = zurück); ein Tipp auf die rechte Buchseite blättert vor, auf die linke zurück. Ein Klick auf ein eingeklebtes Foto öffnet die Galerie.
- **Buch auswählen:** Klick oder Tipp auf ein Buch im Regal, auf einen der Knöpfe unter der Überschrift oder auf einen Buchtitel im Menü.
- **Scrollen** oder Wischen blättert durch das Buch. Die erste Seite ist das Inhaltsverzeichnis – ein Klick auf einen Eintrag blättert direkt zum Kapitel.
- **Menü oben:** Buchtitel wechseln das Buch, „Zurück ins Regal“ stellt es zurück (auch mit der Esc-Taste). Auf schmalen Bildschirmen öffnet „Inhalt“ ein Verzeichnis mit Kapiteln und Büchern.
- **Bilder ansehen:** öffnet die Galerie. Pfeiltasten, Wischen und die Vorschauleiste wechseln das Bild, Esc oder × schließt.
- Besucher mit der Systemeinstellung „Bewegung reduzieren“ sehen das Buch ohne Nachlauf-Effekte.

## 10. Wenn etwas nicht klappt

| Problem | Ursache und Lösung |
|---|---|
| Nach einer Textänderung ist die Seite leer oder zeigt den alten Stand | Tippfehler in `inhalt.js` (meist ein fehlendes Komma oder Anführungszeichen). Letzte Änderung prüfen oder Sicherungskopie zurückspielen. Außerdem Browser-Cache leeren (Strg + F5). |
| Galerie-Knopf erscheint nicht | Ordnername in `galerie:` stimmt nicht mit dem Ordner unter `bilder/` überein, oder der Ordner enthält keine Bilder. Groß-/Kleinschreibung beachten. |
| Galerie leer, obwohl Bilder im Ordner liegen | PHP nicht aktiv (Test siehe 5c) → `bilder.json` anlegen. |
| Buch bleibt schwarz, „Die Chronik wird aufgeschlagen“ verschwindet nicht | Ordner `js/vendor` oder `fonts` wurde nicht mit hochgeladen. Alle Ordner vollständig übertragen. |
| Umlaute werden falsch angezeigt | Datei wurde nicht als UTF-8 gespeichert. Im Editor beim Speichern „UTF-8“ wählen. |

Technische Basis: three.js r128 (MIT-Lizenz), GSAP 3.12 mit ScrollTrigger (Standardlizenz, für diese Nutzung kostenlos), Schriften Alegreya und Alegreya Sans (SIL Open Font License, siehe `fonts/`).
