<?php

// inherits utilities.php ($sqlite) from index.php

global $sqlite, $lang;

if (!isset($_COOKIE['user_id'])) {
    redirect('login.php');
    die();
}

setcookie('folder_id', $sqlite->getFirstColumnValue('select rowid as rid from folders where user_id like "'.$_COOKIE['user_id'].'" and parent_folder_id is null', 'rid'), 0, '/');

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenExplorer</title>
    <link rel="stylesheet" href="public/stylesheets/normalize.css" type="text/css">
    <link rel="stylesheet" href="public/stylesheets/generalstyles-new.css" type="text/css">
    <link rel="shortcut icon" href="public/images/favico/favico_r.ico" type="image/x-icon">
</head>
<body>

    <dialog data-modal>
        <div id="optionWindowHeader">
            <span id="optionWindowTitle">Title</span>
            <button data-close-modal></button>
        </div>
        <div id="optionWindowContent">
            
        </div>
    </dialog>

    <div id="wrapper">
        <header>
            <button id="addFileBtn"><?= ucfirst($lang['upload_file']) ?></button>
            <button id="addFolderBtn"><?= ucfirst($lang['create_folder']) ?></button>
            <form action="">
                <label for="lightTheme">Light Theme</label>
                <input type="radio" id="lightTheme" name="theme">
                <label for="darkTheme">Dark Theme</label>
                <input type="radio" id="darkTheme" name="theme">
            </form>

            <form id="elementActionForm" method="post">
                <label for="elementAction"><?= ucfirst($lang['action_on_element']) ?></label>
                <select name="elementAction" id="elementAction" required="required" disabled="disabled">
                    <option value=""></option>
                    <option value="rm"><?= ucfirst($lang['delete']) ?></option>
                    <option value="mv"><?= ucfirst($lang['move']) ?></option>
                    <option value="cp"><?= ucfirst($lang['copy']) ?></option>
                    <option value="zip"><?= ucfirst($lang['zip']) ?></option>
                </select>
                <button id="elementActionBtn" disabled="disabled"><?= ucfirst($lang['go']) ?>!</button>
            </form>
        </header>

        <nav>
            <div id="breadcrumbs"></div>
        </nav>

        <main>
            <div id="sortBtns">
                <input type="checkbox" id="selectAll">
                <button id="sortByNameBtn">Name ^</button>
                <button id="sortByTimeBtn">Date ^</button>
                <button id="sortBySizeBtn">Size ^</button>
            </div>


            <div id="elementView">

            </div>
        </main>

    </div>

    <script src="public/javascripts/folder.js" type="module"></script>
</body>
</html>