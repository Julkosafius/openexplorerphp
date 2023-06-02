<?php
require 'app/globals.php';
require 'app/utilities.php';

// imports default timezone from utilities
global $I18N;
global $allowed_file_types;
global $sqlite;

$file = $_FILES['file'];

$folder_id = $_POST['destination_folder'];

$status_message = $I18N["file_upload_fail"].': ';
switch ($file['error']) {
    case UPLOAD_ERR_OK:
        $status_message = false;
        break;
    case UPLOAD_ERR_INI_SIZE:
    case UPLOAD_ERR_FORM_SIZE:
        $status_message .= $I18N["file_upload_fail_too_large"].ini_get('upload_max_filesize');
        break;
    case UPLOAD_ERR_PARTIAL:
        $status_message .= $I18N["file_upload_fail_incomplete"];
        break;
    case UPLOAD_ERR_NO_FILE:
        $status_message .= $I18N["file_upload_fail_empty"];
        break;
    default:
        $status_message .= $I18N["file_upload_fail_internal"].$file['error'];
        break;
}

if (!$status_message) {     
    if (!is_uploaded_file($file['tmp_name'])) {
        $status_message = $I18N["file_upload_fail"].': '.$I18N["error_unknown"];
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
            $status_message = $I18N["file_upload_fail"].': '.$file_name.'.'.$file_type.' – '.$I18N['error_name_too_long'];
        } elseif ($file_size >= INTEGER_MAX_VALUE) {
            $status_message = $I18N["file_upload_fail"].': '.$file_name.'.'.$file_type.' – '.$I18N['file_upload_fail_too_large_folder'];
        } elseif (!in_array($mime_info->file($file['tmp_name']), $allowed_file_types)) {
            $status_message = $I18N["file_upload_fail"].': '.$file_name.'.'.$file_type.' – '.$I18N['file_upload_fail_bad_type'];
        } elseif (!move_uploaded_file($file['tmp_name'], $location)) {
            // No error suppression so we can see the underlying error.
            $status_message = $I18N["file_upload_fail"].': '.$file_name.'.'.$file_type.' – '.$I18N['file_upload_fail_permissions'];
        } else {
            $status_message = $I18N["file_upload_ok"].': '.$file_name.'.'.$file_type;

            // update folder_size of all folders up to root by adding $file_size
            updateFolderSize($folder_id, $file_size, '+');

            // log to database
            $sqlite->executeCommands('insert into files(folder_id, file_name, file_time, file_size, file_type, file_hash) values ("'.$folder_id.'", "'.$file_name.'", "'.$file_time.'", '.$file_size.', "'.$file_type.'", "'.$file_hash.'")');
        }
    }
}

echo $status_message;
