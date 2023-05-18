"use strict";
import {fetchFolderContents} from "../folder.js";
export const BREADCRUMBS = document.getElementById("breadcrumbs");
export let breadcrumbs = [];

export function renderBreadcrumbs() {
    BREADCRUMBS.innerHTML = "";

    for (let crumb of breadcrumbs) {
        let separator = document.createElement("span");
        separator.innerHTML = " / ";

        let new_crumb = document.createElement("a");
        new_crumb.textContent = crumb.folder_name;

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
}
