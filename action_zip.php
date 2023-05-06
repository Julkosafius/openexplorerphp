<?php
require 'app/globals.php';
require 'app/utilities.php';
require 'app/ZipFile.php';

global $sqlite; // inherits database connection from utilities

function findAllFiles($folder_id, $path = '') {
    global $file_paths;
    $folder_contents = getFolderContents($folder_id);
    $elements = array_merge($folder_contents['folders'], $folder_contents['files']);
    if (!empty($elements)) {
        for ($i = 0; $i < count($elements); $i++) {
            if (isset($elements[$i]['folder_id'])) {
                findAllFiles($elements[$i]['folder_id'], $path.$elements[$i]['folder_name'].DIRECTORY_SEPARATOR);
            } else {
                $file_paths[$elements[$i]['file_id']] = [
                    'zip_path' => $path.$elements[$i]['file_name'].'.'.$elements[$i]['file_type'],
                    'file_type' => $elements[$i]['file_type'],
                    'file_hash' => $elements[$i]['file_hash']
                ];
            }
        }
    }
}

$files = isset($_GET['files']) ? $_GET['files'] : null;
$folders = isset($_GET['folders']) ? $_GET['folders'] : null;
define("PATH_PREAMBLE", 'data' . DIRECTORY_SEPARATOR . $_COOKIE['user_id'] . DIRECTORY_SEPARATOR);

$file_paths = [];

if (!empty($folders)) {
    foreach ($folders as $folder_id) {
        if (!isIdValid($folder_id, 'folders')) {
            echo 'One or more of the folders to be zipped do not exist.';
            die();
        } elseif (!isPropertyOfUser($folder_id, 'folders')) {
            echo 'One or more of the folders to be zipped does not belong to you.';
            die();
        }
        $folder_info = getInfo($folder_id, 'folders');
        findAllFiles($folder_id, $folder_info['folder_name'].DIRECTORY_SEPARATOR);
    }
}

$zip = new ZipFile();

// add all files from subfolders (and create them in the process)
if (!empty($file_paths)) {
    foreach ($file_paths as $file_id => $file_info) {
        if (!isIdValid($file_id, 'folders')) {
            echo 'One or more of the files from a subfolder to be zipped do not exist.';
            die();
        } elseif (!isPropertyOfUser($file_id, 'files')) {
            echo 'One or more of the files to be zipped does not belong to you.';
            die();
        }
        $zip_path = $file_info['zip_path'];
        $file_type = $file_info['file_type'];
        $file_hash = $file_info['file_hash'];
        $system_path = PATH_PREAMBLE.$file_hash.'.'.$file_type;
        if (!file_exists($system_path)) {
            echo $zip_path.' does not exist anymore.';
            die();
        }
        $zip->addFile(file_get_contents($system_path), $zip_path);
    }
}

// add all directly selected files
if (!empty($files)) {
    foreach ($files as $file_id) {
        if (!isIdValid($file_id, 'files')) {
            echo 'One or more of the files to be zipped do not exist.';
            die();
        } elseif (!isPropertyOfUser($file_id, 'files')) {
            echo 'One or more of the files to be zipped does not belong to you.';
            die();
        }
        $file_info = getInfo($file_id, 'files');
        $file_name = $file_info['file_name'];
        $file_type = $file_info['file_type'];
        $file_hash = $file_info['file_hash'];
        $system_path = PATH_PREAMBLE.$file_hash.'.'.$file_type;
        if (!file_exists($system_path)) {
            echo $file_name.'.'.$file_type.' does not exist anymore.';
            die();
        }
        $zip->addFile(file_get_contents($system_path), $file_name.'.'.$file_type);
    }
}

header("Content-type: application/octet-stream");
header("Content-Disposition: attachment; filename=download.zip");
header("Content-Description: Files of an applicant");

// get the zip content and send it back to the browser
echo $zip->file();
