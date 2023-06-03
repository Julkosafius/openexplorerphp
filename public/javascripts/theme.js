"use strict";
let colorThemes = document.querySelectorAll('[name="theme"]');
const LIGHT = "lightTheme";
const DARK = "darkTheme";

const storeTheme = (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.className = theme;
};

const retrieveTheme = () => {
    const activeTheme = localStorage.getItem("theme");
    if (activeTheme !== LIGHT && activeTheme !== DARK) {
        localStorage.removeItem("theme");
        setTheme();
    } else {
        colorThemes.forEach(themeOption => themeOption.checked = themeOption.id === activeTheme);
        // fallback for no :has() support
        document.documentElement.className = activeTheme;
    }
};

const setTheme = () => {
    if (localStorage.getItem("theme")) {
        retrieveTheme();
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        storeTheme(DARK);
    } else {
        storeTheme(LIGHT);
    }
}

export const refreshTheme = () => {
    // update colorTheme list
    colorThemes = document.querySelectorAll('[name="theme"]');
    // retrieve previously set theme from localStorage or set theme by "prefers-color-scheme" (dark/light)
    setTheme();
    colorThemes.forEach((themeOption) => {
        themeOption.addEventListener("click", () => storeTheme(themeOption.id));
    });
}

window.addEventListener("DOMContentLoaded", refreshTheme);