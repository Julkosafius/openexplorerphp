<?php
date_default_timezone_set('UTC');

require 'SQLiteConnection.php';
require 'SQLiteUtilities.php';

require 'vendor\autoload.php';

use src\SQLiteConnection as SQLiteConnection;
use src\SQLiteUtilities as SQLiteUtilities;

$sqlite = new SQLiteUtilities((new SQLiteConnection())->connect());

function escape($html) {
    return htmlspecialchars($html, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

// doesn't function online if loaded AFTER an "include"
function redirect($url, $statusCode = 303) {
    header('Location: '.$url, true, $statusCode);
    die();
}

if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
}

function table_exists($table_name) {
    global $sqlite;
    return "" != $sqlite->getFirstColumnValue('SELECT name FROM sqlite_master WHERE type="table" AND name="'.$table_name.'"', 'name');
}

function generateLoginInfo() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip_address = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip_address = $_SERVER['REMOTE_ADDR'];
    }

    $country = ip_info($ip_address, "Country");
    return time().';'.$ip_address.';'.$country;
}

function mySHA256($str, $salt, $iterations) {
    for ($x = 0; $x < $iterations; $x++) {
        $str = hash('sha256', $str.$salt);
    }
    return $str;
}

function updateFolderSize($folder_id, $size, $operation = '+') {
    global $sqlite;

    $current_folder_id = $folder_id;
    $OG_folder_size = $sqlite->getFirstColumnValue('select folder_size as fs from folders where rowid = '.$folder_id, 'fs');

    while ($current_folder_id !== null) {
        // update size of current folder
        $current_folder_size = $sqlite->getFirstColumnValue('select folder_size as fs from folders where rowid = '.$current_folder_id, 'fs');
        
        if ($operation == '+') { // add

            $new_folder_size = $current_folder_size + $size;
            if ($new_folder_size > INTEGER_MAX_VALUE) {
                // restore original folder size and delete the file
                $sqlite->executeCommands('update folders set folder_size = '.$OG_folder_size.' where rowid = '.$current_folder_id);
                die();
            }

        } elseif ($operation == '-') { // subtract

            $new_folder_size = $current_folder_size - $size;
            if ($new_folder_size < 0) $new_folder_size = 0;
            
        }

        $sqlite->executeCommands('update folders set folder_size = '.$new_folder_size.' where rowid = '.$current_folder_id);

        // go to the parent folder
        $current_folder_id = $sqlite->getFirstColumnValue('select parent_folder_id as pf_id from folders where rowid = '.$current_folder_id, 'pf_id');
    }
}

function isIdValid($id, $table) {
    global $sqlite;
    switch ($table) {
        case 'user':
        case 'users':
            $id_count = $sqlite->getFirstColumnValue('select count(*) as count from users where user_id = "'.$id.'"', 'count');
            return $id_count > 0;
            break;

        case 'folder':
        case 'folders':
        case 'file':
        case 'files':
            if ($table == 'folder') $table = 'folders';
            if ($table == 'file') $table = 'files';
            // returns either 0 or 1 if folder doesn't / does exist
            return $sqlite->getFirstColumnValue('select count(rowid) as cnt from '.$table.' where exists (select rowid from '.$table.' where rowid= '.$id.') and rowid = '.$id, 'cnt');
            break;

        default:
            return false;
            break;
    }
}

