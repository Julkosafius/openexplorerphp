"use strict";
import {I18N, formatBytes, formatUnixTime, getCookie} from "./globals.js";
import {breadcrumbs, renderBreadcrumbs} from "./folder-functions/breadcrumbs.js";
import {
    hideOptionWindow,
    OPTION_WINDOW_CLOSE,
    OPTION_WINDOW_CONTENT
} from "./folder-functions/optionWindow.js";
import {addFile} from "./folder-functions/addFile.js";
import {addFolder} from "./folder-functions/addFolder.js";
import {last_sort_direction, last_sort_property, sortByProperty} from "./folder-functions/sortingBtns.js";
import {executeAction} from "./folder-functions/executeAction.js";

const DEBUG = true;
if (!DEBUG) {
    if (!window.console) window.console = {};
    let methods = ["log", "debug", "warn", "info"];
    for (let method of methods) {
        console[method] = function() {};
    }
}

export const elementView = document.getElementById("elementView");
const addFileBtn = document.getElementById("addFileBtn");
const addFolderBtn = document.getElementById("addFolderBtn");
export const elementActionDropdown = document.getElementById("elementAction");
const elementActionBtn = document.getElementById("elementActionBtn");
const elementActionForm = document.getElementById("elementActionForm");
let backBtn = document.getElementById("backBtn");
export const selectAll = document.getElementById("selectAll");
export let curr_folder_id = getCookie("folder_id");
export let folder_contents_json = {};

const toggleChildrenDisabledAttr = (element, disable) => {
    const disableable_types = ["button", "fieldset", "input", "optgroup", "option", "select", "textarea"];

    Array.from(element.children).forEach(child => {
        if (disable && disableable_types.includes(child.tagName.toLowerCase())) {
            child.setAttribute("disabled", "disabled");
        } else {
            child.removeAttribute("disabled");
        }
        if (child.children.length > 0) {
            toggleChildrenDisabledAttr(child, disable);
        }
    });
}

export const lockUIElement = (element, with_loading_animation = true) => {
    toggleChildrenDisabledAttr(element, true);

    const FILLING_DIV = document.createElement("div");
    FILLING_DIV.classList.add("lockUI");

    if (with_loading_animation) {
        const LOADING_SVG = document.createElement("img");
        LOADING_SVG.src = "public/images/loading.svg";
        LOADING_SVG.alt = "Loading Symbol";
        FILLING_DIV.appendChild(LOADING_SVG);
    }

    element.insertBefore(FILLING_DIV, element.firstChild);
}
export const unlockUIElement = (element) => {
    // TODO: doesn't find lockUI (change in DOM) -> implement loop through element's children
    if (element.firstChild.classList && element.firstChild.classList.contains("lockUI")) {
        toggleChildrenDisabledAttr(element, false);
        element.removeChild(element.firstChild);
    }
}

export async function fetchFolderContents(folder_id, render = true) {
    if (render) curr_folder_id = folder_id;
    
    if (folder_id.length !== 0) {
        const rawResponse = await fetch("ajax_get_folder_contents.php", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `folder_id=${folder_id}`
        });
        folder_contents_json = await rawResponse.json();
        folder_contents_json["folders"].sort(sortByProperty(`folder_${last_sort_property}`, !last_sort_direction ? "asc" : "desc"));
        folder_contents_json["files"].sort(sortByProperty(`file_${last_sort_property}`, !last_sort_direction ? "asc" : "desc"));
        
        console.log(folder_contents_json);
    
        if (render) {
            //lockUIElement(elementView);
            renderFolderContents(folder_contents_json);
        }
    }
}

