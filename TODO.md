- Features:
  - User account menu - they can change their name or delete their account and files

- Accessibility:
  - generate labels for all checkboxes in renderFolderContents() in folder.js

- Security:
  - lock UI while loading or fetching data
  - Big security problem: ajax_find_user_name.php?q=exampleName is directly accessible.
    Goal is to prevent direct access to certain PHP files, the SQLite database, etc.
    Until now no working solution found - blocking via .htaccess blocks JS fetching too ...

- Clean code:
  - improve the project structure by creating sub-folders for PHP scripts (e.g. "actions" for all 4 actions,
    file upload and folder creation). Until now, no working solution was found, only struggles with PHP path resolving
  - include login.php and register.php in index.php and create a common header.php/.phtml with all the necessary.

- Small improvements:
  - write more documentation for PHP/JS functions
  - implement something like this: https://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size
  - rename: "user_name" to "username" / "last_login_date" to "last_login_info" / "register_date" to "register_info"
    (everything from DB columns to every SQL request and variable name)
  - maybe split up utilities.php?