function isPropertyOfUser($id, $table) {
    global $sqlite;
    if (!isset($_COOKIE['user_id'])) return false;
    switch ($table) {
        case 'folder':
        case 'folders':
            return $_COOKIE['user_id'] == $sqlite->getFirstColumnValue('select user_id from folders
               where user_id like "'.$_COOKIE['user_id'].'" and rowid = '.$id, 'user_id');

        case 'file':
        case 'files':
            return $_COOKIE['user_id'] == $sqlite->getFirstColumnValue('select user_id
                from files join folders on folders.rowid = files.folder_id
                where user_id like "'.$_COOKIE['user_id'].'" and files.rowid = '.$id, 'user_id');

        default:
            return false;
    }
}

function getInfo($id, $table) {
    global $sqlite;
    switch ($table) {
        case 'folder':
        case 'folders':
            return $sqlite->getIterator('select * from folders where rowid = '.$id)->fetch();
            break;

        case 'file':
        case 'files':
            return $sqlite->getIterator('select * from files where rowid = '.$id)->fetch();
            break;
        
        default:
            return [];
            break;
    }
}

function fileWasCopied($file_id) {
    global $sqlite;
    // if file was not copied, the request returs 1. 1-1 = 0 which is cast to false
    return (bool) ($sqlite->getFirstColumnValue('select count(file_hash) as cnt from files
            where file_hash like (select file_hash from files where rowid = '.$file_id.')', 'cnt') - 1);
}

function getFolderContents($folder_id) {
    global $sqlite;
    $curr_folder_info = $sqlite->getIterator('select parent_folder_id, folder_name from folders
                                     where rowid = "'.$folder_id.'"')->fetch(PDO::FETCH_ASSOC);
    $curr_folder_parent_id = $curr_folder_info['parent_folder_id'];
    $curr_folder_name = $curr_folder_info['folder_name'];
    $folders_iterator = $sqlite->getIterator('select rowid, folder_name, folder_time, folder_size, parent_folder_id
                                                from folders where parent_folder_id = "'.$folder_id.'"');
    $files_iterator = $sqlite->getIterator('select rowid, file_name, file_time, file_size, file_type, file_hash
                                                from files where folder_id = "'.$folder_id.'"');
    $folders = [];
    $files = [];
    while ($row = $folders_iterator->fetch(PDO::FETCH_ASSOC)) {
        $folders[] = [
            'folder_id' => $row['rowid'],
            'folder_name' => escape($row['folder_name']),
            'folder_time' => (int)escape($row['folder_time']),
            'folder_size' => (int)escape($row['folder_size']),
            'parent_folder_id' => $row['parent_folder_id']
        ];
    }
    while ($row = $files_iterator->fetch(PDO::FETCH_ASSOC)) {
        $files[] = [
            'file_id' => $row['rowid'],
            'file_name' => escape($row['file_name']),
            'file_time' => (int)escape($row['file_time']),
            'file_size' => (int)escape($row['file_size']),
            'file_type' => escape($row['file_type']),
            'file_hash' => escape($row['file_hash'])
        ];
    }
    return [
        'parent_id' => $curr_folder_parent_id,
        'curr_id' => $curr_folder_name,
        'folders' => $folders,
        'files' => $files
    ];
}

/**
 * Recursive function traversing the file tree inside a given folder (id).
 * If a folder has n subfolders, the function submits in total n+1 * 3 database requests (see getFolderContents for *3).
 * @param int $folder_id A valid folder id.
 * @returns array An array of two arrays: one with all found folder IDs, the other with all found file IDs.
 */
function traverseTree($folder_id) {
    $folder_contents = getFolderContents($folder_id);
    $folder_list = [];
    $file_list = [];
    $elements = array_merge($folder_contents['folders'], $folder_contents['files']);
    if (!empty($elements)) {
        for ($i = 0; $i < count($elements); $i++) {
            if (isset($elements[$i]['folder_id'])) {
                $folder_list[] = $elements[$i]['folder_id'];
                $subfolder_contents = traverseTree($elements[$i]['folder_id']);
                $folder_list = array_merge($folder_list, $subfolder_contents[0]);
                $file_list = array_merge($file_list, $subfolder_contents[1]);
            } else {
                $file_list[] = $elements[$i]['file_id'];
            }
        }
    }
    return [$folder_list, $file_list];
}

function getFileType($file_name) {
    $file_type = '';
    if (str_contains($file_name, '.')) {
        $tmp = explode('.', $file_name); // cannot pass explode directly into end!!
        $file_type = strtolower(end($tmp));
    }
    return $file_type;
}

function ip_info($ip = NULL, $purpose = "location", $deep_detect = TRUE) {
    $output = NULL;
    if (filter_var($ip, FILTER_VALIDATE_IP) === FALSE) {
        $ip = $_SERVER["REMOTE_ADDR"];
        if ($deep_detect) {
            if (filter_var(@$_SERVER['HTTP_X_FORWARDED_FOR'], FILTER_VALIDATE_IP))
                $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
            if (filter_var(@$_SERVER['HTTP_CLIENT_IP'], FILTER_VALIDATE_IP))
                $ip = $_SERVER['HTTP_CLIENT_IP'];
        }
    }
    $purpose    = str_replace(array("name", "\n", "\t", " ", "-", "_"), NULL, strtolower(trim($purpose)));
    $support    = array("country", "countrycode", "state", "region", "city", "location", "address");
    $continents = array(
        "AF" => "Africa",
        "AN" => "Antarctica",
        "AS" => "Asia",
        "EU" => "Europe",
        "OC" => "Australia (Oceania)",
        "NA" => "North America",
        "SA" => "South America"
    );
    if (filter_var($ip, FILTER_VALIDATE_IP) && in_array($purpose, $support)) {
        $ipdat = @json_decode(file_get_contents("https://www.geoplugin.net/json.gp?ip=".$ip));
        if (@strlen(trim($ipdat->geoplugin_countryCode)) == 2) {
            switch ($purpose) {
                case "location":
                    $output = array(
                        "city"           => @$ipdat->geoplugin_city,
                        "state"          => @$ipdat->geoplugin_regionName,
                        "country"        => @$ipdat->geoplugin_countryName,
                        "country_code"   => @$ipdat->geoplugin_countryCode,
                        "continent"      => @$continents[strtoupper($ipdat->geoplugin_continentCode)],
                        "continent_code" => @$ipdat->geoplugin_continentCode
                    );
                    break;
                case "address":
                    $address = array($ipdat->geoplugin_countryName);
                    if (@strlen($ipdat->geoplugin_regionName) >= 1)
                        $address[] = $ipdat->geoplugin_regionName;
                    if (@strlen($ipdat->geoplugin_city) >= 1)
                        $address[] = $ipdat->geoplugin_city;
                    $output = implode(", ", array_reverse($address));
                    break;
                case "city":
                    $output = @$ipdat->geoplugin_city;
                    break;
                case "region":
                case "state":
                    $output = @$ipdat->geoplugin_regionName;
                    break;
                case "country":
                    $output = @$ipdat->geoplugin_countryName;
                    break;
                case "countrycode":
                    $output = @$ipdat->geoplugin_countryCode;
                    break;
            }
        }
    }
    return $output;
}
