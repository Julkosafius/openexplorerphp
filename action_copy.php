<?php
require 'app/globals.php';
require 'app/utilities.php';

global $sqlite; // inherits database connection from utilities

$status_array = [];

$destination = isset($_POST['destination']) ? $_POST['destination'] : null;
$files = isset($_POST['files']) ? $_POST['files'] : null;
$folders = isset($_POST['folders']) ? $_POST['folders'] : null;

if (!$destination) {
    $status_array[] = 'No destination folder found.';
    echo json_encode($status_array);
    die();
}

$destination_name = $sqlite->getFirstColumnValue('select folder_name as fn from folders where rowid = '.$destination, 'fn');

function copyFile($file_id, $parent_folder_id = 0) {
    global $sqlite, $destination;
    $file_info = getInfo($file_id, 'files');
    $folder_id = empty($parent_folder_id) ? $destination : $parent_folder_id;
    $sqlite->executeCommands('insert into files(file_name, file_type, file_size, file_time, file_hash, folder_id) '
                            .'values ("'
                            .$file_info['file_name'].'", "'
                            .$file_info['file_type'].'", '
                            .$file_info['file_size'].', '
                            .time().', "'
                            .$file_info['file_hash'].'", '
                            .$folder_id
                            .')');
}


function copyFolder($folder_id, $last_folder_id = 0) {
    global $sqlite, $destination;
    $folder_contents = getFolderContents($folder_id);
    $elements = array_merge($folder_contents['folders'], $folder_contents['files']);
    if (!empty($elements)) {
        for ($i = 0; $i < count($elements); $i++) {
            if (isset($elements[$i]['folder_id'])) {
                $folder_info = getInfo($elements[$i]['folder_id'], 'folders');
                $parent_folder_id = empty($folder_info['parent_folder_id']) ? $destination : $last_folder_id;
                $sqlite->executeCommands('insert into folders(user_id, folder_name, parent_folder_id, folder_time, folder_size) values ("'
                                        .$folder_info['user_id'].'", "'
                                        .$folder_info['folder_name'].'", '
                                        .$parent_folder_id.', '
                                        .time().', '
                                        .$folder_info['folder_size']
                                        .')');
                $new_last_folder_id = $sqlite->getFirstColumnValue('select max(rowid) as id from folders where parent_folder_id ='.$parent_folder_id, 'id');

                $subfolder_contents = copyFolder($elements[$i]['folder_id'], $new_last_folder_id);
            } else {
                copyFile($elements[$i]['file_id'], $last_folder_id);
            }
        }
    }
}

if (!empty($folders)) {
    foreach($folders as $folder_id) {
        $folder_info = getInfo($folder_id, 'folders');
        
        copyFolder($folder_id, $destination);
    }
}

if (!empty($files)) {
    foreach ($files as $file_id) {
        copyFile($file_id, $destination);
    }
}