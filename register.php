<?php

use src\SQLiteConnection;
use src\SQLiteUtilities;

require 'src/globals.php';
require 'src/utilities.php';

global $sqlite, $I18N;

function insertUser($user_name, $tmp) {
    global $salt, $sqlite;
    
    $password = mySHA256($tmp, $salt, 10000);
    $user_time = time();
    $user_id = md5($user_name.$password.$user_time);

    $account_dates = generateLoginInfo();

    $new_user_commands = [
        'insert into users(user_id, user_name, password, register_date, last_login_date)
        values("'.$user_id.'","'.$user_name.'","'.$password.'","'.$account_dates.'","'.$account_dates.'")',
        'insert into folders(user_id, folder_name, parent_folder_id)
        values("'.$user_id.'","root", null)'
    ];

    $sqlite->executeCommands(...$new_user_commands);

    mkdir('data/'.$user_id, USER_DIR_PERMS);

    return $user_id;
}

$usernameResponse = "";
$passwordResponse = "";

$checkUsername = function($user_name) {
    global $usernameResponse, $I18N;

    $sqlite = new SQLiteUtilities((new SQLiteConnection())->connect());
    $user_name_count = $sqlite->getFirstColumnValue('select count(*) as count from users where user_name = "'.$user_name.'"', 'count');

    $isNotTaken = $user_name_count == 0;
    $isLongEnough = strlen($user_name) >= MIN_USER_NAME_LENGTH;
    $isAlphaNumeric = ctype_alnum($user_name);

    if (!$isNotTaken) $usernameResponse .= $I18N['username_taken'];
    if (!$isLongEnough) $usernameResponse .= '; '.$I18N['username_too_short'];
    if (!$isAlphaNumeric) $usernameResponse .= '; '.$I18N['username_illegal'];

    return $isNotTaken && $isLongEnough && $isAlphaNumeric;
};

$checkPasswords = function($pw1, $pw2) {
    global $passwordResponse, $I18N;

    $areMatching = strcmp($pw1, $pw2) === 0;
    $isLongEnough = max(strlen($pw1), strlen($pw2)) >= MIN_PASSWORD_LENGTH;

    if (!$areMatching) $passwordResponse .= $I18N["password_nomatch"];
    if (!$isLongEnough) $passwordResponse .= '; '.$I18N["password_too_short"];

    return $areMatching && $isLongEnough;
};

// check input data via PHP AFTER submit
if (isset($_POST['username'])) {
    $user_name = trim($_POST['username']);
    $password1 = $_POST['new-password'];
    $password2 = $_POST['password2'];
    $user_name_OK = $checkUsername($user_name);
    $password_OK = $checkPasswords($password1, $password2);
    if ($user_name_OK && $password_OK) {

        $user_id = insertUser($user_name, $password1);

        setcookie('user_id', $user_id, 0, '/');

        redirect('index.php');
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= ucfirst($I18N['register']) ?></title>
    <link rel="stylesheet" href="public/stylesheets/normalize.css" type="text/css">
    <link rel="stylesheet" href="public/stylesheets/generalstyles.css" type="text/css">
    <link rel="shortcut icon" href="public/images/favico/favico_r.ico" type="image/x-icon">
</head>
<body>
    <form action="" class="visually-hidden">
        <label for="lightTheme">Light Theme</label>
        <input type="radio" id="lightTheme" name="theme">
        <label for="darkTheme">Dark Theme</label>
        <input type="radio" id="darkTheme" name="theme">
    </form>

    <h1><?= ucfirst($I18N['register']) ?>!</h1>
    <form id="register_form" method="post">
        <label for="user_name"><?= ucfirst($I18N['username']) ?>:</label>
        <input id="user_name" name="username" type="text" maxlength="255"
               required="required" autocomplete="username" autofocus>
        <label for="password1"><?= ucfirst($I18N['password']) ?>:</label>
        <input id="password1" name="new-password" type="password" required="required" autocomplete="new-password">
        <label for="password2"><?= ucfirst($I18N['password_retype']) ?>:</label>
        <input id="password2" name="password2" type="password" required="required" autocomplete="new-password">
        <p id="user_name_info"><?= trim($usernameResponse) ?></p>
        <p id="password_info"><?= trim($passwordResponse) ?></p>
        <button id="submit_btn" type="submit"><?= ucfirst($I18N['register']) ?></button>
    </form>
    <p>
        <small><?= ucfirst($I18N['login_msg']) ?>
            <a href="login.php"><?= ucfirst($I18N['login']) ?></a>
        </small>
    </p>

    <script src="public/javascripts/theme.js" type="module"></script>
    <script src="public/javascripts/register.js" type="module"></script>
</body>
</html>