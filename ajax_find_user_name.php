<?php
require 'vendor/autoload.php';
require 'app/globals.php';

use App\SQLiteConnection as SQLiteConnection;
use App\SQLiteUtilities as SQLiteUtilities;

// get the q parameter from URL
$q = $_REQUEST["q"];

if (!isset($q)) {
    echo STH_WENT_WRONG;
} else {
    $sqlite = new SQLiteUtilities((new SQLiteConnection())->connect());
    $user_name_count = $sqlite->getFirstColumnValue('select count(*) as count from users where user_name = "'.$q.'"', 'count');
    
    echo $user_name_count > 0 ? USER_NAME_TAKEN : USER_NAME_AVAILABLE;
}