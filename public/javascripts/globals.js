"use strict";
export const NO_PASSWORD_MATCH = 'Passwords do not match.';
export const USER_NAME_AVAILABLE = 'User name available.';
export const STH_WENT_WRONG = 'Something went wrong.';
export const MIN_USER_NAME_LENGTH = 5;
export const MIN_PASSWORD_LENGTH = 5;
export const WINDOW_TIMEOUT = 2000;

export function isAlphaNumeric(str) {
    let code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
}

export function formatBytes(bytes, decimals) {
    if (bytes == 0) return "0 Byte";
    let k = 1024,
        dm = decimals || 2,
        sizes = ["Byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function formatUnixTime(timestamp, locales = getCookie("locale"), options = { dateStyle: "short", timeStyle: "medium"}) {
    locales = `${locales.substring(0, 2)}-${locales.substring(3)}`;
    timestamp = Number.parseInt(timestamp);
    return new Date(timestamp * 1000).toLocaleString(locales, options);
}

String.prototype.toLocaleUpperCaseFirst = function(string) {
    return string.charAt(0).toLocaleUpperCase() + string.slice(1);
}