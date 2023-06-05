<?php

require 'vendor/autoload.php';

use src\SQLiteConnection as SQLiteConnection;
use src\SQLiteUtilities as SQLiteUtilities;

$pdo = (new SQLiteConnection())->connect();

if ($pdo != null)
    $connectionResponse = "Connected to the SQLite database successfully!";
else
    $connectionResponse = "Oops, could not connect to the SQLite database.";


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
        on delete cascade
        /*constraint not_parent_of_oneself check ( parent_folder_id != rowid )
          ... has no effect.*/
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
    $generalResponse = "Everything went down successfully!";
} else {
    $generalResponse = "Oops, something went wrong.";
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database set-up</title>
    <link rel="stylesheet" href="public/stylesheets/normalize.css" type="text/css">
    <link rel="stylesheet" href="public/stylesheets/generalstyles.css" type="text/css">
    <style>
        #wrapper {
            height: initial;
            width: min(50ch, 100% - 7rem);
        }

        h1 { text-align: center; }

        table {
            border-radius: var(--border-radius);
            background: dimgrey;
            margin: 0 auto;
            width: 80%;
        }

        th, td { padding: 0.25em; }
        td:first-child { text-align: right; }

        tr {
            border-radius: var(--border-radius);
            display: grid;
            grid-template-columns: 1fr 2fr;
            margin: 0.25em;
        }
        tbody tr:hover {
            background: var(--highlight)!important;
        }
        tbody tr:nth-child(even) {
            background: silver;
        }
        tbody tr:nth-child(odd) {
            background: darkgray;
        }
    </style>
</head>
<body>
    
    <div id="wrapper">
        <h1>Database set-up</h1>
        <noscript>You will need to have JavaScript enabled to use the app!</noscript>
        <ul>
            <li><?= $connectionResponse ?></li>
            <li><?= $generalResponse ?></li>
        </ul>
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
        <p>You can now try to reload the page or go manually to <code>index.php</code></p>
    </div>

    <script type="module" src="public/javascripts/theme.js"></script>
</body>
</html>