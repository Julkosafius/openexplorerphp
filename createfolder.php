<?php
date_default_timezone_set('UTC');

require 'vendor/autoload.php';
require 'app/utilities.php';
require 'app/globals.php';

use App\SQLiteConnection as SQLiteConnection;
use App\SQLiteUtilities as SQLiteUtilities;

// get name of the folder being created
$folder_name = $_POST['folder_name'];
$folder_id = $_POST['curr_folder_id'];
$folder_time = time();

if (strlen($folder_name) > MAX_FOLDER_NAME_LEN) {
    echo 1;
    die();
}

// log to database
$sqlite = new SQLiteUtilities((new SQLiteConnection())->connect());
$out = 'insert into folders(user_id, folder_name, parent_folder_id, folder_time, folder_size) values ("'.$_COOKIE['user_id'].'", "'.$folder_name.'", "'.$folder_id.'", "'.$folder_time.'", 0)';
$sqlite->executeCommands($out);

// check if folder was created successfully
$folderExists = $sqlite->getFirstColumnValue('select count(*) as cnt from folders where user_id like "'.$_COOKIE['user_id'].'" and folder_name like "'.$folder_name.'" and parent_folder_id like "'.$folder_id.'" and folder_time like "'.$folder_time.'"', 'cnt');

echo $folderExists > 0 ? 0 : 1;