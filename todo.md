- vendor app autoload und app import bei 'utility.php' importeuren entfernen

- ordnerinhalte alphabetisch sortieren lassen (allg. Sortieroption implementieren als parameter für getFolderContents)

- sicherheitsabfrage ("wirklich löschen?")

- leute, die javascript blockiert haben vom verwenden der seite hindern    noscript

- https://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size einbinden

- login und register auch unter die index.php einbinden und ein gemeinsames header.php mit allen css einbindungen machen

- user_name in username umbenennen
- last_login_date in last_login_info
- register_date in register_info umbenennen

- utilities.php in logischere Unterteile aufteilen

- copy implementieren!

- in order select menü: auswahl von root hinzufügen.

- tree.php löschen

- UI sperren beim laden

- CSS Klasse nodisplay für option window in folder.js einbauen statt ```style.display = "block"```

- statt requestBodyFromObject die neue URLSearchParams(obj).toString() verwenden zusammen mit urldecode() in PHP

- ELEMENT_ACTION_DROPDOWN und ELEMENT_ACTION_BTN von disabled zu visibility: hidden (also Sichtbarkeitsmanagement über CSS) ändern?

- php funktion für delete, move, ... die checkt, ob die übergebenen dateien und ordner überhaupt uns gehören

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