"use strict";
export const OPTION_WINDOW = document.getElementById("optionWindow");
export const OPTION_WINDOW_TITLE = document.getElementById("optionWindowTitle");
export const OPTION_WINDOW_CONTENT = document.getElementById("optionWindowContent");
export const OPTION_WINDOW_CLOSE = document.getElementById("closeOptionWindow");

export const showOptionWindow = (title = "OptionWindow") => {
    OPTION_WINDOW_CONTENT.innerHTML = "";
    OPTION_WINDOW.classList.remove("hide");
    OPTION_WINDOW.classList.add("show");
    OPTION_WINDOW_TITLE.textContent = title;
}
export const hideOptionWindow = () => {
    OPTION_WINDOW.classList.remove("show");
    OPTION_WINDOW.classList.add("hide");
    OPTION_WINDOW_TITLE.textContent = "";
}
