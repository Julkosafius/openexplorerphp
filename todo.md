- zip implementieren
  - bug, mit doppelten dateinamen, wenn dateien kopiert wurden
  - addEmptyDir bug -> als zip stream implementieren

- checken ob, order, in den man verschieben möchte, nicht ein übergeordneter ordner ist

- download implementieren

- folder.js in Teilmodule aufspalten ...

- einheitliche optionWindow-Verwaltung mit writeOptionWindowContent-Funktion

- leute, die javascript blockiert haben vom verwenden der seite hindern    noscript

- https://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size einbinden

- login und register auch unter die index.php einbinden und ein gemeinsames header.php mit allen css einbindungen machen

- user_name in username umbenennen
- last_login_date in last_login_info
- register_date in register_info umbenennen

- utilities.php in logischere Unterteile aufteilen

- tree.php löschen

- fileupload.php (multiupload) entfernen

- UI sperren beim laden

- CSS Klasse nodisplay für option window in folder.js einbauen statt ```style.display = "block"```

- daten verschlüsselt oder verfremdet speichern und nur mit korrekter ID entschlüsseln
  - enc.php Dateierweiterung nach iv auch speichern mit länge + erweiterung
  - aes als Klasse nach app/ und functions nach utilities.php
  - encrypt in fileupload.php integrieren
  - fileview.php bauen mit decrypt function
  - => wie (besser wann) die datei wieder verschließen??

DOKU
- php.ini
  - upload_max_filesize erhoehen
  - max_execution_time auf 300
  - post_max_size auf 24
  - max_execution_time = 30
  - upload_max_filesize = 2M