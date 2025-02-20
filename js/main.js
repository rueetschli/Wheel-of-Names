/* main.js – JavaScript für "Wheel of Names - Modern Edition" */

$(document).ready(function(){
    // Globale Variablen
    var uuid      = initialData.uuid;
    var wheelData = initialData.entries;
    var results   = initialData.results;
    var mode      = initialData.mode; // 1: Gewinner, 2: Auswahl entfernen, 3: Ewiges Rad
    var currentAngle = 0; // Aktuelle Rotation in Radiant
    var animating = false;
    
    var canvas = document.getElementById("wheel");
    var ctx = canvas.getContext("2d");
    var radius = canvas.width / 2;
    
    // Farbpaletten für Modi 2 und 3 (mehr als zwei Farben)
    var mode2Colors = ["#ffffff", "#ff6347", "#ffd700", "#32cd32", "#1e90ff"];
    var mode3Colors = ["#ffffff", "#87cefa", "#4682b4", "#5f9ea0", "#1e90ff"];
    
    // Initiale Darstellung
    drawWheel();
    updateResults();
    
    // jQuery UI Slider initialisieren ("Strassen-Slider")
    $("#modeSlider").slider({
        min: 1,
        max: 3,
        step: 1,
        value: mode,
        animate: 200,
        slide: function(event, ui){
            mode = ui.value;
            saveWheel();
            drawWheel();
        }
    });
    
    // Klick auf das Canvas – dreht das Rad
    $("#wheel").on("click", function(){
        if(animating || wheelData.length === 0) return;
        spinWheel();
    });
    
    // Änderung im Textfeld (automatisches Speichern)
    $("#textInput").on("input", function(){
        var text = $(this).val();
        wheelData = text.split(/[\r\n,;]+/).map(function(item){
            return item.trim();
        }).filter(function(item){
            return item !== "";
        });
        drawWheel();
        saveWheel();
    });
    
    // Overlay Schliessen
    $("#closeOverlay").on("click", function(){
        $("#overlay").fadeOut(300);
    });
    
    // Entfernen der gezogenen Auswahl (nur bei Modus 2)
    $("#removeButton").on("click", function(){
        if(results.length > 0){
            var last = results[results.length - 1];
            wheelData = wheelData.filter(function(item){
                return item !== last;
            });
            results.pop();
            updateResults();
            saveWheel();
            drawWheel();
            $("#overlay").fadeOut(300);
        }
    });
    
    // Neues Rad erstellen (Neues Rad-Button)
    $("#newWheelButton").on("click", function(){
        window.location.href = "index.php";
    });
    
    // Funktion: Zeichnet das Rad inkl. äußerem Kreis und Segmenten
    function drawWheel(){
        var numSegments = wheelData.length;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Kein Eintrag? Zeichne grauen Platzhalter
        if(numSegments === 0){
            ctx.fillStyle = "#ccc";
            ctx.beginPath();
            ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
            ctx.fill();
            return;
        }
        
        var anglePerSegment = 2 * Math.PI / numSegments;
        
        // Segmente zeichnen
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(currentAngle);
        for(var i = 0; i < numSegments; i++){
            var startAngle = i * anglePerSegment;
            var endAngle = startAngle + anglePerSegment;
            var bgColor = "#fff";
            if(mode === 1){
                // Gewinnermodus: bunte Kirmes-Optik
                bgColor = "hsl(" + (i * 360/numSegments) + ", 100%, 70%)";
            } else if(mode === 2){
                bgColor = mode2Colors[i % mode2Colors.length];
            } else if(mode === 3){
                bgColor = mode3Colors[i % mode3Colors.length];
            }
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 10, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            
            // Text im Segment
            ctx.save();
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#333";
            ctx.font = "16px Roboto, sans-serif";
            ctx.fillText(wheelData[i], radius - 20, 8);
            ctx.restore();
            
            // Im Gewinnermodus: zusätzliche festliche Punkte (Konfetti-Detail als extra Akzent)
            if(mode === 1){
                var angleForLamp = startAngle;
                var xLamp = (radius - 5) * Math.cos(angleForLamp);
                var yLamp = (radius - 5) * Math.sin(angleForLamp);
                ctx.beginPath();
                ctx.arc(xLamp, yLamp, 4, 0, 2 * Math.PI);
                ctx.fillStyle = "#FFD700";
                ctx.fill();
            }
        }
        ctx.restore();
        
        // Äusserer Kreis (Rahmen) zeichnen
        ctx.beginPath();
        ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#333";
        ctx.stroke();
    }
    
    // Funktion: Dreht das Rad mittels GSAP-Animation
    function spinWheel(){
        animating = true;
        // Extra Drehung: mindestens 4 volle Umdrehungen + zufälliger Offset (zur besseren Zufallsauswahl)
        var extraDegrees = Math.random() * 360 + 1440 + Math.random() * 30;
        var extraRadians = extraDegrees * Math.PI / 180;
        var newAngle = currentAngle + extraRadians;
        gsap.to({angle: currentAngle}, {
            angle: newAngle,
            duration: 3,
            ease: "power3.out",
            onUpdate: function(){
                currentAngle = this.targets()[0].angle;
                drawWheel();
            },
            onComplete: function(){
                animating = false;
                // Gewinner ermitteln: Der Pfeil (im Overlay) zeigt in den Bereich bei 270° (bzw. -90°)
                var finalAngle = currentAngle % (2 * Math.PI);
                var pointerAngle = (2 * Math.PI + (-Math.PI/2 - finalAngle)) % (2 * Math.PI);
                // Sicherstellen, dass pointerAngle nie exakt 2π ist
                pointerAngle = Math.min(pointerAngle, 2 * Math.PI - 0.000001);
                var anglePerSegment = 2 * Math.PI / wheelData.length;
                var selectedIndex = Math.floor(pointerAngle / anglePerSegment);
                var selectedValue = wheelData[selectedIndex];
                showOverlay(selectedValue);
                results.push(selectedValue);
                updateResults();
                saveWheel();
            }
        });
    }
    
    // Zeigt Overlay mit Ergebnis an (Overlay erhält einen Header, der den Modus widerspiegelt)
    function showOverlay(text){
        var overlayTitle = "Ergebnis";
        if(mode === 1){
            overlayTitle = "Gewinner";
            // Konfetti-Effekt im Gewinnermodus
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.3 }
            });
        }
        $("#overlayTitle").text(overlayTitle);
        var displayText = text;
        $("#overlayText").text(displayText);
        // Entfernen-Option nur bei Modus 2
        if(mode === 2){
            $("#removeOption").show();
        } else {
            $("#removeOption").hide();
        }
        $("#overlay").fadeIn(300);
    }
    
    // Aktualisiert die Ergebnisliste
    function updateResults(){
        var list = $("#resultList");
        list.empty();
        results.forEach(function(item){
            list.append($("<li>").text(item));
        });
    }
    
    // Speichert den aktuellen Zustand via AJAX
    function saveWheel(){
        $.post("index.php?action=save", {
            uuid: uuid,
            text: $("#textInput").val(),
            mode: mode,
            results: JSON.stringify(results)
        });
    }
});
