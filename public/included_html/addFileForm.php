<?php
require '../../app/globals.php';
global $I18N;
?>
<form method="" enctype="multipart/form-data">
    <label for="fileuploadInput" class="drop-container">
        <span><?= $I18N['file_drop'] ?></span>
        –
        <input id="fileuploadInput" type="file" name="fileupload" multiple="multiple" required="required">
    </label>
    <button id="fileuploadBtn" type="submit"><?= $I18N['upload'] ?></button>
</form>