export function renderFolderContents(curr_folder_contents_json) {
    elementView.innerHTML = "";
    selectAll.checked = false;
    toggleChildrenDisabledAttr(elementActionForm, true);

    let parent_folder_id = curr_folder_contents_json['parent_id'];
    let curr_folder_name = curr_folder_contents_json['curr_id'];
    let folders = curr_folder_contents_json['folders'];
    let files = curr_folder_contents_json['files'];

    // add breadcrumb
    if (!breadcrumbs.length || breadcrumbs[breadcrumbs.length-1].folder_id !== curr_folder_id) {
        breadcrumbs.push({
            folder_id : curr_folder_id,
            folder_name : curr_folder_name
        });
    }
    renderBreadcrumbs();

    // reprogram the functionality of the browser's back button
    /*window.onpopstate = async () => {
        curr_folder_id = parent_folder_id;
        breadcrumbs.splice(-2);
        await fetchFolderContents(parent_folder_id);
    };
    history.pushState({}, "");*/

    for (let folder of folders) {
        const folderBtn = document.createElement("button");
        const checkboxInput = document.createElement("input");
        const nameSpan = document.createElement("span");
        const dateSpan = document.createElement("span");
        const sizeSpan = document.createElement("span");

        elementView.append(folderBtn);

        folderBtn.appendChild(checkboxInput);
        folderBtn.appendChild(nameSpan);
        folderBtn.appendChild(dateSpan);
        folderBtn.appendChild(sizeSpan);

        folderBtn.name = "folder";
        folderBtn.value = folder.folder_id;

        checkboxInput.type = "checkbox";
        checkboxInput.name = "folders";
        checkboxInput.value = folder.folder_id;

        nameSpan.innerHTML = `${DEBUG ? folder.folder_id+'-' : ''}${folder.folder_name}` || I18N["noname"];
        dateSpan.innerHTML = formatUnixTime(folder.folder_time) || I18N["nodate"];
        sizeSpan.innerHTML = formatBytes(folder.folder_size);
    }

    for (let file of files) {
        const fileLink = document.createElement("a");
        const fileBtn = document.createElement("button");
        const checkboxInput = document.createElement("input");
        const nameSpan = document.createElement("span");
        const dateSpan = document.createElement("span");
        const sizeSpan = document.createElement("span");

        elementView.append(fileLink);
        fileLink.appendChild(fileBtn);

        fileBtn.appendChild(checkboxInput);
        fileBtn.appendChild(nameSpan);
        fileBtn.appendChild(dateSpan);
        fileBtn.appendChild(sizeSpan);

        checkboxInput.type = "checkbox";
        checkboxInput.name = "files";

        fileLink.href =
            `data/${getCookie("user_id")}/${file.file_hash}${file.file_type ? "." : ""}${file.file_type}`;
        fileLink.target = "_blank";

        fileBtn.name = "file";

        checkboxInput.value = file.file_id;
        nameSpan.innerHTML =
            `${DEBUG ? file.file_id+'-' : ''}${file.file_name}${file.file_type ? "." : ""}${file.file_type}`
            || I18N["noname"];
        dateSpan.innerHTML = formatUnixTime(file.file_time) || I18N["nodate"];
        sizeSpan.innerHTML = file.file_size ? formatBytes(file.file_size) : I18N["nosize"];
    }

    //unlockUIElement(elementView);
}

export function renderResponseStatus(jsonResponse) {
    OPTION_WINDOW_CONTENT.innerHTML = "";
    let msg_list = document.createElement("ol");
    for (let msg of Object.values(jsonResponse)) {
        let li = document.createElement("li");
        li.textContent = String(msg);
        msg_list.appendChild(li);
    }
    OPTION_WINDOW_CONTENT.appendChild(msg_list);
    return msg_list;
}

function selectAllElements() {
    let all_checkbox_inputs = [...elementView.querySelectorAll('input[type="checkbox"]')];
    if (selectAll.checked) {
        all_checkbox_inputs.forEach(e => e.checked = true);
        if (all_checkbox_inputs.length) {
            toggleChildrenDisabledAttr(elementActionForm, false);
        }
    } else {
        all_checkbox_inputs.forEach(e => e.checked = false);
        toggleChildrenDisabledAttr(elementActionForm, true);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    await fetchFolderContents(curr_folder_id);

    addFileBtn.addEventListener("click", async () => {await addFile(curr_folder_id)});
    addFolderBtn.addEventListener("click", async () => {await addFolder(curr_folder_id)});
    OPTION_WINDOW_CLOSE.addEventListener("click", hideOptionWindow);
    elementActionBtn.addEventListener("click", executeAction);
    selectAll.addEventListener("change", selectAllElements);

    elementView.addEventListener("click", (e) => {
        // check if clicked element could be a checkbox
        const checkbox = e.target.closest('input[type="checkbox"]');
        if (checkbox) {
            if (checkbox.checked) {
                // manage action dropdown disability
                toggleChildrenDisabledAttr(elementActionForm, false);
            } else if (![...elementView.querySelectorAll('input[type=checkbox]:checked')].length) {
                toggleChildrenDisabledAttr(elementActionForm, true);
                selectAll.checked = false;
            }
            return;
        }

        // check if clicked element could be a folder button and reload content
        const buttonElement = e.target.closest("button");
        if (buttonElement && buttonElement.name === "folder") {
            fetchFolderContents(buttonElement.value);
        }
    });
});
