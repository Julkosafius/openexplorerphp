<?php
require 'app/utilities.php';

if (!isset($_REQUEST['folder_id'])) die();

$folder_id = $_REQUEST['folder_id'];

setcookie('folder_id', $folder_id, 0, '/');

echo json_encode(getFolderContents($folder_id));