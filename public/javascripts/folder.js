"use strict";
import {formatBytes, formatUnixTime, getCookie} from "./globals.js";
import {breadcrumbs, renderBreadcrumbs} from "./folder-functions/breadcrumbs.js";
import {
    hideOptionWindow,
    OPTION_WINDOW,
    OPTION_WINDOW_CLOSE,
    OPTION_WINDOW_CONTENT
} from "./folder-functions/optionWindow.js";
import {addFile} from "./folder-functions/addFile.js";
import {addFolder} from "./folder-functions/addFolder.js";
import {last_sort_direction, last_sort_property, sortByProperty} from "./folder-functions/sortingBtns.js";
import {executeAction} from "./folder-functions/executeAction.js";

//const rawLangRequest = await fetch(`lang/${getCookie("locale")}.json`);
//const rawLangRequest = await fetch(`lang/en_US.json`);
//const lang_json = await rawLangRequest.json();

const DEBUG = true;
if (!DEBUG) {
    if (!window.console) window.console = {};
    let methods = ["log", "debug", "warn", "info"];
    for (let method of methods) {
        console[method] = function() {};
    }
}

const ELEMENT_VIEW = document.getElementById("elementView");
const ADD_FILE_BTN = document.getElementById("addFileBtn");
const ADD_FOLDER_BTN = document.getElementById("addFolderBtn");
export const ELEMENT_ACTION_DROPDOWN = document.getElementById("elementAction");
const ELEMENT_ACTION_BTN = document.getElementById("elementActionBtn");
const ELEMENT_ACTION_FORM = document.getElementById("elementActionForm");
export const SELECT_ALL = document.getElementById("selectAll");

export let curr_folder_id = getCookie("folder_id");
export let folder_contents_json = {};


const THEME_BTN = document.getElementById("toggleThemeBtn");
const THEME_CSS_LINK = document.querySelector('link[href*="theme"]');
const PATH_TO_CSS = "public/stylesheets/";
const LIGHT_THEME_CSS = "theme-light.css";
const DARK_THEME_CSS = "theme-dark.css";

// toggle theme
THEME_BTN.addEventListener("click", () => {
    const NEW_THEME = THEME_CSS_LINK.getAttribute("href") === PATH_TO_CSS + LIGHT_THEME_CSS ?
        DARK_THEME_CSS : LIGHT_THEME_CSS;
    THEME_CSS_LINK.href = PATH_TO_CSS + NEW_THEME;
});

const setThemeFromPreference = () => {
    const THEME = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ?
        DARK_THEME_CSS : LIGHT_THEME_CSS;
    THEME_CSS_LINK.href = PATH_TO_CSS + THEME;
}

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

    element.style.position = "relative";
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
            lockUIElement(document.getElementById("main"));
            renderFolderContents(folder_contents_json);
        }
    }
}

