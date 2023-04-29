"use strict";
import {folder_contents_json, renderFolderContents} from "../folder.js";

const SORT_NAME_BTN = document.getElementById("sortByNameBtn");
const SORT_TIME_BTN = document.getElementById("sortByTimeBtn");
const SORT_SIZE_BTN = document.getElementById("sortBySizeBtn");

let last_sort_btn = SORT_NAME_BTN;
export let last_sort_property = "name";
export let last_sort_direction = false; // true = small to big, false = big to small (needs to be inverse at the beginning)

/**
 * Sorts an array of objects by a specified property in ascending or descending order.
 * In case of equal values, the secondary sorting criterion is always the element name: "folder_name" or "file_name".
 * @param {string} property The name of the property to sort by.
 * @param {string} order The sort order, either "asc" for ascending or "desc" for descending. Default is "asc".
 * @returns {function} A comparison function to pass to Array.sort().
 *
 * The function compares two objects by the specified property and sort order.
 * If the values of the property are strings, they are compared case-insensitively.
 * If the values of the property are numbers, they are compared numerically.
 * @example
 * const arr = [{ name: "John", age: 25 }, { name: "Mary", age: 30 }, { name: "Bob", age: 20 }];
 * arr.sort(sortByProperty("name", "asc")); // Sorts by name in ascending order
 * arr.sort(sortByProperty("age", "desc")); // Sorts by age in descending order
 */
export function sortByProperty(property, order = "asc") {
    const sortOrder = order === "desc" ? -1 : 1;
    return (a, b) => {
        if (a[property] === b[property]) {
            const secondary_property = a.hasOwnProperty("folder_name") ? "folder_name" : "file_name";
            return a[secondary_property].toLowerCase().localeCompare(b[secondary_property].toLowerCase()) * sortOrder;
        } else if (typeof a[property] === "string") {
            return a[property].toLowerCase().localeCompare(b[property].toLowerCase()) * sortOrder;
        } else {
            return (a[property] - b[property]) * sortOrder;
        }
    };
}

function sortElements(clicked_btn, property) {
    last_sort_property = property;
    last_sort_direction = last_sort_btn === clicked_btn ? !last_sort_direction : false;
    folder_contents_json["folders"].sort(sortByProperty(`folder_${property}`, !last_sort_direction ? "asc" : "desc"));
    folder_contents_json["files"].sort(sortByProperty(`file_${property}`, !last_sort_direction ? "asc" : "desc"));
    last_sort_btn = clicked_btn;
    renderFolderContents(folder_contents_json);
}

SORT_NAME_BTN.addEventListener("click", () => sortElements(SORT_NAME_BTN, "name"));
SORT_TIME_BTN.addEventListener("click", () => sortElements(SORT_TIME_BTN, "time"));
SORT_SIZE_BTN.addEventListener("click", () => sortElements(SORT_SIZE_BTN, "size"));