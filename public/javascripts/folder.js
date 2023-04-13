"use strict";
import { formatBytes, getCookie, formatUnixTime } from "./globals.js";
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
const ELEMENT_ACTION_DROPDOWN = document.getElementById("elementAction");
const ELEMENT_ACTION_BTN = document.getElementById("elementActionBtn");
const BREADCRUMBS = document.getElementById("breadcrumbs");
const SELECT_ALL = document.getElementById("selectAll");
const OPTION_WINDOW = document.getElementById("optionWindow");
const OPTION_WINDOW_CLOSE = document.getElementById("closeOptionWindow");
const OPTION_WINDOW_TITLE = document.getElementById("optionWindowTitle");
const OPTION_WINDOW_CONTENT = document.getElementById("optionWindowContent");
const ACTIONS = ["rm", "mv", "cp", "zip"];

const ROOT_FOLDER_ID = getCookie("folder_id");
let curr_folder_id = getCookie("folder_id");
let breadcrumbs = [];

const enableActionDropdown = () => {
    if (!ELEMENT_ACTION_DROPDOWN.hasAttribute("disabled")) ELEMENT_ACTION_DROPDOWN.setAttribute("disabled", "disabled");
    if (!ELEMENT_ACTION_BTN.hasAttribute("disabled")) ELEMENT_ACTION_BTN.setAttribute("disabled", "disabled");
};
const disableActionDropdown = () => {
    if (ELEMENT_ACTION_DROPDOWN.hasAttribute("disabled")) ELEMENT_ACTION_DROPDOWN.removeAttribute("disabled");
    if (ELEMENT_ACTION_BTN.hasAttribute("disabled")) ELEMENT_ACTION_BTN.removeAttribute("disabled");
};

function renderBreadcrumbs() {
    BREADCRUMBS.innerHTML = "";

    for (let crumb of breadcrumbs) {
        let separator = document.createElement("span");
        separator.innerHTML = " / ";

        let new_crumb = document.createElement("a");
        new_crumb.textContent = crumb.folder_name;
        new_crumb.classList.add("link");

        new_crumb.addEventListener("click", () => {
            let crumb_end = breadcrumbs.findIndex((other_crumb) => other_crumb.folder_id === crumb.folder_id);
            if (crumb_end !== breadcrumbs.length-1) { // don't reload if it's the last crumb (i.e. the current folder)
                breadcrumbs.splice(crumb_end, breadcrumbs.length); // cut off all breadcrumbs after this clicked breadcrumb
                getFolderContentsAJAX(crumb.folder_id);
            }
        });

        BREADCRUMBS.appendChild(new_crumb);
        BREADCRUMBS.appendChild(separator);
    }
}

// ******
// Get folder contents and render to screen
// ******

async function getFolderContentsAJAX(folder_id, render = true) {
    if (render) curr_folder_id = folder_id;
    
    if (folder_id.length === 0) {
        return undefined;
    } else {
        const rawResponse = await fetch("ajax_get_folder_contents.php", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `folder_id=${folder_id}`
        });
        const contents = await rawResponse.json();
    
        if (!render) return contents;
        renderFolderContents(contents);
    }
}

function renderFolderContents(curr_folder_contents_json) {
    ELEMENT_VIEW.innerHTML = "";
    SELECT_ALL.checked = false;
    enableActionDropdown();

    console.log(curr_folder_contents_json);
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
    // console.log(breadcrumbs);
    renderBreadcrumbs();

    if (parent_folder_id) {
        let backBtn = document.createElement("button");
        backBtn.innerHTML = "<-";
        backBtn.addEventListener("click", () => {
            curr_folder_id = parent_folder_id;
            breadcrumbs.splice(-2);
            getFolderContentsAJAX(parent_folder_id);
        });
        ELEMENT_VIEW.appendChild(backBtn);
    }

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

        file_btn.classList.add("fileBtn");
        let file_link = document.createElement("a");
        file_link.target = "_blank";
        //file_link.download = file.file_name;
        file_link.href = `data/${getCookie("user_id")}/${file.file_hash}${file.file_type ? "." : ""}${file.file_type}`;
        file_btn.appendChild(file_link);

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

        file_link.appendChild(name_span);
        file_link.appendChild(date_span);
        file_link.appendChild(size_span);

        file_div.appendChild(file_btn);
        ELEMENT_VIEW.append(file_div);
    }
}

function dragElement(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(el.id + "Header")) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(el.id + "Header").onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      el.onmousedown = dragMouseDown;
    }
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
    }
  
    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
}

// ******
// Upload a new file
// ******

