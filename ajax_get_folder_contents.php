<?php
require 'src/utilities.php';

if (!isset($_POST['folder_id'])) die();

$folder_id = $_POST['folder_id'];

setcookie('folder_id', $folder_id, 0, '/');

echo json_encode(getFolderContents($folder_id));