<?php

require 'vendor/autoload.php';

use App\SQLiteConnection as SQLiteConnection;
use App\SQLiteUtilities as SQLiteUtilities;

$pdo = (new SQLiteConnection())->connect();

if ($pdo != null)
    $connectionResponse = "> Connected to the SQLite database successfully!";
else
    $connectionResponse = "> Oops, could not connect to the SQLite database.";


$table_commands = [
    'create table if not exists users (
        user_id char(32) primary key,
        user_name varchar(255) not null,
        password varchar(64) not null,
        register_date integer not null,
        last_login_date integer not null
    )',
    'create table if not exists folders (
        user_id char(32) not null,
        folder_name varchar(255) not null,
        parent_folder_id char(32),
        folder_time integer,
        folder_size integer,
        foreign key (parent_folder_id) references folders(rowid)
        on delete cascade,
        foreign key (user_id) references users(user_id)
        on delete cascade,
        constraint not_parent_of_oneself check ( parent_folder_id != rowid )
    )',
    'create table if not exists files (
        folder_id integer not null,
        file_name varchar(255) not null,
        file_time integer not null,
        file_size integer not null,
        file_type varchar(255) not null,
        file_hash char(32) not null,
        foreign key (folder_id) references folders(rowid)
        on delete cascade
    )'
];

$sqlite = new SQLiteUtilities((new SQLiteConnection())->connect());

$sqlite->executeCommands(...$table_commands);
$table_list = $sqlite->getTableList();

if (count($table_commands) === count($table_list)) {
    $generalResponse = "> Everything went down successfully!";
} else {
    $generalResponse = "> Oops, something went wrong.";
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database set up</title>
    <link rel="stylesheet" href="public/stylesheets/normalize.css" type="text/css">
    <link rel="stylesheet" href="public/stylesheets/generalstyles.css" type="text/css">
</head>
<body>
    
    <h1>Database set up</h1>
    <p><?= $connectionResponse ?></p>
    <p><?= $generalResponse ?></p>
    <table>
        <caption>Generated tables.</caption>
        <thead>
            <tr>
                <th>Nr.</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
<?php
foreach ($table_list as $idx => $table_name) {
?>
            <tr>
                <td><?= ++$idx ?></td><td><?= $table_name ?></td>
            </tr>
<?php
}
?>
        </tbody>
    </table>
</body>
</html>