async function addFile() {
    OPTION_WINDOW.style.display = "block";
    OPTION_WINDOW_TITLE.textContent = "Add a file";

    const rawHTMLResponse = await fetch("public/included_html/addFileForm.html", {
        method: "POST",
        headers: {
            "Accept": "text/html"
        }
    });

    OPTION_WINDOW_CONTENT.innerHTML = await rawHTMLResponse.text();

    // file upload logic
    const FILE_UPLOAD_BTN = document.getElementById("fileuploadBtn");
    const FILE_UPLOAD_INPUT = document.getElementById("fileuploadInput");
    FILE_UPLOAD_BTN.addEventListener("click", fileUpload);
    
    async function fileUpload(e) {
        e.preventDefault();

        if (FILE_UPLOAD_INPUT.files.length > 0) {
            let formData = new FormData();
            for (let i = 0; i < FILE_UPLOAD_INPUT.files.length; i++) {
                formData.append("files[]", FILE_UPLOAD_INPUT.files[i]);
            }
            formData.append("curr_folder_id", curr_folder_id);
            console.log(formData);
            
            const rawUploadResponse = await fetch("fileupload.php", {
                method: "POST", 
                body: formData
            });
            renderResponseStatus(await rawUploadResponse.json());
            
            // update folder contents
            await getFolderContentsAJAX(curr_folder_id);
        }
    }
}

function renderResponseStatus(jsonResponse) {
    OPTION_WINDOW_CONTENT.innerHTML = "";
    let msgList = document.createElement("ol");
    for (let msg of Object.values(jsonResponse)) {
        let li = document.createElement("li");
        li.textContent = String(msg);
        msgList.appendChild(li);
    }
    OPTION_WINDOW_CONTENT.appendChild(msgList);
    return msgList;
}

// ******
// Create a new folder
// ******

async function addFolder() {
    OPTION_WINDOW.style.display = "block";
    OPTION_WINDOW_TITLE.textContent = "Create a folder";

    // get text input from
    const rawResponse = await fetch("public/included_html/addFolderForm.html", {
        method: "POST",
        headers: {
            "Accept": "text/html"
        }
    });

    OPTION_WINDOW_CONTENT.innerHTML = await rawResponse.text();
    document.getElementById("createfolderInput").focus();
    const CREATE_FOLDER_BTN = document.getElementById("createfolderBtn");
    CREATE_FOLDER_BTN.addEventListener("click", createFolderAJAX);
}

async function createFolderAJAX(e) {
    // folder creation logic
    e.preventDefault();
    let folder_name = document.getElementById("createfolderInput").value.trim();
    
    if (folder_name.length > 0 && folder_name.length < 255) {
        const rawResponse = await fetch("createfolder.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `folder_name=${folder_name}&curr_folder_id=${curr_folder_id}`
        });

        if (!Number.parseInt(await rawResponse.text())) {
            OPTION_WINDOW_CONTENT.innerHTML = `<p>The folder has been created successfully.</p>`;
        } else {
            OPTION_WINDOW_CONTENT.innerHTML = `<p>Something went wrong.</p>`;
        }

        await getFolderContentsAJAX(curr_folder_id); // update contents of current folder
    }
}

function closeOptionWindow() {
    OPTION_WINDOW.style.display = "none";
    OPTION_WINDOW_CONTENT.innerHTML = "";
}

function selectAllElements() {
    let all_checkbox_inputs = [...document.querySelectorAll('input[type="checkbox"]')];
    all_checkbox_inputs = all_checkbox_inputs.filter(e => e !== SELECT_ALL);
    if (SELECT_ALL.checked) {
        all_checkbox_inputs.forEach(e => e.checked = true);
        disableActionDropdown();
    } else {
        all_checkbox_inputs.forEach(e => e.checked = false);
        enableActionDropdown();
    }
}

