<?php
require 'app/globals.php';
require 'app/utilities.php';

global $sqlite; // inherits database connection from utilities

$all_files_to_delete = [];
$all_folders_to_delete = [];
$status_array = [];

$remove_file_extension = function($value) {
    return pathinfo($value, PATHINFO_FILENAME);
};
// files array enables fast search using isset($files['filename'])
$files = array_flip(array_map($remove_file_extension, scandir('data'.DIRECTORY_SEPARATOR.$_COOKIE['user_id'].DIRECTORY_SEPARATOR)));
// remove the '.' and '..' entry from scandir array
unset($files['']);
unset($files['.']);

// echo print_r($_POST, true);

function deleteFile($file_id, $physicalDelete = true) {
    global $sqlite, $files, $status_array;
    $file_info = getInfo($file_id, 'files');
    $file_name = $file_info['file_name'];
    $file_hash = $file_info['file_hash'];
    $file_type = $file_info['file_type'];
    $file_size = $file_info['file_size'];
    $folder_id = $file_info['folder_id'];
    if (!empty($file_hash) && isset($files[$file_hash])) {
        // PHP interpreter doesn't try to unlink file if $physicalDelete is already false (the conjunction can't become true anymore)
        if ($physicalDelete && !unlink('data'.DIRECTORY_SEPARATOR.$_COOKIE['user_id'].DIRECTORY_SEPARATOR.$file_hash.'.'.$file_type)) {
            $status_array[] = 'Error uploading '.$file_name.'.'.$file_type.': could not be deleted.';
        } else {
            $sqlite->executeCommands('delete from files where rowid = '.$file_id);        
            unset($files[$file_hash]); // remove file hash from search array

            // update folder_size of all folders up to root by subtracting $file_size
            updateFolderSize($folder_id, $file_size, '-');

            $status_array[] = "Deleted file: ".$file_name.'.'.$file_type;
        }
    }
}

function deleteFolder($folder_id) {
    global $sqlite, $status_array;
    $folder_name = $sqlite->getFirstColumnValue('select folder_name as fn from folders where rowid = '.$folder_id, 'fn');
    $sqlite->executeCommands('delete from folders where rowid = '.$folder_id);
    $status_array[] = "Deleted folder: ".$folder_name;
}

// get all files and folders to be deleted

if (!empty($_POST['files'])) {
    $all_files_to_delete = $_POST['files'];
}

if (!empty($_POST['folders'])) {
    $all_folders_to_delete = $_POST['folders'];
    foreach ($_POST['folders'] as $folder_id) {
        $found_elements = traverseTree($folder_id);
        // array_merge does not work ...
        // experimental:
        // if (!empty($found_elements[0])) array_push($all_folders_to_delete, ...$found_elements[0]);
        // if (!empty($found_elements[1])) array_push($all_files_to_delete, ...$found_elements[1]);
        foreach ($found_elements[0] as $folder) $all_folders_to_delete[] = $folder;
        foreach ($found_elements[1] as $file) $all_files_to_delete[] = $file;
    }
}

// echo print_r(['f' => $all_files_to_delete, 'd' => $all_folders_to_delete], true);

// delete all files (each one first from disk, then from database)
foreach ($all_files_to_delete as $file_id) {
    if (!isIdValid($file_id, 'files')) {
        $status_array[] = 'Could not delete '.$file_id.': file does not exist.';
    } elseif (!isPropertyOfUser($file_id, 'files')) {
        $status_array[] = 'Could not delete '.$file_id.': no permission.';
    } else {
        // if file was copied don't erase the physical file from disk
        deleteFile($file_id, $physicalDelete = !fileWasCopied($file_id));
    }
}

// delete all folders
foreach ($all_folders_to_delete as $folder_id) {
    if (!isIdValid($folder_id, 'folders')) {
        $status_array[] = 'Could not delete '.$folder_id.': folder does not exist.';
    } elseif (!isPropertyOfUser($folder_id, 'folders')) {
        $status_array[] = 'Could not delete '.$folder_id.': no permission.';
    } else {
        deleteFolder($folder_id);
    }
}

echo json_encode($status_array);