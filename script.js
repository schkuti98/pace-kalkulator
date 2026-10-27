// Alle wichtigen Elemente aus der HTML-Datei holen
const formular = document.getElementById('formular');
const ergebnis = document.getElementById('ergebnis');
const meldung = document.getElementById('meldung');
const liste = document.getElementById('eintraege');
const datumFeld = document.getElementById('datum');

// Das heutige Datum als Vorschlag eintragen (in lokaler Zeit)
const heute = new Date();
const jahr = heute.getFullYear();
const monat = String(heute.getMonth() + 1).padStart(2, '0');
const tag = String(heute.getDate()).padStart(2, '0');
datumFeld.value = jahr + '-' + monat + '-' + tag;

// Bisher gespeicherte Einträge laden
let eintraege = JSON.parse(localStorage.getItem('paceEintraege') || '[]');
if (!Array.isArray(eintraege)) eintraege = [];

function speichern() {
   localStorage.setItem('paceEintraege', JSON.stringify(eintraege));
}

// Sekunden in mm:ss umwandeln
function zeitAnzeigen(gesamtSekunden) {
   const minuten = Math.floor(gesamtSekunden / 60);
   const sekunden = gesamtSekunden % 60;
   return String(minuten).padStart(2, '0') + ':' + String(sekunden).padStart(2, '0');
}

formular.addEventListener('submit', function (ereignis) {
   ereignis.preventDefault();

   const strecke = Number(document.getElementById('strecke').value);
   const stunden = Number(document.getElementById('stunden').value);
   const minuten = Number(document.getElementById('minuten').value);
   const sekunden = Number(document.getElementById('sekunden').value);
   const datum = datumFeld.value;
   const dauer = stunden * 3600 + minuten * 60 + sekunden;

   if (
      !Number.isFinite(strecke) ||
      strecke <= 0 ||
      !Number.isInteger(strecke) ||
      !Number.isInteger(stunden) ||
      stunden < 0 ||
      !Number.isInteger(minuten) ||
      minuten < 0 ||
      minuten > 59 ||
      !Number.isInteger(sekunden) ||
      sekunden < 0 ||
      sekunden > 59 ||
      dauer <= 0 ||
      !datum
   ) {
      meldung.textContent = 'Bitte gültige Werte eingeben. Die Strecke und Dauer müssen größer als 0 sein.';
      return;
   }

   // Zeit pro Kilometer berechnen und auf ganze Sekunden runden
   const paceSekunden = Math.round(dauer / (strecke / 1000));
   const pace = zeitAnzeigen(paceSekunden);
   ergebnis.textContent = pace + ' min/km';

   // Einen neuen Eintrag speichern
   eintraege.push({
      id: Date.now().toString() + '-' + Math.random().toString(36).slice(2),
      datum: datum,
      strecke: strecke,
      dauer: dauer,
      pace: pace
   });
   speichern();
   anzeigen();
   meldung.textContent = 'Eintrag gespeichert!';
});

function loeschen(id) {
   eintraege = eintraege.filter(function (eintrag) {
      return eintrag.id !== id;
   });
   speichern();
   anzeigen();
   meldung.textContent = 'Eintrag gelöscht.';
}

function anzeigen() {
   liste.innerHTML = '';

   // Neuestes Datum zuerst
   eintraege.sort(function (a, b) {
      return b.datum.localeCompare(a.datum);
   });

   if (eintraege.length === 0) {
      liste.textContent = 'Noch keine Einträge gespeichert.';
      return;
   }

   eintraege.forEach(function (eintrag) {
      const zeile = document.createElement('div');
      zeile.className = 'eintrag';

      const text = document.createElement('div');
      const datumText = eintrag.datum.split('-').reverse().join('.');
      const ersteZeile = document.createElement('p');
      ersteZeile.textContent = datumText + ' – ' + eintrag.strecke + ' m';
      const zweiteZeile = document.createElement('p');
      zweiteZeile.textContent = 'Dauer: ' + zeitAnzeigen(eintrag.dauer) + ' | Pace: ' + eintrag.pace + ' min/km';
      text.appendChild(ersteZeile);
      text.appendChild(zweiteZeile);

      const knopf = document.createElement('button');
      knopf.className = 'loeschen';
      knopf.textContent = 'Löschen';
      knopf.addEventListener('click', function () {
         loeschen(eintrag.id);
      });

      zeile.appendChild(text);
      zeile.appendChild(knopf);
      liste.appendChild(zeile);

      // Fingerposition merken: Wischen nach rechts löscht den Eintrag
      let startX = 0;
      let startY = 0;
      zeile.addEventListener(
         'touchstart',
         function (ereignis) {
            startX = ereignis.changedTouches[0].clientX;
            startY = ereignis.changedTouches[0].clientY;
         },
         { passive: true }
      );
      zeile.addEventListener('touchend', function (ereignis) {
         const unterschiedX = ereignis.changedTouches[0].clientX - startX;
         const unterschiedY = ereignis.changedTouches[0].clientY - startY;
         if (unterschiedX > 90 && Math.abs(unterschiedX) > Math.abs(unterschiedY) * 1.5) {
            loeschen(eintrag.id);
         }
      });
   });
}

anzeigen();

// Service Worker für die Offline-Funktion anmelden
if ('serviceWorker' in navigator) {
   window.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js').catch(function (fehler) {
         console.log('Offline-Funktion konnte nicht gestartet werden:', fehler);
      });
   });
}