async function executeAction(e) {
    e.preventDefault();
    let action = ELEMENT_ACTION_DROPDOWN.value;
    if (action && ACTIONS.includes(action)) {
        /**
         * get grouped_elements_json object of all checked elements like so
         * { "folder" : ["3", "25", ...], "file" : ["67", "128", ...] }
         */
        let all_checkbox_inputs = [...document.querySelectorAll('input[type="checkbox"]')];
        all_checkbox_inputs = all_checkbox_inputs.filter(e => e !== SELECT_ALL);
        let all_checked_checkbox_inputs = all_checkbox_inputs.filter(chbx => chbx.checked === true);
        let selected_elements_json = all_checked_checkbox_inputs.map(chbx => JSON.parse(`{"type":"${chbx.name}", "value":"${chbx.value}"}`));
        let grouped_elements_json = selected_elements_json.reduce((acc, element) => {
                                        (acc[element.type] = acc[element.type] || []).push(element.value);
                                        return acc;
                                    }, {});
        
        console.log(action);
        console.log(grouped_elements_json);
        if (!Object.keys(grouped_elements_json).length) {
            console.log("No elements selected.");
            return;
        }

        let requestBody = requestBodyFromObject(grouped_elements_json);

        OPTION_WINDOW.style.display = "block";
        OPTION_WINDOW_CONTENT.innerHTML = "";

        switch (action) {
            case ACTIONS[0]: // remove
                OPTION_WINDOW_TITLE.textContent = "Delete";

                const DELETE_QUESTION_P = document.createElement("p");
                const DELETE_BTN = document.createElement("button");
                DELETE_QUESTION_P.textContent = "Do you really want to delete the selected element(s)?";
                DELETE_BTN.textContent = "Delete";

                OPTION_WINDOW_CONTENT.appendChild(DELETE_QUESTION_P);
                OPTION_WINDOW_CONTENT.appendChild(DELETE_BTN);

                // Wait for the button to be clicked
                await new Promise(resolve => DELETE_BTN.addEventListener("click", resolve, { once: true }));

                let remove_response = await fetch("action_delete.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: requestBody
                });
                let remove_response_content = await remove_response.json();
                console.log(remove_response_content);
                renderResponseStatus(remove_response_content);

                break;
            
            case ACTIONS[1]: // move
                OPTION_WINDOW_TITLE.textContent = "Move where?";

                let move_destination = await selectDestinationFolder();
                requestBody += `destination=${move_destination}`;
                console.log(requestBody);

                let move_response = await fetch("action_move.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: requestBody
                });
                let move_response_content = await move_response.json();
                console.log(move_response_content);
                renderResponseStatus(move_response_content);

                break;

            case ACTIONS[2]: // copy
                OPTION_WINDOW_TITLE.textContent = "Copy to where?";

                let copy_destination = await selectDestinationFolder();
                requestBody += `destination=${copy_destination}`;
                console.log(requestBody);

                let copy_response = await fetch("action_copy.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: requestBody
                });
                let copy_response_content = await copy_response.text();
                console.log(copy_response_content);
                // renderResponseStatus(copy_response_content);

                break;

            default:
                break;
        }

        await getFolderContentsAJAX(curr_folder_id);
    }
}


/**
 * Generates a lazy HTML tree structure of all folders, appends it to OPTION_WINDOW_CONTENT,
 * and provides the ID of the last clicked folder.
 * @returns A promise with a folder ID
 */
