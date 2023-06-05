<?php
require 'src/globals.php';
require 'src/utilities.php';

// imports default timezone from utilities
global $I18N;
global $sqlite;

if (!table_exists('folders')) {
    echo $I18N['error_database'];
    die();
}

// get name of the folder being created
$folder_name = $_POST['folder_name'];
$folder_id = $_POST['curr_folder_id'];
$folder_time = time();

if (strlen($folder_name) > MAX_FOLDER_NAME_LEN) {
    echo $I18N['error_name_too_long'];
    die();
}

// log to database
$sqlite->executeCommands('insert into folders(user_id, folder_name, parent_folder_id, folder_time, folder_size) values ("'.$_COOKIE['user_id'].'", "'.$folder_name.'", "'.$folder_id.'", "'.$folder_time.'", 0)');

// check if folder was created successfully
$folderExists = $sqlite->getFirstColumnValue('select count(*) as cnt from folders where user_id like "'.$_COOKIE['user_id'].'" and folder_name like "'.$folder_name.'" and parent_folder_id like "'.$folder_id.'" and folder_time like "'.$folder_time.'"', 'cnt');

echo $folderExists > 0 ? $folder_name.' '.$I18N['folder_create_ok'] : $I18N['folder_create_fail'];