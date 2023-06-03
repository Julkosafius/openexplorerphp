- setup.db, bereinigen und automatische weiterleitung dahin von index.php aus, falls DB leer ist
- alter table folders add constraint not_parent_of_oneself check ( parent_folder_id not like rowid ); ???
- UI sperren beim laden
- labels an die checkboxes für ordner und dateien

- zip implementieren
  - bug, mit doppelten dateinamen, wenn dateien kopiert wurden
  - addEmptyDir bug -> als zip stream implementieren

- einheitliche optionWindow-Verwaltung mit writeOptionWindowContent-Funktion

- https://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size einbinden

- login und register auch unter die index.php einbinden und ein gemeinsames header.php mit allen css einbindungen machen

- user_name in username umbenennen
- last_login_date in last_login_info
- register_date in register_info umbenennen

- utilities.php in logischere Unterteile aufteilen