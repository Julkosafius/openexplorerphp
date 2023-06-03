<?php
require 'app/globals.php';
require 'app/utilities.php';
require 'app/ZipFile.php';

global $I18N;
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
define("PATH_PREAMBLE", 'data'.DIRECTORY_SEPARATOR.$_COOKIE['user_id'].DIRECTORY_SEPARATOR);

$file_paths = [];
$added_sth = false;

if (!empty($folders)) {
    foreach ($folders as $folder_id) {
        if (!isIdValid($folder_id, 'folders')) {
            echo $I18N['zip_fail'].': '.$I18N['zip_fail_folder_not_found'];
            die();
        } elseif (!isPropertyOfUser($folder_id, 'folders')) {
            echo $I18N['zip_fail'].': '.$I18N['error_no_permission'];
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
        if (!isIdValid($file_id, 'files')) {
            echo $I18N['zip_fail'].': '.$I18N['zip_fail_file_sub_not_found'];
            die();
        } elseif (!isPropertyOfUser($file_id, 'files')) {
            echo $I18N['zip_fail'].': '.$I18N['error_no_permission'];
            die();
        }
        $zip_path = $file_info['zip_path'];
        $file_type = $file_info['file_type'];
        $file_hash = $file_info['file_hash'];
        $system_path = PATH_PREAMBLE.$file_hash.'.'.$file_type;
        if (!file_exists($system_path)) {
            echo $I18N['zip_fail'].': '.$zip_path.' – '.$I18N['error_not_found'];
            die();
        }
        $zip->addFile(file_get_contents($system_path), $zip_path);
        $added_sth = true;
    }
}

// add all directly selected files
if (!empty($files)) {
    foreach ($files as $file_id) {
        if (!isIdValid($file_id, 'files')) {
            echo $I18N['zip_fail'].': '.$I18N['zip_fail_file_not_found'];
            die();
        } elseif (!isPropertyOfUser($file_id, 'files')) {
            echo $I18N['zip_fail'].': '.$I18N['error_no_permission'];
            die();
        }
        $file_info = getInfo($file_id, 'files');
        $file_name = $file_info['file_name'];
        $file_type = $file_info['file_type'];
        $file_hash = $file_info['file_hash'];
        $system_path = PATH_PREAMBLE.$file_hash.'.'.$file_type;
        if (!file_exists($system_path)) {
            echo $I18N['zip_fail'].': '.$file_name.'.'.$file_type.' – '.$I18N['error_not_found'];
            die();
        }
        $zip->addFile(file_get_contents($system_path), $file_name.'.'.$file_type);
        $added_sth = true;
    }
}

if ($added_sth) {
    header('Content-type: application/octet-stream');
    header('Content-Disposition: attachment; filename=download.zip');
    header('Content-Description: Files of an applicant');

// get the zip content and send it back to the browser
    echo $zip->file();
} else {
    echo $I18N['zip_fail'].': '.$I18N['zip_fail_no_file'];
}
