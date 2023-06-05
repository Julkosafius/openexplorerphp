<?php
require '../../src/globals.php';
global $I18N;
?>
<form method="dialog" enctype="multipart/form-data">
    <input id="createfolderInput" type="text" name="createfolder" maxlength="255" required="required">
    <button id="createfolderBtn" type="submit"><?= $I18N['create'] ?></button>
</form>