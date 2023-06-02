"use strict";
const colorThemes = document.querySelectorAll('[name="theme"]');

const storeTheme = (theme) => {
    localStorage.setItem("theme", theme);
};

const retrieveTheme = () => {
    const activeTheme = localStorage.getItem("theme");
    colorThemes.forEach(themeOption => themeOption.checked = themeOption.id === activeTheme);
};

const setTheme = () => {
    if (localStorage.getItem("theme")) {
        retrieveTheme();
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.getElementById("darkTheme").checked = true;
    } else {
        document.getElementById("lightTheme").checked = true;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    // retrieve previously set theme from localStorage or set theme by "prefers-color-scheme" (dark/light)
    setTheme();
    colorThemes.forEach((themeOption) => {
        themeOption.addEventListener("click", () => storeTheme(themeOption.id));
    });
});