# OpenExplorerPHP
A fast and lightweight file manager using SQLite.

## The idea
&hellip; is to create a simple and universal file explorer&nbsp;&ndash; the less complex, the better.
Any user directory is virtualized by the DB and all files are stored in a user-specific folder.

## Please.
Do not hesitate and point out flaws and possible improvements. I'm eager to learn and perfect this project. Thanks in advance!

## Installation
1. Make sure you have a fully functioning (Apache HTTP 2.4) webserver with PHP &#x2265; 5.6 and SQLite3 installed.
2. You will need the following PHP extensions: ```ctype```, ```intl```, ```json```, ```mbstring```, ```pdo```. You can manage them with Composer or install them manually (and activate them in ```php.ini```).
3. If everything is up and running, you may try to run ```setupdb.php``` to initialize the database under ```./db/```.
4. That's it. Go to the standard port of your localhost/register.php, and you can start to manage your files!

You can (de-) activate Developer Mode in ```folder.js``` at the top and look at the console output.