// Data Act register page (Regulation (EU) 2023/2854). Bilingual EN/DE.
function DataAct() {
  const { lang } = window.useT();
  const en = lang !== 'de';

  return (
    <LegalShell>
      <h1>
        {en
          ? 'Online Register \u2014 Exportable Data'
          : 'Online-Register \u2014 Exportierbare Daten'}
      </h1>
      <p className="legal-meta">
        {en ? 'Last update' : 'Letzte Aktualisierung'}: 26.03.2026
      </p>

      <p>
        {en ? 'Responsible' : 'Verantwortlich'}: Transload GmbH,
        Hohenzollernstra&szlig;e 105, 80796 M&uuml;nchen, {en ? 'Germany' : 'Deutschland'}.
      </p>

      <h2>1. {en ? 'General information' : 'Allgemeine Informationen'}</h2>
      <p>
        {en
          ? 'This register meets the requirements of Regulation (EU) 2023/2854 (\u201cData Act\u201d) of the European Parliament and of the Council of 13 December 2023 and describes all exportable data, data structures, formats and relevant standards and open interoperability specifications for data processing services provided by Transload GmbH in accordance to comply with Art. 26 (1) lit. b and Art. 25 (2) lit. e of the Data Act.'
          : 'Dieses Register erf\u00fcllt die Anforderungen der Verordnung (EU) 2023/2854 (\u201eData Act\u201c) des Europ\u00e4ischen Parlaments und des Rates vom 13. Dezember 2023 und beschreibt alle exportierbaren Daten, Datenstrukturen, Formate sowie relevante Standards und offene Interoperabilit\u00e4tsspezifikationen der von Transload GmbH erbrachten Datenverarbeitungsdienste gem\u00e4\u00df Art. 26 (1) lit. b und Art. 25 (2) lit. e des Data Act.'}
      </p>

      <h2>2. {en ? 'Categories of exportable data' : 'Kategorien exportierbarer Daten'}</h2>

      <h3>2.1 {en ? 'Input Data (Customer-Generated Data)' : 'Eingabedaten (vom Kunden erzeugte Daten)'}</h3>
      <p>
        {en
          ? 'Any data that customers have imported or entered at the beginning of the contract or during use.'
          : 'Alle Daten, die Kunden zu Beginn des Vertrags oder w\u00e4hrend der Nutzung importiert oder eingegeben haben.'}
      </p>
      <p><strong>{en ? 'Categories:' : 'Kategorien:'}</strong></p>
      <ul>
        <li>
          {en
            ? 'Information about the security cameras: Model, brand, focal length, IP-address'
            : 'Informationen \u00fcber die Sicherheitskameras: Modell, Marke, Brennweite, IP-Adresse'}
        </li>
        <li>{en ? 'Terminal building plan' : 'Terminalgeb\u00e4udeplan'}</li>
        <li>
          {en
            ? 'Local reference measurements: Gate height, Camera positioning, \u2026'
            : 'Lokale Referenzmessungen: Torh\u00f6he, Kamerapositionierung, \u2026'}
        </li>
      </ul>

      <h3>2.2 {en ? 'Processed data' : 'Verarbeitete Daten'}</h3>
      <p>
        {en
          ? 'Data generated or processed using the Transload service.'
          : 'Daten, die mit dem Transload-Dienst erzeugt oder verarbeitet werden.'}
      </p>
      <p><strong>{en ? 'Categories:' : 'Kategorien:'}</strong></p>
      <ul>
        <li>
          <strong>{en ? 'Customer Personal Data' : 'Personenbezogene Kundendaten'}:</strong>{' '}
          {en
            ? 'Contact information (e.g., name, email) used solely to grant employees access to the Software. This data is provided by the Customer and used for registration and identity verification.'
            : 'Kontaktinformationen (z.\u00a0B. Name, E-Mail), die ausschlie\u00dflich zur Gew\u00e4hrung des Zugangs von Mitarbeitern zur Software verwendet werden. Diese Daten werden vom Kunden bereitgestellt und f\u00fcr Registrierung und Identit\u00e4tspr\u00fcfung genutzt.'}
        </li>
        <li>
          <strong>{en ? 'Video Data' : 'Videodaten'}:</strong>{' '}
          {en
            ? 'Video footage from cameras at Customer facilities transmitted for freight measurement purposes. Where video data contains images of employees, the Software automatically blurs employees before performing the freight measurement analysis, ensuring no identifiable images are processed for measurement purposes.'
            : 'Videoaufnahmen von Kameras in Kundeneinrichtungen, die f\u00fcr Frachtvermessungszwecke \u00fcbertragen werden. Sofern Videodaten Bilder von Mitarbeitern enthalten, werden diese von der Software automatisch unkenntlich gemacht, bevor die Frachtvermessungsanalyse durchgef\u00fchrt wird.'}
        </li>
        <li>
          <strong>{en ? 'Scanner Data' : 'Scannerdaten'}:</strong>{' '}
          {en
            ? 'Timestamps, handling unit IDs and position coordinates from the scanners used by the terminal personnel, transmitted for freight measurement purposes.'
            : 'Zeitstempel, Ladeeinheiten-IDs und Positionskoordinaten der von Terminalpersonal genutzten Scanner, \u00fcbertragen f\u00fcr Frachtvermessungszwecke.'}
        </li>
      </ul>

      <h2>
        3.{' '}
        {en
          ? 'Data structures, formats, relevant standards and open interoperability specifications'
          : 'Datenstrukturen, Formate, relevante Standards und offene Interoperabilit\u00e4tsspezifikationen'}
      </h2>

      <h3>3.1 {en ? 'Data structures' : 'Datenstrukturen'}</h3>
      <p>
        <strong>{en ? 'Measurement Results' : 'Messergebnisse'}:</strong>{' '}
        {en ? 'Each record contains the fields:' : 'Jeder Datensatz enth\u00e4lt die Felder:'}{' '}
        <code>measurement_id</code> (string, UUID), <code>handling_unit_id</code> (string),{' '}
        <code>timestamp</code> (string, ISO 8601), <code>length_cm</code> (float),{' '}
        <code>width_cm</code> (float), <code>height_cm</code> (float), <code>volume_cbm</code> (float),{' '}
        <code>camera_id</code> (string)
      </p>
      <p>
        <strong>{en ? 'Processed Images' : 'Verarbeitete Bilder'}:</strong>{' '}
        {en
          ? 'For each measurement, the associated processed image or video clip is available as a file export. Images include the blurred source frame and the annotated output with oriented bounding boxes overlaid. File references are linked via measurement_id.'
          : 'F\u00fcr jede Messung steht das zugeh\u00f6rige verarbeitete Bild oder der Videoclip als Dateiexport zur Verf\u00fcgung. Bilder umfassen den unkenntlich gemachten Quellframe und die annotierte Ausgabe mit \u00fcberlagerten orientierten Begrenzungsrahmen. Dateireferenzen sind \u00fcber die measurement_id verkn\u00fcpft.'}
      </p>

      <h3>3.2 {en ? 'Data Format' : 'Datenformat'}</h3>
      <p>
        {en
          ? 'Measurement results are available for export in Comma-Separated Values (CSV or XML) format with the following specifications: field delimiter is comma (,), text qualifier is double quote (\"), line breaks are CRLF (\\r\\n), encoding is UTF-8 with BOM, and the first row contains column headers. Processed images are exported as JPEG files (.jpg). Bulk export packages are provided as ZIP archives containing the CSV/XML file(s) and an associated folder of image files referenced by measurement_id.'
          : 'Messergebnisse stehen im CSV- oder XML-Format zum Export bereit mit folgenden Spezifikationen: Feldtrenner ist Komma (,), Textqualifizierer ist doppeltes Anf\u00fchrungszeichen (\"), Zeilenumbr\u00fcche sind CRLF (\\r\\n), Kodierung ist UTF-8 mit BOM, und die erste Zeile enth\u00e4lt Spalten\u00fcberschriften. Verarbeitete Bilder werden als JPEG-Dateien (.jpg) exportiert. Massenexportpakete werden als ZIP-Archive bereitgestellt.'}
      </p>

      <h3>{en ? 'Relevant Standards' : 'Relevante Standards'}</h3>
      <ul>
        <li>{en ? 'Date and Time' : 'Datum und Uhrzeit'}: ISO 8601 (e.g. 2026-03-29T14:30:00Z)</li>
        <li>CSV: RFC 4180 (Common Format and MIME Type for CSV Files)</li>
        <li>UUID: RFC 4122 (Universally Unique Identifier)</li>
        <li>{en ? 'Character Encoding' : 'Zeichenkodierung'}: UTF-8 per RFC 3629</li>
        <li>JPEG: ISO/IEC 10918-1</li>
        <li>ZIP: ISO/IEC 21320-1</li>
      </ul>

      <h3>{en ? 'Open interoperability specifications' : 'Offene Interoperabilit\u00e4tsspezifikationen'}</h3>
      <p>
        {en
          ? 'Transload currently provides data export via CSV/XML, which is a widely supported open format. At this time, no additional open interoperability specifications (such as OASIS OData or W3C DCAT) are implemented. Transload will monitor and align with relevant open interoperability specifications as they are adopted under Regulation (EU) No 1025/2012 and applicable EU Data Act implementing measures.'
          : 'Transload stellt derzeit den Datenexport \u00fcber CSV/XML bereit, ein weithin unterst\u00fctztes offenes Format. Derzeit sind keine zus\u00e4tzlichen offenen Interoperabilit\u00e4tsspezifikationen (wie OASIS OData oder W3C DCAT) implementiert. Transload wird relevante offene Interoperabilit\u00e4tsspezifikationen beobachten und umsetzen, sobald diese gem\u00e4\u00df Verordnung (EU) Nr. 1025/2012 und den geltenden EU-Data-Act-Durchf\u00fchrungsma\u00dfnahmen angenommen werden.'}
      </p>

      <h2>4. {en ? 'Data excluded from the transfer' : 'Von der \u00dcbertragung ausgeschlossene Daten'}</h2>

      <h3>4.1 {en ? 'System-specific data' : 'Systemspezifische Daten'}</h3>
      <p>
        {en
          ? 'The following data is specific to the internal functioning of the transload service and is excluded from exportable data:'
          : 'Die folgenden Daten sind spezifisch f\u00fcr die interne Funktionsweise des Transload-Dienstes und von den exportierbaren Daten ausgeschlossen:'}
      </p>
      <ul>
        <li>
          {en
            ? 'Internal system configurations, infrastructure settings, and deployment parameters'
            : 'Interne Systemkonfigurationen, Infrastruktureinstellungen und Bereitstellungsparameter'}
        </li>
        <li>
          {en
            ? 'Internal logging, debugging, and telemetry data used for service monitoring'
            : 'Interne Protokollierungs-, Debugging- und Telemetriedaten f\u00fcr das Service-Monitoring'}
        </li>
        <li>
          {en
            ? 'Session tokens, API keys, and internal authentication credentials'
            : 'Sitzungs-Tokens, API-Schl\u00fcssel und interne Authentifizierungsdaten'}
        </li>
        <li>
          {en
            ? 'Internal queue, pipeline, and job orchestration metadata'
            : 'Interne Warteschlangen-, Pipeline- und Job-Orchestrierungs-Metadaten'}
        </li>
      </ul>

      <h3>4.2 {en ? 'Trade secrets' : 'Gesch\u00e4ftsgeheimnisse'}</h3>
      <ul>
        <li>
          {en
            ? 'Trained model weights, parameters, and architecture configurations for SAM 3, Depth Anything 3, and any proprietary segmentation or depth estimation models'
            : 'Trainierte Modellgewichte, Parameter und Architekturkonfigurationen f\u00fcr SAM 3, Depth Anything 3 und propriet\u00e4re Segmentierungs- oder Tiefensch\u00e4tzungsmodelle'}
        </li>
        <li>
          {en
            ? 'Proprietary algorithms for outlier detection, bounding box fitting, and measurement calibration'
            : 'Propriet\u00e4re Algorithmen f\u00fcr Ausrei\u00dfererkennung, Begrenzungsrahmenanpassung und Messkalibrierung'}
        </li>
        <li>
          {en
            ? 'Internal accuracy benchmarking data and model evaluation metrics'
            : 'Interne Genauigkeits-Benchmarkdaten und Modellevaluierungsmetriken'}
        </li>
        <li>
          {en
            ? 'Pricing models, calculation bases, and internal commercial terms'
            : 'Preismodelle, Berechnungsgrundlagen und interne kommerzielle Bedingungen'}
        </li>
      </ul>

      <h3>4.3 {en ? 'Legally protected content' : 'Rechtlich gesch\u00fctzte Inhalte'}</h3>
      <ul>
        <li>
          {en
            ? 'Third-party model code and weights used under licence'
            : 'Drittanbieter-Modellcode und -gewichte unter Lizenz'}
        </li>
        <li>
          {en
            ? 'Third-party software libraries and components subject to their respective open-source or proprietary licences'
            : 'Drittanbieter-Softwarebibliotheken und -komponenten gem\u00e4\u00df ihren jeweiligen Open-Source- oder propriet\u00e4ren Lizenzen'}
        </li>
        <li>
          {en
            ? "Any content or materials provided by third-party cloud infrastructure providers (Microsoft Azure, Google Cloud Platform, Amazon Web Services) that are subject to those providers' intellectual property rights"
            : 'Alle Inhalte oder Materialien von Drittanbieter-Cloud-Infrastrukturanbietern (Microsoft Azure, Google Cloud Platform, Amazon Web Services), die den geistigen Eigentumsrechten dieser Anbieter unterliegen'}
        </li>
      </ul>

      <h2>5. {en ? 'Contact Information' : 'Kontaktinformationen'}</h2>
      <p>
        {en ? 'Technical contact for data export:' : 'Technischer Kontakt f\u00fcr Datenexport:'}
      </p>
      <p>
        E-Mail: <a href="mailto:julius@transload.io">julius@transload.io</a>
      </p>

      <h2>6. {en ? 'Version history' : 'Versionshistorie'}</h2>
      <p>
        {en
          ? 'Version 1.0: First version created, dated 26.03.2026'
          : 'Version 1.0: Erste Version erstellt, datiert 26.03.2026'}
      </p>
    </LegalShell>
  );
}

window.DataAct = DataAct;
ReactDOM.createRoot(document.getElementById('root')).render(<DataAct />);
