"use strict";
import i18n from "../../lang/i18n.json" assert { type: "json" };
// Not usable in Firefox, because import assertions aren't supported (yet, hopefully)
// https://bugzilla.mozilla.org/show_bug.cgi?id=1668330
// Alternative would be: import {i18n} from "../../lang/i18n.JS";
// with i18n.js: export const i18n = { ... };
// -----
// Another possible solution to implement: dynamic imports (supported by Firefox)
// const lang_json = await import(`../../lang/${getCookie("locale")}.json`, {
//     assert: { type: 'json' }
// });
// console.log(lang_json.default);

const localeCookie = getCookie("locale") ? getCookie("locale") : navigator.language.replace('-', '_');

const usedLocale = i18n[localeCookie] ? localeCookie : "en_US";
export const I18N = Object.freeze(i18n[usedLocale]);
export const NO_PASSWORD_MATCH = I18N["password_nomatch"];
export const USER_NAME_AVAILABLE = 'User name available.';
export const MIN_USER_NAME_LENGTH = 5;
export const MIN_PASSWORD_LENGTH = 5;

String.prototype.toLocaleUpperCaseFirst = (string) => {
    return string.charAt(0).toLocaleUpperCase() + string.slice(1);
};

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
    if (bytes == 0) return `0 ${I18N["file_sizes"][0]}`;
    let k = 1024,
        dm = decimals || 2,
        sizes = I18N["file_sizes"],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function formatUnixTime(timestamp, locales = usedLocale,
                               options = { dateStyle: "short", timeStyle: "short"}) {
    locales = locales.replace('_', '-');
    timestamp = Number.parseInt(timestamp);
    return new Date(timestamp * 1000).toLocaleString(locales, options);
}
