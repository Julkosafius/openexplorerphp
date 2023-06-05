<?php
require 'vendor/autoload.php';
require 'src/utilities.php';
require 'src/globals.php';

global $I18N;

use src\SQLiteConnection as SQLiteConnection;
use src\SQLiteUtilities as SQLiteUtilities;

// get the q parameter from URL
$q = $_REQUEST['q'];

if (!isset($q)) {
    echo $I18N['error_unknown'];
} else {
    $sqlite = new SQLiteUtilities((new SQLiteConnection())->connect());
    $user_name_count = $sqlite->getFirstColumnValue('select count(*) as count from users where user_name = "'.$q.'"', 'count');
    
    echo $user_name_count > 0 ? $I18N['username_taken'] : $I18N['username_avail'];
}