export function renderFolderContents(curr_folder_contents_json) {
    ELEMENT_VIEW.innerHTML = "";
    SELECT_ALL.checked = false;
    toggleChildrenDisabledAttr(ELEMENT_ACTION_FORM, true);

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

    /*if (parent_folder_id) {
        let backBtn = document.createElement("button");
        backBtn.innerHTML = "<-";
        backBtn.addEventListener("click", () => {
            curr_folder_id = parent_folder_id;
            breadcrumbs.splice(-2);
            fetchFolderContents(parent_folder_id);
        });
        ELEMENT_VIEW.appendChild(backBtn);
    }*/

    for (let folder of folders) {
        let folderDiv = document.createElement("div");
        folderDiv.classList.add("folder");

        let folderBtn = document.createElement("button");
        folderBtn.name = "folder";
        folderBtn.value = folder.folder_id;

        folderBtn.classList.add("folderBtn");
        
        let checkbox_input = document.createElement("input");
        checkbox_input.type = "checkbox";
        checkbox_input.name = "folders";
        checkbox_input.value = folder.folder_id;
        folderDiv.appendChild(checkbox_input);

        let name_span = document.createElement("span");
        let date_span = document.createElement("span");
        let size_span = document.createElement("span");

        name_span.innerHTML = `${DEBUG ? folder.folder_id+'-' : '' }${folder.folder_name}` || "noname";
        date_span.innerHTML = formatUnixTime(folder.folder_time) || "nodate";
        size_span.innerHTML = folder.folder_size ? formatBytes(folder.folder_size) : "nosize";
        
        folderBtn.appendChild(name_span);
        folderBtn.appendChild(date_span);
        folderBtn.appendChild(size_span);

        folderDiv.appendChild(folderBtn);
        ELEMENT_VIEW.append(folderDiv);
    }

    for (let file of files) {
        let file_div = document.createElement("div");
        file_div.classList.add("file");

        let file_btn = document.createElement("button");

        file_btn.name = "file";
        file_btn.addEventListener("click", () => {
            window.open(
                `data/${getCookie("user_id")}/${file.file_hash}${file.file_type ? "." : ""}${file.file_type}`,
                "_blank");
        });

        let checkbox_input = document.createElement("input");
        checkbox_input.type = "checkbox";
        checkbox_input.name = "files";
        checkbox_input.value = file.file_id;
        file_div.appendChild(checkbox_input);

        let name_span = document.createElement("span");
        let date_span = document.createElement("span");
        let size_span = document.createElement("span");

        name_span.innerHTML = `${DEBUG ? file.file_id+'-' : ''}${file.file_name}${file.file_type ? "." : ""}${file.file_type}` || "noname";
        date_span.innerHTML = formatUnixTime(file.file_time) || "nodate";
        size_span.innerHTML = file.file_size ? formatBytes(file.file_size) : "nosize";

        file_btn.appendChild(name_span);
        file_btn.appendChild(date_span);
        file_btn.appendChild(size_span);

        file_div.appendChild(file_btn);
        ELEMENT_VIEW.append(file_div);
    }

    unlockUIElement(document.getElementById("main"));
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
    let all_checkbox_inputs = [...document.querySelectorAll('input[type="checkbox"]')];
    all_checkbox_inputs = all_checkbox_inputs.filter(e => e !== SELECT_ALL);
    if (SELECT_ALL.checked) {
        all_checkbox_inputs.forEach(e => e.checked = true);
        toggleChildrenDisabledAttr(ELEMENT_ACTION_FORM, false);
    } else {
        all_checkbox_inputs.forEach(e => e.checked = false);
        toggleChildrenDisabledAttr(ELEMENT_ACTION_FORM, true);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    await fetchFolderContents(curr_folder_id);

    setThemeFromPreference();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setThemeFromPreference);

    ADD_FILE_BTN.addEventListener("click", async() => {await addFile(curr_folder_id)});
    ADD_FOLDER_BTN.addEventListener("click", async() => {await addFolder(curr_folder_id)});
    OPTION_WINDOW_CLOSE.addEventListener("click", hideOptionWindow);
    ELEMENT_ACTION_BTN.addEventListener("click", executeAction);
    SELECT_ALL.addEventListener("change", selectAllElements);

    ELEMENT_VIEW.addEventListener("click", (e) => {
        // check if clicked element could be a folder button and reload content
        let buttonElement = e.target.closest("button");
        if (buttonElement && buttonElement.name === "folder") {
            fetchFolderContents(buttonElement.value);
        }

        // check if clicked element could be a checkbox and manage action dropdown disability
        let checkbox = e.target.closest('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            toggleChildrenDisabledAttr(ELEMENT_ACTION_FORM, false);
        } else if (![...document.querySelectorAll('input[type="checkbox"]:checked')].filter(e => e !== SELECT_ALL).length) {
            toggleChildrenDisabledAttr(ELEMENT_ACTION_FORM, true);
        }
    });
});
