<?php
require 'app/globals.php';
require 'app/utilities.php';

global $salt, $sqlite, $I18N;

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
        $loginResponse = $I18N['username_or_password_wrong'];
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
    <title><?= ucfirst($I18N['login']) ?></title>
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

    <h1><?= ucfirst($I18N['login']) ?>!</h1>
    <form id="login_form" method="post">
        <label for="user_name"><?= ucfirst($I18N['username']) ?>:</label>
        <input id="user_name" name="username" type="text" maxlength="255"
               required="required" autocomplete="username" autofocus>
        <label for="password"><?= ucfirst($I18N['password']) ?>:</label>
        <input id="password" name="current-password" type="password"
               required="required" autocomplete="current-password">
        <p id="info"><?= trim($loginResponse) ?></p>
        <button id="submit_btn" type="submit"><?= ucfirst($I18N['login']) ?></button>
    </form>
    <p>
        <small><?= ucfirst($I18N['register_msg']) ?>
            <a href="register.php"><?= ucfirst($I18N['register']) ?>!</a>
        </small>
    </p>

    <script src="public/javascripts/theme.js" type="module"></script>
    <script src="public/javascripts/login.js" type="module"></script>
</body>
</html>