<?php
require 'src/utilities.php';
require 'src/globals.php';

if (!isset($_COOKIE['locale'])) {
    setcookie('locale', locale_get_default(), 0, '/');
}

if (!table_exists('users')
    || !table_exists('folders')
    || !table_exists('files')) {
    include 'setupdb.php';
    die();
}

if (!isset($_COOKIE['user_id'])) {
    redirect('login.php');
} elseif (isIdValid($_COOKIE['user_id'], 'users')) {
    include 'folder.php';
} else {
    redirect('login.php');
}

die();