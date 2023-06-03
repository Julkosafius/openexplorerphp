# OpenExplorerPHP
A fast and lightweight file manager using SQLite.

## The idea
&hellip; is to create a simple and universal file explorer&nbsp;&ndash; the less complex, the better.
Any user directory is virtualized by the database and all files are stored in a user-specific folder.

## Please.
Do not hesitate and point out flaws and possible improvements. Thanks in advance!

___
## Installation
1. Make sure you have a fully functioning (Apache HTTP 2.4) webserver with PHP &#x2265; 5.6 and SQLite3 installed.
2. You will need the following PHP extensions: ```ctype```, ```intl```, ```json```, ```mbstring```, ```pdo```.
You can manage them with Composer or install them manually (and activate them in ```php.ini```).
3. If everything is up and running, you may try to run ```setupdb.php``` to initialize the database under ```./db/```.
4. That's it. Go to the standard port of your localhost/register.php, and you can start to manage your files!
5. The standard test user is ```qwertz``` with the password ```12345```.

You can (de-) activate Developer Mode in ```folder.js``` at the top and look at the console output.

___
## Disclaimers
### Post-installation and customization
You can customize your version of OpenExplorerPHP.
1. Manage the allowed filetypes in ```app/globals.php```. At the end of the file is an array, where you can add
the MIME-types of all the files you wish to permit on your server. *It is currently very limited!*
2. In your PHP settings, increase the maximum upload filesize. To achieve this, you normally modify the
```php.ini``` file and search for ```upload_max_filesize```. Sometimes, you also need to update your server's settings.
And while you're on it, you can look into increasing ```post_max_size``` and ```max_execution_time``` too.
I have them on 24 and 300 respectively.

### Support for Firefox
Currently, the application *does not work at all* in Firefox. This is due to their missing implementation of
the CSS ```:has()``` pseudo-class (needed for the theme selection) and the JavaScript import assertions
(needed for the import of ```i18n.json```).

___
That's it!