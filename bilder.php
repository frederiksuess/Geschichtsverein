<?php
/* =====================================================================
   BILDERLISTE FÜR DIE GALERIE
   Liest alle Bilder eines Ordners unter /bilder/ und gibt sie als JSON
   zurück. Aufruf durch die Website: bilder.php?ordner=1897-gruendung

   Es muss nichts konfiguriert werden. Bilder einfach per FTP in den
   passenden Ordner legen – sie erscheinen automatisch, sortiert nach
   Dateiname (deshalb am besten mit Nummern beginnen: 01_, 02_, …).

   Optionale Bildunterschriften: Datei "beschriftungen.json" im selben
   Ordner, Inhalt z. B.
   { "01_bahnhof.jpg": "Der Bahnhof um 1870", "02_markt.jpg": "Markttag" }
   Ohne Eintrag wird der Dateiname als Unterschrift verwendet
   (Nummern entfernt, Unterstriche zu Leerzeichen).

   Test: bilder.php ohne Parameter aufrufen → {"status":"ok"}
   ===================================================================== */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$ordner = isset($_GET['ordner']) ? $_GET['ordner'] : '';
if ($ordner === '') { echo json_encode(['status' => 'ok', 'php' => PHP_VERSION]); exit; }
if (!preg_match('/^[A-Za-z0-9_\-]+$/', $ordner)) { http_response_code(400); echo '[]'; exit; }

$pfad = __DIR__ . '/bilder/' . $ordner;
if (!is_dir($pfad)) { echo '[]'; exit; }

$beschriftungen = [];
$bf = $pfad . '/beschriftungen.json';
if (is_file($bf)) {
    $b = json_decode(file_get_contents($bf), true);
    if (is_array($b)) $beschriftungen = $b;
}

$dateien = scandir($pfad);
natcasesort($dateien);
$liste = [];
foreach ($dateien as $d) {
    if (!preg_match('/\.(jpe?g|png|webp|gif)$/i', $d)) continue;
    if (isset($beschriftungen[$d])) {
        $titel = $beschriftungen[$d];
    } else {
        $titel = pathinfo($d, PATHINFO_FILENAME);
        $titel = preg_replace('/^\d+[\s_\-]*/', '', $titel);
        $titel = preg_replace('/[_\-]+/', ' ', $titel);
        $titel = mb_strtoupper(mb_substr($titel, 0, 1)) . mb_substr($titel, 1);
    }
    $liste[] = ['datei' => $d, 'titel' => $titel];
}
echo json_encode(array_values($liste), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
