/* =====================================================================
   INHALTE – Geschichtsverein Helsa
   Diese Datei ist die einzige, die für Textänderungen angefasst werden
   muss. Nach dem Speichern per FTP hochladen – fertig.

   Aufbau: Im Regal stehen mehrere Bücher ("buecher"). Jedes Buch hat
   einen Einband (Titel, Farbe) und Kapitel. Die erste Seite jedes Buches
   ist automatisch das Inhaltsverzeichnis mit allen Kapiteln.

   Regeln:
   - Text steht immer zwischen Anführungszeichen "…".
   - Anführungszeichen im Text bitte als „…“ (deutsche Zeichen) schreiben,
     nicht als "…", sonst endet der Text dort.
   - Einträge werden durch Kommas getrennt, nach dem letzten Eintrag
     einer Liste darf ebenfalls ein Komma stehen.
   - Optionale Felder (galerie, zitat, quelle, untertitel) einfach
     weglassen oder die Zeile löschen.

   Die Texte wurden aus der bisherigen Vereinsseite zusammengefasst
   (Zeittafeln von Gerd Vogelsang, Herbert Brandt, Gerold Kunert).
   Stellen mit „bitte prüfen“ sind Angaben älteren Datums.
   ===================================================================== */

window.INHALT = {

  /* Name des Vereins – erscheint im Menü und auf dem Regal */
  verein: "Geschichtsverein Helsa",

  /* Erste Ansicht: das Regal */
  intro: {
    ueberschrift: "Fünf Dörfer, ein Tal, neun Jahrhunderte.",
    text: "Helsa, Wickenrode, Eschenstruth, St. Ottilien und Waldhof: Drei Bände erzählen von der Geschichte des Lossetals, vom Verein und von seinem Archiv. Nehmen Sie eines aus dem Regal.",
    hinweis: "Ein Buch auswählen",
    hinweisLesen: "Scrollen, wischen oder auf die Seite tippen, um zu blättern",
  },

  /* BÜCHER IM REGAL
     id          Kurzname ohne Leerzeichen/Umlaute (für Links)
     titel       Goldprägung auf Deckel und Rücken (kurz, max. ca. 10 Zeichen)
     untertitel  Kursive Zeile auf dem Deckel
     zeile       Kleine Zeile am unteren Deckelrand
     farbe       Lederfarbe als Hex-Code
     kapitel     Liste der Kapitel (Doppelseiten), s. u.

     Kapitel:
     jahr        Große Zahl oder kurzes Wort auf der linken Seite („1353“, „Vorstand“)
     titel       Kapitelüberschrift
     untertitel  Eine Zeile darunter (optional)
     text        Fließtext der rechten Seite (ein Absatz, ca. 300–550 Zeichen)
     zitat       Zitat unter dem Text (optional)
     quelle      Herkunft des Zitats (optional)
     galerie     Ordnername unter /bilder/ (optional). Alle Bilder darin erscheinen
                 in der Galerie, das erste als eingeklebtes Foto auf der Buchseite.
  */
  buecher: [

    /* ------------------------------------------------------------ */
    {
      id: "chronik",
      titel: "Chronik",
      untertitel: "der Gemeinde Helsa",
      zeile: "Helsa, Wickenrode, Eschenstruth, St. Ottilien und Waldhof",
      farbe: "#4a1d18",
      kapitel: [
        {
          jahr: "1126",
          titel: "Eschenstruth wird genannt",
          untertitel: "Die älteste Urkunde im Lossetal",
          text: "Am 3. Juni 1126 überträgt Erzbischof Adalbert von Mainz der Äbtissin Gisela von Kaufungen den Zehnten aus neu gerodetem Land, darunter in Eschenstruth. Vermutlich noch im selben Jahrhundert entsteht die Kirche. In der Nachbarschaft wachsen die Dörfer Rosbach und Lubesrode heran, die später wieder wüst fallen. 1398 wird mit Sifrid Oremus erstmals ein Pfarrer in Eschenstruth erwähnt, 1433 mit Heinze Scheffir ein Bürger.",
        },
        {
          jahr: "1293",
          titel: "Wickenrode und das Stift",
          untertitel: "Glashütten, Alaun und Abgaben an Kaufungen",
          text: "1293 geben die Herren von Ziegenberg Lehensrechte in Wickenrode an das Kloster Kaufungen zurück – die erste Nennung des Ortes. Über Jahrhunderte bleibt das Stift Grundherr und übt die niedere Gerichtsbarkeit aus. Am Hirschberg arbeiten seit 1507 Glashütten, 1573 entsteht ein Alaunwerk. Jeder Hausbesitzer schuldet dem Stift jährlich drei Hühner.",
          zitat: "ein Michelshahn, ein Kirmeshahn und ein Fastnachtshuhn",
          quelle: "Jährliche Abgabe jedes Hausbesitzers an das Stift Kaufungen, 1530",
        },
        {
          jahr: "1353",
          titel: "Helsa erscheint in den Akten",
          untertitel: "Landgraf Heinrich der Eiserne erlässt die Schafsteuer",
          text: "Am 3. September 1353 befreit Landgraf Heinrich II. von Hessen das Kloster Kaufungen von der Schafsteuer. In der Urkunde werden die Stiftsdörfer aufgezählt, unter ihnen Helsa, Wickenrode und Eschenstruth. 1432 ist mit Ludwig von Uschlag der erste Helsaer Pfarrer belegt. 1544 steht Anna Grompen in Helsa wegen Hexerei vor Gericht. 1619 wird die Obermühle gebaut, 1638 erstmals die Mittelmühle erwähnt.",
        },
        {
          jahr: "1634",
          titel: "Krieg im Tal",
          untertitel: "Der Dreißigjährige Krieg und die Sage vom Merten Jäger",
          text: "1634 ziehen die Truppen des Generalfeldmarschalls Götz mit ihren Kroaten durch das Lossetal und zerstören Helsa. 1643 beklagen sich die Stiftsdörfer Wickenrode, Eschenstruth, Wellerode und Helsa bei Landgräfin Amalie Elisabeth über die Kriegslasten. 1641 schließt die Gemeinde mit Merten Jäger einen Vertrag über eine Glocke; zehn Jahre später wird er in Großalmerode ermordet. Der Streit um die Glocke zieht sich bis 1668 und wird 1926 zum Helsaer Schauspiel.",
        },
        {
          jahr: "1699",
          titel: "Die Franzosen vom Ottilienberg",
          untertitel: "Hugenotten gründen St. Ottilien",
          text: "Am 11. Dezember 1699 gestattet Landgraf Karl einer Gruppe französischer Glaubensflüchtlinge, am St. Ottilienberg zu bauen. Im Jahr darauf gründen 14 Familien, 55 Menschen, auf dem Land, das Landgräfin Amalie Elisabeth 1640 von den Herren zu Meisenbug gekauft hatte, die Kolonie St. Ottilien. 1724 wird in der neuen Kirche mit Schule und Lehrerwohnung das erste Kind getauft. Erst 1827 müssen die Kirchenbücher auf Deutsch geführt werden.",
        },
        {
          jahr: "1757",
          titel: "Siebenjähriger Krieg",
          untertitel: "Franzosen, Braunschweiger und der Schuster Franz",
          text: "1757 stirbt in Wickenrode ein Viertel der Einwohner an den Folgen des Krieges. Zwei Jahre später vernichten durchziehende Franzosen das Alaunwerk in der Tiefenbach. 1760 verrät der Schuster Franz Noll den Braunschweigern, wo die in Wickenrode einquartierten Franzosen ihre Pferde halten – die Sage von der Schuster-Franz-Brücke. 1767 und 1776 ziehen junge Männer aus Wickenrode und Eschenstruth als Soldaten in den amerikanischen Unabhängigkeitskrieg. 1786 wird die neue Wickenröder Kirche eingeweiht.",
        },
        {
          jahr: "1837",
          titel: "Aufbruch ins Industriezeitalter",
          untertitel: "Die Brüder Grimm, Ringenkuhl und Ludwig Mond",
          text: "1835 gründet sich in Helsa die Liedertafel, 1837 übernachten die Brüder Grimm im Gasthof Zum Weißen Roß. In Eschenstruth blüht die Hausweberei, Siegmund Aschrott baut einen Leinengroßhandel auf. Auf Ringenkuhl wächst das Alaunwerk ab 1840 zu einer der führenden chemischen Fabriken Deutschlands: 250 Beschäftigte stellen 1842 Alaun, Sodasalz, Schwefelsäure und Kali her. 1860 arbeitet hier der junge Chemiker Ludwig Mond, der später in England ein Weltunternehmen gründet. 1880 wird die Fabrik stillgelegt.",
        },
        {
          jahr: "1879",
          titel: "Eisenbahn, Luftkurort, Strom",
          untertitel: "Das Tal rückt näher an Kassel",
          text: "Am 1. Dezember 1879 fährt der erste Zug auf der Strecke Kassel–Waldkappel; der Helsaer Bahnhof bekommt eine Gaststätte. 1892 wird Helsa Luftkurort, Verkehrs- und Touristenverein folgen, 1897 entsteht die Lewalterhütte. 1899 wird die erste öffentliche Fernsprechzelle eingerichtet, 1900 die Wasserleitung verlegt, ab 1908 fließt Strom aus dem Herkuleswerk. 1922 ernennt Helsa den hier geborenen Komponisten und Volksliedsammler Johann Lewalter zum Ehrenbürger.",
          galerie: "1879-eisenbahn",
        },
        {
          jahr: "1939",
          titel: "Hirschhagen und Waldhof",
          untertitel: "Das Sprengstoffwerk und sein Lager",
          text: "1939 beginnt oberhalb von Eschenstruth der Bau des Arbeitslagers Waldhof: 50 Häuser, ein Gemeinschaftssaal, eine Sozialstation, zwei Wachgebäude. Hier leben vor allem dienstverpflichtete Frauen und Mädchen, die im Sprengstoffwerk Hirschhagen arbeiten müssen. 1942 bringt eine Drahtseilbahn Kohle von Ringenkuhl zum Werk. Ostern 1945 wird Helsa bombardiert; Wickenrode allein trauert um 53 Gefallene und 32 Vermisste. Über die Jahre des Nationalsozialismus in der Gemeinde hat der Verein ein eigenes Buch veröffentlicht.",
        },
        {
          jahr: "1946",
          titel: "Neue Nachbarn",
          untertitel: "Vertriebene aus dem Riesengebirge und die Siedlung Waldhof",
          text: "Am 10. Mai 1946 kommen 500 Vertriebene aus dem Riesengebirge nach Helsa und finden in Motorsportschule und Baracken ein erstes Dach; 290 weitere Menschen nimmt Wickenrode auf. Das Lager Waldhof dient nach dem Krieg erst amerikanischen Soldaten, dann als Lager für Verschleppte aus den besetzten Ländern. 1949 wird es zur ersten geschlossenen Flüchtlingssiedlung des Landes Hessen ausgebaut und am 30. November eingeweiht. 1952 erhält Helsa, 1956 Waldhof eine katholische Kirche.",
        },
        {
          jahr: "1972",
          titel: "Eine Gemeinde, fünf Ortsteile",
          untertitel: "Gebietsreform, Denkmalschutz und Straßenbahn",
          text: "1970 schließen sich Helsa und Wickenrode freiwillig zusammen, am 1. August 1972 kommen Eschenstruth mit Waldhof und St. Ottilien hinzu. Als die Gemeindevertretung den Abriss von Schenke, Bürgermeisteramt und Fachwerkhäusern beschließt, gründet sich 1975 die Aktionsgemeinschaft Erhaltung Alt Helsa – mit Erfolg: Der Ortskern wird unter Denkmalschutz gestellt. 2001 fährt die Straßenbahn von Kassel bis Helsa, 2006 weiter bis Hessisch Lichtenau.",
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: "verein",
      titel: "Der Verein",
      untertitel: "Geschichtsverein Helsa seit 1990",
      zeile: "Helsa, Wickenrode, Eschenstruth, St. Ottilien und Waldhof",
      farbe: "#1f3a2c",
      kapitel: [
        {
          jahr: "1990",
          titel: "Vom Arbeitskreis zum Verein",
          untertitel: "Geschichtsfreunde aus allen Ortsteilen",
          text: "1990 finden sich Geschichtsinteressierte aus Helsa, Wickenrode, Eschenstruth, Waldhof und St. Ottilien zu einem Arbeitskreis zusammen; 1991 wird daraus der Geschichtsverein Helsa. Ziel ist es, Fotos, Akten und Erinnerungen aus allen Ortsteilen zu sammeln, zu ordnen und zugänglich zu machen, bevor sie verloren gehen. Heute zählt der Verein rund 130 Mitglieder und betreut im Gemeindezentrum ein eigenes Archiv.",
        },
        {
          jahr: "Vorstand",
          titel: "Wer den Verein führt",
          untertitel: "Vorstand und Ansprechpartner",
          text: "An der Spitze des Vereins stehen der 1. Vorsitzende Gerd Vogelsang und der 2. Vorsitzende Josef Purmann. Inge Vogelsang führt die Kasse, Elisabeth Kottik das Protokoll. Archivar ist Werner Noll, sein Stellvertreter Karlheinz Müller; um die EDV kümmert sich Gerold Kunert. Als Beisitzer vertreten Reiner Diederich (Eschenstruth) und Peter Sandrock (Wickenrode) die Ortsteile. Bitte prüfen: Diese Angaben stammen aus dem Jahr 2017.",
        },
        {
          jahr: "Termine",
          titel: "Stammtisch, Advent und Duggefett",
          untertitel: "Das Vereinsjahr",
          text: "Jeden ersten Donnerstag im Monat treffen sich Mitglieder und Gäste um 19.30 Uhr zum Historischen Stammtisch im Vereinslokal Goldener Adler in Wickenrode: mal mit Referat, mal einfach zum Schnuddeln. Zu Jahresbeginn lädt der Verein zum Duggefett-Essen in die Gemeindeschenke, im Advent werden bei Kerzenschein und Glühwein Geschichten und Schauergeschichten erzählt, zum Jahresende gibt es das Gänseessen. Dazu kommen Exkursionen zu historischen Orten der Region und Tagesfahrten.",
        },
        {
          jahr: "Vorträge",
          titel: "Referate am Stammtisch",
          untertitel: "Vom Blutgericht bis zum Bergbau",
          text: "Die Themen der Stammtisch-Referate reichen weit: das Eschenstruther Blutgericht und der Mord in der Schenke 1611, der Protest der Wickenröder gegen den Kaufunger Stiftsvogt, Räubergeschichten und historische Straßen Nordhessens, der historische Bergbau und die Geologie des Hirschbergs, das Munitionswerk Hirschhagen, die Schanzanlagen auf dem Großen Stubberg, die Mühle Most – und die Frage, warum Wickenrode nie einen Eisenbahnanschluss bekam. Referenten sind Vereinsmitglieder und Gäste.",
        },
        {
          jahr: "Ausstellen",
          titel: "Nach außen wirken",
          untertitel: "Ausstellungen, Tag der Archive, Führungen",
          text: "Mit Sonderausstellungen und beim bundesweiten Tag der Archive stellt der Verein seine Arbeit vor. Bilderausstellungen zeigten unter anderem 100 Jahre Schwimmbad Helsa, den Wickenröder Ortsteil Ringenkuhl und 100 Jahre Genese. Vorträge behandelten den Sälzer Weg und die Altstädter Hütte, eine Busfahrt führte zur Gedenkstätte Mittelbau-Dora. Auf Anfrage werden Führungen durch das ehemalige Sprengstoffwerk Hirschhagen angeboten.",
        },
        {
          jahr: "Mitglied",
          titel: "Mitmachen",
          untertitel: "Jede Erinnerung zählt",
          text: "Mitglied kann jeder werden, der sich für die Geschichte der Gemeinde interessiert – ob aktiv beim Sichten alter Fotos, bei Führungen und am Stammtisch oder als förderndes Mitglied. Der Jahresbeitrag beträgt 13 Euro für Einzelpersonen und 16 Euro für Ehepaare (bitte prüfen). Anmeldung und Fragen: kontakt@geschichtsverein-helsa.de oder mittwochs vormittags persönlich im Archiv.",
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: "archiv",
      titel: "Das Archiv",
      untertitel: "Fotos, Akten und Schriften",
      zeile: "Gemeindezentrum Helsa, Berliner Straße 20",
      farbe: "#243049",
      kapitel: [
        {
          jahr: "Bestand",
          titel: "Was im Archiv liegt",
          untertitel: "8000 Fotos, 1000 Akten, zwei Vitrinen",
          text: "Herzstück des Vereins ist das historische Archiv im Gemeindezentrum. Rund 8000 Fotos und Dias aus allen Lebensbereichen der Ortsteile sind digital gespeichert und abrufbar. Über 1000 Akten, Urkunden und Aufzeichnungen sind in einer digitalen Suchkartei erschlossen und können direkt in die Hand genommen werden. In zwei Vitrinen sind besondere Fundstücke ausgestellt.",
        },
        {
          jahr: "Besuch",
          titel: "Öffnungszeiten",
          untertitel: "Mittwochs im Gemeindezentrum",
          text: "Das Archiv steht jeden Mittwoch von 9 bis 12 Uhr allen Interessierten offen, weitere Termine nach Vereinbarung. Wer etwas über die eigene Familie, das eigene Haus oder ein Ereignis in den Ortsteilen wissen möchte, wird von den Archivaren bei der Suche unterstützt. Adresse: Gemeindezentrum, Berliner Straße 20, 34298 Helsa. Telefon 05605 8065355.",
        },
        {
          jahr: "Hefte",
          titel: "Publikationen",
          untertitel: "Rund fünfzig ortsbezogene Broschüren",
          text: "Mitglieder des Vereins haben bislang rund fünfzig Broschüren mit historischem Hintergrund veröffentlicht, darunter Arbeiten zur Industrialisierung in Helsa und zu den letzten Kriegsjahren. Mit Unterstützung des Landkreises erschien ein Buch über die nationalsozialistischen Jahre der Gemeinde Helsa von Gerd Vogelsang und Gerold Kunert. Es kostet 15 Euro und ist im Bürgerbüro des Rathauses oder über den Verein erhältlich. Eine vollständige Titelliste erhalten Sie im Archiv.",
        },
        {
          jahr: "Fotos",
          titel: "Bilder aus fünf Dörfern",
          untertitel: "Die Fotosammlung",
          text: "Dorfansichten, Vereinsfeste, Schulklassen, Hochwasser, Kirmes und Alltag: Die Fotosammlung dokumentiert das Leben in Helsa, Wickenrode, Eschenstruth, St. Ottilien und Waldhof über mehr als ein Jahrhundert. Wer alte Aufnahmen besitzt, kann sie dem Archiv zum Einscannen überlassen – die Originale gehen zurück an die Besitzer.",
          galerie: "archiv-fotos",
        },
        {
          jahr: "Geben",
          titel: "Dem Archiv anvertrauen",
          untertitel: "Fotos, Urkunden, Erinnerungen",
          text: "Auf Dachböden und in Schubladen schlummern noch viele Zeugnisse der Ortsgeschichte: Fotoalben, Urkunden, Briefe, Vereinsunterlagen, Zeitungsausschnitte. Der Verein nimmt solche Stücke gern als Leihgabe oder Schenkung entgegen, digitalisiert sie und macht sie in der Suchkartei auffindbar. Ein Anruf oder ein Besuch mittwochs vormittags genügt.",
        },
      ],
    },
  ],

  /* Schlussseite jedes Buches: darunter werden automatisch die anderen Bücher angeboten */
  schluss: {
    ueberschrift: "Weiterlesen?",
    kontakt: [
      "Geschichtsverein Helsa",
      "Berliner Straße 20 (Gemeindezentrum), 34298 Helsa",
      "Telefon 05605 8065355",
      "kontakt@geschichtsverein-helsa.de",
    ],
    aktion: { text: "Mitglied werden", link: "mailto:kontakt@geschichtsverein-helsa.de?subject=Mitgliedschaft%20im%20Geschichtsverein%20Helsa" },
  },

  /* Pflichtangaben – die beiden Seiten liegen als impressum.html und
     datenschutz.html im Hauptordner und müssen ausgefüllt werden. */
  rechtliches: [
    { text: "Impressum", link: "impressum.html" },
    { text: "Datenschutz", link: "datenschutz.html" },
  ],

  /* Optionale Oberflächen. Liegt die Datei nicht auf dem Server, wird
     automatisch eine berechnete Oberfläche verwendet. */
  texturen: {
    leder: "texturen/leder.jpg",     // Einbände (werden je Buch eingefärbt)
    papier: "texturen/papier.jpg",   // Buchseiten
    holz: "texturen/holz.jpg",       // Regal
  },
};
