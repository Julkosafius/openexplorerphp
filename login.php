<?php
require 'app/globals.php';
require 'app/utilities.php';

global $salt, $sqlite, $lang;

function doesLoginDataExist($user_name, $password) {
    global $sqlite, $salt;
    $password = mySHA256($password, $salt, 10000);
    $user_count = $sqlite->getFirstColumnValue('select count(*) as count from users where user_name = "'.$user_name.'" and password = "'.$password.'"', 'count');
    return $user_count > 0;
}

$loginResponse = "";

if (isset($_POST['username'])) {
    $user_name = trim($_POST['username']);
    $password = trim($_POST['current-password']);

    if (!doesLoginDataExist($user_name, $password)) {
        $loginResponse = USER_NAME_OR_PASSWORD_WRONG;
    } else {
        $new_user_id = $sqlite->getFirstColumnValue('select user_id as uid from users where user_name like "'.$user_name.'" and password like "'.mySHA256($password, $salt, 10000).'"', 'uid');
        // save the current (last) login time, ip and place
        $sqlite->executeCommands('update users set last_login_date = "'.generateLoginInfo().'" where user_id like "'.$new_user_id.'"');
        setcookie('user_id', $new_user_id, 0, '/');
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
    <title><?= ucwords($lang['login']) ?></title>
    <link rel="stylesheet" href="public/stylesheets/normalize.css" type="text/css">
    <link rel="stylesheet" href="public/stylesheets/generalstyles-new.css" type="text/css">
    <link rel="shortcut icon" href="public/images/favico/favico_r.ico" type="image/x-icon">
</head>
<body>
    <h1><?= ucwords($lang['login']) ?>!</h1>
    <form id="login_form" method="post">
        <label for="user_name"><?= ucwords($lang['user_name']) ?>:</label>
        <input id="user_name" name="username" type="text" maxlength="255"
               required="required" autocomplete="username" autofocus>
        <label for="password"><?= ucwords($lang['password']) ?>:</label>
        <input id="password" name="current-password" type="password"
               required="required" autocomplete="current-password">
        <p id="info"><?= trim($loginResponse) ?></p>
        <button id="submit_btn" type="submit"><?= ucwords($lang['login']) ?></button>
    </form>

    <script src="public/javascripts/login.js" type="module"></script>
</body>
</html>