function selectDestinationFolder() {
    return new Promise(async (resolve) => {
        let selected_folder_id = ROOT_FOLDER_ID;
        let prev_selected_folder = null;
        let root_was_initialized = false;

        const TREE_VIEW = document.createElement("div");
        const MAIN_LIST = document.createElement("ul");
        const SUBMIT_BTN = document.createElement("button");

        TREE_VIEW.id = "tree_view";
        SUBMIT_BTN.textContent = "Select Folder";
        SUBMIT_BTN.addEventListener("click", () => {
            resolve(selected_folder_id);
        });

        TREE_VIEW.appendChild(MAIN_LIST);
        OPTION_WINDOW_CONTENT.appendChild(TREE_VIEW);
        OPTION_WINDOW_CONTENT.appendChild(SUBMIT_BTN);

        await generateFolderList(ROOT_FOLDER_ID, MAIN_LIST);

        /**
         * Fetches folders of a specific folder from the database and appends them to an unordered list.
         * Adds interactivity and styling to the list.
         * @param {number} folder_id The ID of a folder whose contents are going to be loaded.
         * @param {HTMLUListElement} parent_node The element under which the contents of the folder_id
         * are going to be appended as &lt;li&gt;.
         */
        async function generateFolderList(folder_id, parent_node) {
            const TOGGLE_OPENED = "v";
            const TOGGLE_CLOSED = ">";
            const toggleListElement = (element) => {
                if (element) {
                    element.style.display = element.style.display === "none" ? "list-item" : "none";
                }
            };

            let contents = await getFolderContentsAJAX(folder_id, false);
            if (!root_was_initialized && folder_id === ROOT_FOLDER_ID) {
                contents = {
                    folders : [
                        {
                            folder_id : ROOT_FOLDER_ID,
                            folder_name : '/'
                        }
                    ]
                };
                root_was_initialized = true;
            }

            for (let folder of contents['folders'].values()) {
                const F_ELEMENT_LI = document.createElement("li");
                const F_CONTENT_SPAN = document.createElement("span");
                const F_TOGGLE_BTN = document.createElement("button");
                const F_TEXT_A = document.createElement("a");

                const F_ID = folder.folder_id;
                F_TOGGLE_BTN.textContent = TOGGLE_CLOSED;
                F_TEXT_A.textContent = folder.folder_name;

                const toggleBtn = () => {
                    F_TOGGLE_BTN.textContent = F_TOGGLE_BTN.textContent === TOGGLE_CLOSED ? TOGGLE_OPENED : TOGGLE_CLOSED;
                };

                const onFolderClick = (e) => {
                    selected_folder_id = F_ID;
                    console.log(`Selected folder: ${selected_folder_id}`);

                    // selection styling
                    if (prev_selected_folder) {
                        prev_selected_folder.classList.remove("selected");
                    }
                    let content_span = e.target.closest("span");
                    content_span.classList.add("selected");
                    prev_selected_folder = content_span;

                    // if never clicked:
                    if (F_ELEMENT_LI.childElementCount === 1) {
                        const NEW_LIST = document.createElement("ul");
                        F_ELEMENT_LI.appendChild(NEW_LIST); // create new listing
                        F_TOGGLE_BTN.textContent = TOGGLE_OPENED;
                        generateFolderList(F_ID, NEW_LIST); // load contents of this folder

                    } else { // if it has already been opened:
                        toggleBtn();
                        if (!F_ELEMENT_LI.children[1].children) {
                            return;
                        } // if it's not empty, toggle visibility of <li> children 
                        let f_child_folders = F_ELEMENT_LI.children[1].children;
                        if (f_child_folders.length > 0) {
                            for (let child_folder of f_child_folders) {
                                toggleListElement(child_folder);
                            }
                        }
                    }
                };

                F_TOGGLE_BTN.addEventListener("click", onFolderClick);
                F_TEXT_A.addEventListener("click", onFolderClick);

                F_CONTENT_SPAN.appendChild(F_TOGGLE_BTN);
                F_CONTENT_SPAN.appendChild(F_TEXT_A);
                F_ELEMENT_LI.appendChild(F_CONTENT_SPAN);
                parent_node.appendChild(F_ELEMENT_LI);

                if (F_ELEMENT_LI.parentNode === MAIN_LIST) F_TOGGLE_BTN.click();
            }
        }
    });
}

/**
 * Transforms an object recursively into a URL parameter string. Examples:
 * { a: 1, b: 2, c: 3 } ... "a=1&b=2&c=3&"
 * { type: [1, 2], value: [a] } ... "type[0]=1&type[1]=2&value[0]=a&"
 * { ol: [ {a: 1}, {b: 2} ], c: 3 } ... "ol[0][a]=1&ol[1][b]=2&c=3&"
 * @param {Object} obj The object to be transformed.
 * @param {string} prefix A variable for recursion, no value needed.
 * @returns A URL parameter string.
 */
function requestBodyFromObject(obj, prefix = "") {
    let queryString = "";
    for (let [key, value] of Object.entries(obj)) {
        if (typeof value === "object") {
            queryString += requestBodyFromObject(value, prefix + key + "[");
        } else {
            // bracket [] logic
            let p_len = prefix.length;
            if (prefix.substring(p_len-3, p_len-2) === "[") {
                prefix = prefix.slice(0, p_len-1) + "][";
            }
            let closingBracket = prefix.substring(p_len) || prefix.substring(p_len-1) === "[";
            
            queryString += `${prefix}${key}${closingBracket ? "]" : ""}=${value}&`;
        }
    }
    return queryString;
}

window.addEventListener("DOMContentLoaded", () => {
    getFolderContentsAJAX(curr_folder_id);

    ADD_FILE_BTN.addEventListener("click", addFile);
    ADD_FOLDER_BTN.addEventListener("click", addFolder);
    OPTION_WINDOW_CLOSE.addEventListener("click", closeOptionWindow);
    ELEMENT_ACTION_BTN.addEventListener("click", executeAction);
    SELECT_ALL.addEventListener("change", selectAllElements);
    dragElement(OPTION_WINDOW);

    ELEMENT_VIEW.addEventListener("click", (e) => {
        // check if clicked element could be a folder button and reload content
        let buttonElement = e.target.closest("button");
        if (buttonElement && buttonElement.name === "folder") {
            getFolderContentsAJAX(buttonElement.value);
        }

        // check if clicked element could be a checkbox and manage action dropdown disability
        let checkbox = e.target.closest('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            disableActionDropdown();
        } else if (![...document.querySelectorAll('input[type="checkbox"]:checked')].filter(e => e !== SELECT_ALL).length) {
            enableActionDropdown();
        }
    });
});