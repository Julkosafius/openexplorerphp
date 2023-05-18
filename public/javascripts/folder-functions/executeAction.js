import {hideOptionWindow, OPTION_WINDOW, OPTION_WINDOW_CONTENT, showOptionWindow} from "./optionWindow.js";
import {
    curr_folder_id,
    folder_contents_json,
    ELEMENT_ACTION_DROPDOWN,
    elementView,
    fetchFolderContents,
    renderResponseStatus
} from "../folder.js";
import {getCookie} from "../globals.js";

const ACTIONS = ["rm", "mv", "cp", "zip"];
const ROOT_FOLDER_ID = getCookie("folder_id");

export async function executeAction(e) {
    e.preventDefault();
    let action = ELEMENT_ACTION_DROPDOWN.value;
    if (action) {
        /**
         * get grouped_elements_json object of all checked elements like so
         * { "folder" : ["3", "25", ...], "file" : ["67", "128", ...] }
         */
        let all_checkbox_inputs = [...elementView.querySelectorAll('input[type="checkbox"]')];
        let all_checked_checkbox_inputs = all_checkbox_inputs.filter(chbx => chbx.checked === true);
        let selected_elements_json = all_checked_checkbox_inputs
            .map(chbx => JSON.parse(`{"type":"${chbx.name}", "value":"${chbx.value}"}`));
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

        let requestBody = new URLSearchParams();
        for (let [param_name, param_values] of Object.entries(grouped_elements_json)) {
            param_values.forEach((value, idx) => requestBody.append(`${param_name}[${idx+1}]`, value));
        }
        console.log(decodeURI(requestBody.toString()));

        switch (action) {
            case ACTIONS[0]: // remove
                showOptionWindow("Delete?");

                // Confirmation dialogue
                const DELETE_QUESTION_P = document.createElement("p");
                const DELETE_BTN = document.createElement("button");
                DELETE_QUESTION_P.textContent = "Do you really want to delete the selected element(s)?";
                DELETE_BTN.textContent = "Delete";
                OPTION_WINDOW_CONTENT.appendChild(DELETE_QUESTION_P);
                OPTION_WINDOW_CONTENT.appendChild(DELETE_BTN);
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
                showOptionWindow("Move where?");

                let move_destination = await selectDestinationFolder();
                requestBody.append("destination", move_destination.toString());

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
                showOptionWindow("Copy to where?");

                let copy_destination = await selectDestinationFolder();
                requestBody.append("destination", copy_destination.toString());

                let copy_response = await fetch("action_copy.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: requestBody
                });
                let copy_response_content = await copy_response.json();
                console.log(copy_response_content);
                renderResponseStatus(copy_response_content);

                break;

            case ACTIONS[3]: // zip

                window.open(`action_zip.php?${requestBody}`, "_blank");
                hideOptionWindow();
                break;


            default:
                showOptionWindow("What happened?");
                const INVALID_ACTION_ERR = document.createElement("p");
                INVALID_ACTION_ERR.textContent = "Your selected action is invalid.";
                OPTION_WINDOW_CONTENT.appendChild(INVALID_ACTION_ERR);
                break;
        }

        await fetchFolderContents(curr_folder_id);
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
        SUBMIT_BTN.addEventListener("click", (e) => {
            e.preventDefault();
            resolve(selected_folder_id);
        }, { once: true });

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

            await fetchFolderContents(folder_id, false);
            let contents = folder_contents_json;
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
                    e.preventDefault();
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
            if (!OPTION_WINDOW.open) OPTION_WINDOW.showModal();
        }
    });
}
