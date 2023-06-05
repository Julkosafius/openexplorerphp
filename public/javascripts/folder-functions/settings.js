"use strict";
import {OPTION_WINDOW_CONTENT, showOptionWindow} from "./optionWindow.js";
import {refreshTheme} from "../theme.js";
import {I18N} from "../globals.js";

export async function manageSettings() {
    showOptionWindow(I18N["settings"]);

    const rawHTMLResponse = await fetch("public/dialog-contents/settings.php", {
        method: "POST",
        headers: { "Accept": "text/html" }
    });

    OPTION_WINDOW_CONTENT.innerHTML = await rawHTMLResponse.text();

    refreshTheme();

    const langSelect = document.getElementById("langSelect");
    const prevLanguage = langSelect.value;
    const submitSettingsBtn = document.getElementById("submitSettingsBtn");

    submitSettingsBtn.addEventListener("click", e => {
        if (langSelect.value !== prevLanguage) {
            document.cookie = `locale=${langSelect.value};path=/;`;
            location.reload();
        }
    });
}