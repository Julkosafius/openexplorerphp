"use strict";
import {fetchFolderContents} from "../folder.js";
import {I18N} from "../globals.js";
export const BREADCRUMBS = document.getElementById("breadcrumbs");
export let breadcrumbs = [];

export function renderBreadcrumbs() {
    BREADCRUMBS.innerHTML = "";

    for (let crumb of breadcrumbs) {
        const separator = document.createElement("span");
        separator.innerHTML = " &#10093; ";

        const newCrumb = document.createElement("button");
        const newCrumbText = document.createElement("div");
        newCrumb.appendChild(newCrumbText);

        newCrumbText.textContent = crumb.folder_name === "root" ? I18N["root"] : crumb.folder_name;

        newCrumb.addEventListener("click", async () => {
            let crumb_end = breadcrumbs.findIndex((other_crumb) => other_crumb.folder_id === crumb.folder_id);
            if (crumb_end !== breadcrumbs.length - 1) { // don't reload if it's the last crumb (i.e. the current folder)
                breadcrumbs.splice(crumb_end, breadcrumbs.length); // cut off all breadcrumbs after this clicked breadcrumb
                await fetchFolderContents(crumb.folder_id);
            }
        });

        BREADCRUMBS.appendChild(newCrumb);
        BREADCRUMBS.appendChild(separator);
    }

    BREADCRUMBS.removeChild(BREADCRUMBS.lastChild);

    BREADCRUMBS.className = isOverflown(BREADCRUMBS) ? "growFromRight" : "growFromLeft";
}

const isOverflown = (element) => {
    let size = 0;
    for (let child of element.children) {
        size += child.clientWidth;
    }
    return size > element.clientWidth-50;
}
