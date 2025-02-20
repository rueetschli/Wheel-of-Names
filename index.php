<?php
// index.php – Haupt-Datei der Webanwendung "Wheel of Names - Modern Edition"

// Pfad zur JSON-Datenbank (Schreibrechte beachten!)
$wheelsFile = __DIR__ . '/wheels.json';
$wheels = array();
if(file_exists($wheelsFile)){
    $data = file_get_contents($wheelsFile);
    if($data){
        $wheels = json_decode($data, true);
    }
}

// Cleanup Job: Lösche Räder, die länger als 7 Tage (604800 Sekunden) nicht genutzt wurden
$changed = false;
$now = time();
foreach($wheels as $uuid => $wheel) {
    if(isset($wheel['lastUsage']) && ($now - $wheel['lastUsage'] > 604800)){
        unset($wheels[$uuid]);
        $changed = true;
    }
}
if($changed){
    file_put_contents($wheelsFile, json_encode($wheels), LOCK_EX);
}

// AJAX-Endpunkte
if(isset($_GET['action'])){
    $action = $_GET['action'];
    if($action == 'save' && $_SERVER['REQUEST_METHOD'] === 'POST'){
        $uuid = $_POST['uuid'];
        $text = $_POST['text'];
        $mode = intval($_POST['mode']);
        $results = isset($_POST['results']) ? json_decode($_POST['results'], true) : array();
        
        // Text parsen (Trennzeichen: Enter, Komma, Semikolon)
        $entries = preg_split("/[\r\n,;]+/", $text);
        $entries = array_filter(array_map('trim', $entries));
        $wheels[$uuid] = array(
            'uuid'      => $uuid,
            'text'      => $text,
            'entries'   => array_values($entries),
            'results'   => $results,
            'mode'      => $mode,
            'lastUsage' => $now
        );
        file_put_contents($wheelsFile, json_encode($wheels), LOCK_EX);
        header('Content-Type: application/json');
        echo json_encode(array('status' => 'ok'));
        exit;
    }
    if($action == 'load' && isset($_GET['uuid'])){
        $uuid = $_GET['uuid'];
        if(isset($wheels[$uuid])){
            header('Content-Type: application/json');
            echo json_encode($wheels[$uuid]);
        } else {
            // Neues Rad anlegen, falls nicht vorhanden
            $newWheel = array(
                'uuid'      => $uuid,
                'text'      => '',
                'entries'   => array(),
                'results'   => array(),
                'mode'      => 1,
                'lastUsage' => $now
            );
            $wheels[$uuid] = $newWheel;
            file_put_contents($wheelsFile, json_encode($wheels), LOCK_EX);
            header('Content-Type: application/json');
            echo json_encode($newWheel);
        }
        exit;
    }
}

// Prüfe, ob in der URL eine UUID vorhanden ist – falls nicht, generiere eine neue
if(!isset($_GET['uuid'])){
    $newUuid = uniqid();
    header("Location: index.php?uuid=" . $newUuid);
    exit;
} else {
    $uuid = $_GET['uuid'];
    if(isset($wheels[$uuid])){
        $currentWheel = $wheels[$uuid];
    } else {
        $currentWheel = array(
            'uuid'      => $uuid,
            'text'      => '',
            'entries'   => array(),
            'results'   => array(),
            'mode'      => 1,
            'lastUsage' => $now
        );
        $wheels[$uuid] = $currentWheel;
        file_put_contents($wheelsFile, json_encode($wheels), LOCK_EX);
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Wheel of Names - Modern Edition</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- jQuery UI CSS für den Slider -->
  <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="css/style.css">
  <!-- Externe Libraries -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <!-- Konfetti-Bibliothek -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.4.0/dist/confetti.browser.min.js"></script>
</head>
<body>
  <header>
    <h1>Wheel of Names</h1>
    <button id="newWheelButton">Neues Rad</button>
  </header>
  
  <div class="main-container">
    <!-- Modus-Wahl mit "Strassen-Slider" -->
    <div class="mode-selector">
      <div id="modeSliderContainer">
        <div id="modeSlider"></div>
        <div class="mode-labels">
          <span data-value="1">Gewinner</span>
          <span data-value="2">Auswahl entfernen</span>
          <span data-value="3">Ewiges Rad</span>
        </div>
      </div>
      <div class="share">
        <p>Teile dein Rad: <input type="text" id="shareUrl" readonly value="<?php echo 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'] . '?uuid=' . $uuid; ?>"></p>
      </div>
    </div>
    
    <div class="content">
      <!-- Glücksrad mit Canvas und Pfeil (Pfeil zeigt in das Rad) -->
      <div class="wheel-container">
        <div class="pointer"></div>
        <canvas id="wheel" width="400" height="400"></canvas>
      </div>
      <!-- Eingabebereich -->
      <div class="input-container">
        <textarea id="textInput" placeholder="Gib hier Namen, Preise oder Ähnliches ein..."><?php echo htmlspecialchars($currentWheel['text']); ?></textarea>
        <div id="results">
          <h3>Gezogene Reihenfolge:</h3>
          <ul id="resultList">
            <?php
            if(!empty($currentWheel['results'])){
              foreach($currentWheel['results'] as $res){
                echo "<li>" . htmlspecialchars($res) . "</li>";
              }
            }
            ?>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Overlay (Modal) zur Anzeige des Ergebnisses -->
  <div id="overlay">
    <div id="overlayContent">
      <div class="overlay-header">
        <h2 id="overlayTitle">Ergebnis</h2>
      </div>
      <div class="overlay-body">
        <p id="overlayText"></p>
        <div id="removeOption" style="display:none;">
          <button class="btn-primary" id="removeButton">Entfernen</button>
        </div>
        <button class="btn-secondary" id="closeOverlay">Schliessen</button>
      </div>
    </div>
  </div>
  
  <footer>
    <p>Download auf <a href="https://github.com/dein-github-repo" target="_blank">GitHub</a></p>
  </footer>
  
  <!-- Übergabe initialer Daten an JavaScript -->
  <script>
    var initialData = {
      uuid: "<?php echo $uuid; ?>",
      entries: <?php echo json_encode($currentWheel['entries']); ?>,
      results: <?php echo json_encode($currentWheel['results']); ?>,
      mode: <?php echo $currentWheel['mode']; ?>
    };
  </script>
  <script src="js/main.js"></script>
</body>
</html>
