# Screenshots für das Handbuch

Diese Datei listet alle benötigten Screenshots für die Dokumentation auf.

## Vorhandene Screenshots

- [x] `barcode-scanner.jpg` - Barcode Scanner Ansicht

## Benötigte Screenshots

### Anmeldung & Start
- [ ] `login-screen.png` - Anmeldebildschirm
- [ ] `login-sender-select.png` - Einsenderauswahl
- [ ] `login-lab-select.png` - Laborauswahl

### Befunde
- [ ] `results-overview.png` - Befundübersicht mit Tabs
- [ ] `results-filter-modal.png` - Filter-Modal
- [ ] `results-detail.png` - Befunddetails
- [ ] `results-detail-values.png` - Messwerte in Befunddetails
- [ ] `results-pathological.png` - Pathologische Markierungen
- [ ] `results-search.png` - Suchfunktion

### Patienten
- [ ] `patients-list.png` - Patientenliste mit Gruppierung
- [ ] `patients-search.png` - Patientensuche
- [ ] `patients-detail.png` - Patientendetails

### Labore
- [ ] `laboratories-list.png` - Laborliste
- [ ] `laboratory-info.png` - Labor Info-Tab
- [ ] `laboratory-services.png` - Leistungskatalog
- [ ] `laboratory-contacts.png` - Ansprechpartner

### Neuigkeiten
- [ ] `news-list.png` - Neuigkeitenliste
- [ ] `news-detail.png` - Nachrichtendetail

### Einstellungen
- [ ] `settings-general.png` - Allgemeine Einstellungen
- [ ] `settings-notifications.png` - Benachrichtigungseinstellungen

### Navigation
- [ ] `menu-open.png` - Geöffnetes Seitenmenü
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
