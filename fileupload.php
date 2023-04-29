<?php
require 'app/globals.php';
require 'app/utilities.php';

// imports default timezone from utilities
global $sqlite; 

function reorderFileArray($file_post) {
    $file_arr = [];
    $file_count = count($file_post['name']);
    $file_keys = array_keys($file_post);
    for ($i = 0; $i < $file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_arr[$i][$key] = $file_post[$key][$i];
        }
    }
    return $file_arr;
}

// get names of the uploaded file
$files = reorderFileArray($_FILES['files']);
// file_put_contents("t.txt", print_r($files, true)."\n\n".print_r($_FILES, true));

$folder_id = $_POST['destination_folder'];
$status_array = [];

foreach ($files as $file) {
    $status_message = 'Error uploading file';
    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            $status_message = false;
        break;
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $status_message .= ': too large (limit of '.ini_get("upload_max_filesize").' bytes).';
        break;
        case UPLOAD_ERR_PARTIAL:
            $status_message .= ': upload was not completed.';
        break;
        case UPLOAD_ERR_NO_FILE:
            $status_message .= ': zero-length file uploaded.';
        break;
        default:
            $status_message .= ': internal error #'.$file['error'].'.';
        break;
    }

    if (!$status_message) {  
        if (!is_uploaded_file($file['tmp_name'])) {
            $status_message = 'Error uploading file: unknown error.';
        } else {
            $file_name = $file['name'];

            $file_hash = md5(md5_file($file['tmp_name']).time());
            $file_type = getFileType($file_name);
            $file_name = pathinfo($file_name, PATHINFO_FILENAME);
            $file_size = filesize($file['tmp_name']);
            $file_time = filemtime($file['tmp_name']);

            $location = 'data'.DIRECTORY_SEPARATOR.$_COOKIE['user_id'].DIRECTORY_SEPARATOR.$file_hash.'.'.$file_type;
            $mime_info = new finfo(FILEINFO_MIME_TYPE); 

            // check data integrity
            if (strlen($file_name) > MAX_FILE_NAME_LEN) {
                $status_message = 'Error uploading '.$file_name.'.'.$file_type.': file name too long.';
            } elseif ($file_size >= INTEGER_MAX_VALUE) {
                $status_message = 'Error uploading '.$file_name.'.'.$file_type.': file too large for this folder.';
            } elseif (!in_array($mime_info->file($file['tmp_name']), $allowed_file_types)) {
                $status_message = 'Error uploading '.$file_name.'.'.$file_type.': file type not allowed.';
            } elseif (!move_uploaded_file($file['tmp_name'], $location)) { // No error suppression so we can see the underlying error.
                $status_message = 'Error uploading '.$file_name.'.'.$file_type.': could not save upload (this will probably be a permissions problem in '.$location.')';
            } else {
                $status_message = $file_name.'.'.$file_type.' uploaded successfully.';

                // update folder_size of all folders up to root by adding $file_size
                updateFolderSize($folder_id, $file_size, '+');

                // log to database
                $sqlite->executeCommands('insert into files(folder_id, file_name, file_time, file_size, file_type, file_hash) values ("'.$folder_id.'", "'.$file_name.'", "'.$file_time.'", '.$file_size.', "'.$file_type.'", "'.$file_hash.'")');
            }
        }
    }
    $status_array[] = $status_message;
}

// file_put_contents("u.txt", print_r(json_encode($status_array), true));

echo json_encode($status_array);
