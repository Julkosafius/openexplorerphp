"use strict";
import {fetchFolderContents, renderResponseStatus} from "../folder.js";
import {OPTION_WINDOW, OPTION_WINDOW_CONTENT, showOptionWindow} from "./optionWindow.js";

export async function addFile(destination_folder) {
    showOptionWindow("Add a file");

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
    FILE_UPLOAD_BTN.addEventListener("click", async (e) => {
        e.preventDefault();

        let status_array = [];
        const PROGRESS_BAR = document.createElement("progress");
        PROGRESS_BAR.max = FILE_UPLOAD_INPUT.files.length;
        PROGRESS_BAR.value = 0;
        OPTION_WINDOW_CONTENT.innerHTML = "";
        OPTION_WINDOW_CONTENT.appendChild(PROGRESS_BAR);

        if (FILE_UPLOAD_INPUT.files.length > 0) {
            let form_data = new FormData();
            for (let i = 0; i < FILE_UPLOAD_INPUT.files.length; i++) {
                PROGRESS_BAR.value += 1;
                let file_data = new FormData();
                file_data.append("file", FILE_UPLOAD_INPUT.files[i]);
                file_data.append("destination_folder", destination_folder);
                const rawUploadResponse = await fetch("fileupload_single.php", {
                    method: "POST",
                    body: file_data
                });
                /*
                Data modal closes unexpectedly and inexplicably during and only during the first loop
                and has to be reopened.
                My theory: somehow a submit is triggered that closes the modal (but no idea...)
                 */
                if (i === 0) {
                    OPTION_WINDOW.showModal();
                }
                status_array.push(await rawUploadResponse.text());
            }
            renderResponseStatus(status_array);

            await fetchFolderContents(destination_folder);
        }
    });
}