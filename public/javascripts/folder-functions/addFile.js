"use strict";
import {fetchFolderContents, renderResponseStatus} from "../folder.js";
import {OPTION_WINDOW_CONTENT, showOptionWindow} from "./optionWindow.js";
import {I18N} from "../globals.js";

export async function addFile(destination_folder) {
    showOptionWindow(I18N['file_upload']);

    const rawHTMLResponse = await fetch("public/included_html/addFileForm.php", {
        method: "POST",
        headers: { "Accept": "text/html" }
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
                const rawUploadResponse = await fetch("fileupload.php", {
                    method: "POST",
                    body: file_data
                });
                status_array.push(await rawUploadResponse.text());
            }
            renderResponseStatus(status_array);

            await fetchFolderContents(destination_folder);
        }
    });
}