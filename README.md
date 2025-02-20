# Wheel of Names - Modern Edition

## Projektbeschreibung
Wheel of Names - Modern Edition ist eine moderne, responsive Webanwendung, mit der du dein eigenes Glücksrad erstellen kannst. Du fügst im großen Eingabefeld Namen, Preise oder andere Einträge ein – getrennt durch Enter, Komma oder Semikolon – und das Rad generiert daraus per Zufall eine Auswahl. Je nach gewähltem Modus unterscheidet sich nicht nur das Verhalten, sondern auch das Aussehen des Rades:

- **Gewinner**: Das Rad zeigt mit einem stylischen Overlay den Gewinner an, inklusive Party-Effekten und Konfetti.
- **Auswahl entfernen**: Nach jeder Drehung wird der gezogene Eintrag aus dem Rad entfernt. Dabei unterscheidet sich die Gestaltung der Buttons: Der Entfernen-Button ist prominent hervorgehoben, während der Schliessen-Button dezent bleibt.
- **Ewiges Rad**: Das Rad bleibt unverändert, sodass sich immer wieder dieselben Einträge wählen lassen.

Die Anwendung speichert den Zustand deines Rades in einer JSON-Datei und verwendet eine eindeutige UUID, damit du dein Rad über eine URL teilen kannst. Zusätzlich sorgt ein Cleanup-Job dafür, dass Räder, die länger als eine Woche nicht genutzt wurden, automatisch gelöscht werden.

## Features
- **Responsive Design**: Optimiert für Desktop und mobile Endgeräte.
- **Moderner "Strassen-Slider"**: Wähle intuitiv zwischen den drei Modi – die Beschriftungen sind direkt in der Leiste integriert.
- **Interaktive Animationen**: GSAP-basierte Animationen garantieren flüssige Drehungen.
- **Party-Effekt im Gewinner-Modus**: Mit einem Konfetti-Effekt wird der Gewinn gebührend gefeiert.
- **Vielfarbige Segmentgestaltung**: Mehrere Farben verhindern gleichfarbige Segmente bei ungerader Eintragszahl.
- **Neues Rad**: Mit einem Klick auf den "Neues Rad" Button im Header startest du jederzeit von Neuem.
- **Einfache Speicherung**: Alle Daten werden in der Datei `wheels.json` gespeichert – ohne klassische Datenbank.
- **Share-Funktion**: Teile dein Rad über die eindeutige URL.

## Verzeichnisstruktur
```
/ (Projektstamm) ├── index.php ├── wheels.json ├── css │ └── style.css └── js └── main.js


## Installation
1. **Dateien hochladen:** Lade alle Dateien per FTP auf dein Webhosting hoch.
2. **Dateiberechtigungen:** Stelle sicher, dass die Datei `wheels.json` beschreibbar ist (z. B. CHMOD 666 oder 777, falls nötig).
3. **Server-Anforderungen:** Dein Server muss PHP (idealerweise Version 5.6 oder höher) mit aktivierter JSON-Erweiterung unterstützen.
4. **Aufruf:** Rufe `index.php` in deinem Browser auf, um dein neues Glücksrad zu erstellen.

## Nutzung
- **Rad erstellen:** Gib deine Einträge in das große Textfeld ein (Trennzeichen: Enter, Komma oder Semikolon).
- **Modus wählen:** Nutze den "Strassen-Slider" im Header, um zwischen den Modi (Gewinner, Auswahl entfernen, Ewiges Rad) zu wechseln.
- **Rad drehen:** Klicke auf das Rad – es dreht sich und zeigt den Gewinner im Overlay an.
- **Overlay:** Das Overlay erscheint zentriert mit einem ansprechenden Header (ähnlich dem Seitenheader). Im Gewinner-Modus steht dort "Gewinner", in den anderen Modi "Ergebnis". Bei Modus "Auswahl entfernen" kannst du den letzten gezogenen Eintrag entfernen.
- **Neues Rad:** Klicke auf "Neues Rad" im Header, um ein frisches Rad zu erstellen.
- **Teilen:** Kopiere die angezeigte URL, um dein Rad mit anderen zu teilen.

## Technologie
- **Backend:** PHP
- **Frontend:** HTML, CSS, JavaScript, jQuery, jQuery UI, GSAP, canvas-confetti
- **Speicherung:** JSON-Datei (`wheels.json`)

## Beiträge und Support
Fühl dich frei, Fehler zu melden oder Verbesserungsvorschläge zu machen. Pull-Requests sind herzlich willkommen!  
Bei Fragen oder Anmerkungen kannst du mich über GitHub kontaktieren.


<img width="572" alt="image" src="https://github.com/user-attachments/assets/69136f2f-82de-4036-8ce1-4ac00e784e36" />
