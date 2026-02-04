# Screenshots für das Handbuch

Diese Datei listet alle benötigten Screenshots für die Dokumentation auf.

## Vorhandene Screenshots

- [x] `barcode-scanner.jpg` - Barcode Scanner Ansicht

## Benötigte Screenshots

### Anmeldung & Start
- [x] `login-screen.png` - Anmeldebildschirm
- [ ] `login-sender-select.png` - Einsenderauswahl
- [ ] `login-lab-select.png` - Laborauswahl

### Befunde
- [x] `results-overview.png` - Befundübersicht mit Tabs
- [x] `results-filter-modal.png` - Filter-Modal
- [x] `results-detail.png` - Befunddetails
- [x] `results-detail-values.png` - Messwerte in Befunddetails
- [ ] `results-pathological.png` - Pathologische Markierungen
- [x] `results-search.png` - Suchfunktion

### Patienten
- [x] `patients-list.png` - Patientenliste mit Gruppierung
- [x] `patients-search.png` - Patientensuche
- [x] `patients-detail.png` - Patientendetails

### Labore
- [x] `laboratories-list.png` - Laborliste
- [x] `laboratory-info.png` - Labor Info-Tab
- [x] `laboratory-services.png` - Leistungskatalog
- [x] `laboratory-contacts.png` - Ansprechpartner

### Neuigkeiten
- [x] `news-list.png` - Neuigkeitenliste
- [x] `news-detail.png` - Nachrichtendetail

### Einstellungen
- [x] `settings-general.png` - Allgemeine Einstellungen
- [ ] `settings-notifications.png` - Benachrichtigungseinstellungen

### Navigation
- [x] `menu-open.png` - Geöffnetes Seitenmenü
- [ ] `tab-bar.png` - Tab-Leiste am unteren Rand

## Screenshot-Anforderungen

### Format
- **Bevorzugt**: PNG für UI-Screenshots
- **Alternativ**: JPG für Fotos
- **Auflösung**: Mindestens 750px Breite

### Geräte
- Mobile Screenshots (bevorzugt)
- Tablet/Desktop für Vergleiche

### Automatische Erstellung mit Playwright

Screenshots können automatisch mit Playwright erstellt werden:

```bash
# Screenshots erstellen (startet Dev-Server automatisch)
npm run screenshots

# Screenshots mit UI erstellen (interaktiv)
npm run screenshots:ui
```

Die Screenshots werden automatisch im Ordner `docs/handbook/docs/assets/screenshots/` gespeichert.

### Manuelle Erstellung

1. App im gewünschten Zustand öffnen
2. Screenshot erstellen (je nach Gerät)
3. Bei Bedarf zuschneiden
4. In `docs/assets/screenshots/` speichern
5. In der Dokumentation referenzieren mit:
   ```markdown
   ![Beschreibung](../assets/screenshots/dateiname.png)
   ```
