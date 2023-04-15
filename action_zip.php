<?php
require 'app/globals.php';
require 'app/utilities.php';
require 'app/ZipFile.php';

global $sqlite; // inherits database connection from utilities

// // Add files to the zip file inside demo_folder
// $zip->addFile('test.pdf', 'demo_folder/test.pdf');

// // Add random.txt file to zip and rename it to newfile.txt and store in demo_folder
// $zip->addFile('random.txt', 'demo_folder/newfile.txt');

// // Add a file demo_folder/new.txt file to zip using the text specified
// $zip->addFromString('demo_folder/new.txt', 'text to be added to the new.txt file');

// $zip->addEmptyDir("hello\hello2");

function findAllFiles($folder_id, $path = '') {
    global $file_paths, $empty_folder_paths;
    $folder_contents = getFolderContents($folder_id);
    $elements = array_merge($folder_contents['folders'], $folder_contents['files']);
    if (!empty($elements)) {
        for ($i = 0; $i < count($elements); $i++) {
            if (isset($elements[$i]['folder_id'])) {
                $subfolder_contents = findAllFiles($elements[$i]['folder_id'], $path.$elements[$i]['folder_name'].DIRECTORY_SEPARATOR);
            } else {
                $file_paths[$elements[$i]['file_id']] = [
                    'zip_path' => $path.$elements[$i]['file_name'].'.'.$elements[$i]['file_type'],
                    'file_type' => $elements[$i]['file_type'],
                    'file_hash' => $elements[$i]['file_hash']
                ];
            }
        }
    } else {
        $empty_folder_paths[] = $path;
    }
}

$files = isset($_POST['files']) ? $_POST['files'] : null;
$folders = isset($_POST['folders']) ? $_POST['folders'] : null;

$file_paths = [];
$empty_folder_paths = [];

if (!empty($folders)) {
    foreach ($folders as $folder_id) {
        $folder_info = getInfo($folder_id, 'folders');
        findAllFiles($folder_id, $folder_info['folder_name'].DIRECTORY_SEPARATOR);
    }
}

$zip = new ZipArchive();

if ($zip->open('zip/'.$_COOKIE['user_id'].'.zip', ZipArchive::CREATE) !== TRUE) {
    echo "Error";
}

foreach ($empty_folder_paths as $folder_path) {
    // https://stackoverflow.com/a/39967268
    $zip->addEmptyDir($folder_path);
}

foreach ($file_paths as $file_id => $file_info) {
    $zip_path = $file_info['zip_path'];
    $file_type = $file_info['file_type'];
    $file_hash = $file_info['file_hash'];
    $system_path = 'data'.DIRECTORY_SEPARATOR.$_COOKIE['user_id'].DIRECTORY_SEPARATOR.$file_hash.'.'.$file_type;
    $zip->addFile($system_path, $zip_path);
}

if (!empty($files)) {
    foreach ($files as $file_id) {
        $file_info = getInfo($file_id, 'files');
        $file_name = $file_info['file_name'];
        $file_type = $file_info['file_type'];
        $file_hash = $file_info['file_hash'];
        $system_path = 'data'.DIRECTORY_SEPARATOR.$_COOKIE['user_id'].DIRECTORY_SEPARATOR.$file_hash.'.'.$file_type;
        $zip->addFile($system_path, $file_name.'.'.$file_type);
    }
}

$zip->close();

echo 'zip/'.$_COOKIE['user_id'].'.zip';
