<?php
require 'src/utilities.php';

setcookie('user_id', '', 0, '/');
setcookie('folder_id', '', 0, '/');

redirect('index.php');