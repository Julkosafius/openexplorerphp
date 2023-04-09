<pre>
<?php
require 'vendor/autoload.php';
require 'app/utilities.php';

use App\SQLiteConnection as SQLiteConnection;
use App\SQLiteUtilities as SQLiteUtilities;

$sqlite = new SQLiteUtilities((new SQLiteConnection())->connect());

if (!isset($_GET['folder_id'])){
    echo 'No folder id given.';
    die();
}

$start_folder_id = $_GET['folder_id'];


if ($start_folder_id < 1 || $start_folder_id > $sqlite->getFirstColumnValue('select max(rowid) as m from files', 'm')) {
    echo 'No valid folder id.';
    die();
}

/**
 * Recursive function traversing the file tree of a given folder id.
 * It uses the global arrays $directory_list and $file_list as output.
 * If a directory has in total n subdirectories, the function submits in total n+1 * 3 database requests (see getFolderContents).
 * @param int folder_id A valid folder id.
 */
function traverseTree($folder_id) {
    $folder_contents = getFolderContents($folder_id);
    $directory_list = [];
    $file_list = [];
    $elements = array_merge($folder_contents[1], $folder_contents[2]);
    if (count($elements) > 0) {
        for ($i = 0; $i < count($elements); $i++) {
            if (isset($elements[$i]['folder_id'])) {
                $directory_list[] = $elements[$i]['folder_id'];
                $subdirectory_contents = traverseTree($elements[$i]['folder_id']);
                $directory_list = array_merge($directory_list, $subdirectory_contents[0]);
                $file_list = array_merge($file_list, $subdirectory_contents[1]);
            } else {
                $file_list[] = [
                    'file_id' => $elements[$i]['file_id'],
                    'file_hash' => $elements[$i]['file_hash']
                ];
            }
        }
    }
    return array($directory_list, $file_list);
}

$info = traverseTree($start_folder_id);

echo print_r([
    'directories' => $info[0],
    'files' => $info[1]
], true);