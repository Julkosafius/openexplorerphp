<?php

require 'app/utilities.php';
require 'app/globals.php';

print_r($_COOKIE);

if (!isset($_COOKIE['locale'])) {
    setcookie('locale', locale_get_default(), 0, '/');
}

if (!isset($_COOKIE['user_id'])) {
    redirect('login.php');
} elseif (isIdValid($_COOKIE['user_id'], 'users')) {
    include 'folder.php';
} else {
    redirect('login.php');
}

die();