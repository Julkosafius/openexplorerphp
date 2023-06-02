"use strict";
import {fetchFolderContents} from "../folder.js";
import {I18N} from "../globals.js";
export const BREADCRUMBS = document.getElementById("breadcrumbs");
export let breadcrumbs = [];

export function renderBreadcrumbs() {
    BREADCRUMBS.innerHTML = "";

    for (let i = breadcrumbs.length-1; i >= 0; i--) {
        let crumb = breadcrumbs[i];
        let separator = document.createElement("span");
        separator.innerHTML = " &#10093; ";

        let new_crumb = document.createElement("button");
        new_crumb.textContent = crumb.folder_name === "root" ? I18N["root"] : crumb.folder_name;

        new_crumb.addEventListener("click", async () => {
            let crumb_end = breadcrumbs.findIndex((other_crumb) => other_crumb.folder_id === crumb.folder_id);
            if (crumb_end !== breadcrumbs.length - 1) { // don't reload if it's the last crumb (i.e. the current folder)
                breadcrumbs.splice(crumb_end, breadcrumbs.length); // cut off all breadcrumbs after this clicked breadcrumb
                await fetchFolderContents(crumb.folder_id);
            }
        });

        BREADCRUMBS.appendChild(new_crumb);
        BREADCRUMBS.appendChild(separator);
    }

    BREADCRUMBS.removeChild(BREADCRUMBS.lastChild);
}
