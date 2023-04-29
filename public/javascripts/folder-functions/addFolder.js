"use strict";
import {OPTION_WINDOW_CONTENT, showOptionWindow} from "./optionWindow.js";
import {fetchFolderContents} from "../folder.js";

export async function addFolder(destination_folder) {
    showOptionWindow("Create a folder");

    // get text input from
    const rawResponse = await fetch("public/included_html/addFolderForm.html", {
        method: "POST",
        headers: {
            "Accept": "text/html"
        }
    });

    OPTION_WINDOW_CONTENT.innerHTML = await rawResponse.text();
    document.getElementById("createfolderInput").focus();
    document.getElementById("createfolderBtn")
        .addEventListener("click", async(e) => {
            // folder creation logic
            e.preventDefault();
            let folder_name = document.getElementById("createfolderInput").value.trim();

            if (folder_name.length > 0 && folder_name.length < 255) {
                const rawResponse = await fetch("createfolder.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: `folder_name=${folder_name}&curr_folder_id=${destination_folder}`
                });

                OPTION_WINDOW_CONTENT.innerHTML = await rawResponse.text();

                await fetchFolderContents(destination_folder); // update contents of current folder
            }
        });
}