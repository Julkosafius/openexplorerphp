<?php
require 'app/globals.php';
require 'app/utilities.php';

global $sqlite; // inherits database connection from utilities

$status_array = [];

$destination = isset($_POST['destination']) ? $_POST['destination'] : null;
$files = isset($_POST['file']) ? $_POST['file'] : null;
$folders = isset($_POST['folder']) ? $_POST['folder'] : null;

if (!$destination) {
    $status_array[] = 'No destination folder found.';
    echo json_encode($status_array);
    die();
}

$destination_name = $sqlite->getFirstColumnValue('select folder_name as fn from folders where rowid = '.$destination, 'fn');

if (!empty($folders)) {
    foreach ($folders as $folder_id) {
        if (!isIdValid($folder_id, 'folders')) {
            $status_array[] = 'Could not move '.$folder_id.': folder does not exist.';
        } elseif (!isPropertyOfUser($folder_id, 'folders')) {
            $status_array[] = 'Could not move '.$folder_id.': no permission.';
        } else {
            $folder_info = $sqlite->getIterator('select folder_name, folder_size, parent_folder_id from folders where rowid = '.$folder_id)->fetch();
            $folder_name = $folder_info['folder_name'];
            $folder_size = $folder_info['folder_size'];
            $old_parent_folder = $folder_info['parent_folder_id'];
            //if ($folder_name == 'root') $folder_name = 'Home';

            if ($folder_id == $destination) {
                $status_array[] = 'Could not move '.$folder_name.' to '.$destination_name.': it\'s the same folder.';
            } else {
                updateFolderSize($old_parent_folder, $folder_size, '-');
                updateFolderSize($destination, $folder_size, '+');
                $sqlite->executeCommands('update folders set parent_folder_id = '.$destination.' where rowid ='.$folder_id);
                $status_array[] = 'Moved '.$folder_name.' to '.$destination_name.'.';
            }
        }
    }
}

if (!empty($files)) {
    foreach ($files as $file_id) {
        if (!isIdValid($file_id, 'files')) {
            $status_array[] = 'Could not move '.$file_id.': file does not exist.';
        } elseif (!isPropertyOfUser($file_id, 'files')) {
            $status_array[] = 'Could not move '.$file_id.': no permission.';
        } else {
            $file_info = $sqlite->getIterator('select file_name, file_type, file_size, folder_id from files where rowid = '.$file_id)->fetch();
            $file_name = $file_info['file_name'];
            $file_type = $file_info['file_type'];
            $file_size = $file_info['file_size'];
            $old_folder_id = $file_info['folder_id'];
            $file_type = isset($file_type) ? '.'.$file_type : '';

            updateFolderSize($old_folder_id, $file_size, '-');
            updateFolderSize($destination, $file_size, '+');

            $sqlite->executeCommands('update files set folder_id = '.$destination.' where rowid ='.$file_id);
            $status_array[] = 'Moved '.$file_name.$file_type.' to '.$destination_name.'.';
        }
    }
}

echo json_encode($status_array);