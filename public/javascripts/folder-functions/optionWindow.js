"use strict";
export const OPTION_WINDOW = document.querySelector("[data-modal]");
export const OPTION_WINDOW_TITLE = document.getElementById("optionWindowTitle");
export const OPTION_WINDOW_CONTENT = document.getElementById("optionWindowContent");
export const OPTION_WINDOW_CLOSE = document.querySelector("[data-close-modal]");

OPTION_WINDOW.addEventListener("click", (e) => {
    const dialog_dimensions = OPTION_WINDOW.getBoundingClientRect();
    if (e.clientX < dialog_dimensions.left
     || e.clientX > dialog_dimensions.right
     || e.clientY < dialog_dimensions.top
     || e.clientY > dialog_dimensions.bottom) {
        hideOptionWindow();
    }
});
export const showOptionWindow = (title = "OptionWindow") => {
    OPTION_WINDOW.showModal();
    OPTION_WINDOW_CONTENT.innerHTML = "Loading&hellip;";
    OPTION_WINDOW_TITLE.textContent = title;
}
export const hideOptionWindow = () => {
    OPTION_WINDOW.close();
    OPTION_WINDOW_TITLE.textContent = "";
}
