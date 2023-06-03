<?php
require '../../app/globals.php';
global $i18n_json, $usedLocale, $I18N;
?>
<form method="dialog">
    <fieldset>
        <legend><?= $I18N['settings_theme'] ?></legend>
        <div>
            <input type="radio" id="lightTheme" name="theme">
            <label for="lightTheme"><?= $I18N['settings_theme_light'] ?></label>
        </div>
        <div>
            <input type="radio" id="darkTheme" name="theme">
            <label for="darkTheme"><?= $I18N['settings_theme_dark'] ?></label>
        </div>
    </fieldset>
    <fieldset>
        <legend><?= $I18N['settings_lang'] ?></legend>
        <select id="langSelect" name="lang">
            <?php
            foreach ($i18n_json as $locale => $locale_json) {
                ?>
            <option value="<?= $locale ?>" <?= $locale == $usedLocale ? "selected" : ""?>><?= $I18N[$locale] ?></option>
                <?php
            }
            ?>
        </select>
    </fieldset>
    <button id="submitSettingsBtn" type="submit"><?= $I18N['save'] ?></button>
</form>