"use strict";
import { NO_PASSWORD_MATCH, USER_NAME_AVAILABLE, MIN_USER_NAME_LENGTH, MIN_PASSWORD_LENGTH, isAlphaNumeric } from "./globals.js";

const REGISTER_FORM = document.getElementById("register_form");
const UNAME_INPUT = document.getElementById("user_name");
const PW1_INPUT = document.getElementById("password1");
const PW2_INPUT = document.getElementById("password2");
const UN_INFO_P = document.getElementById("user_name_info");
const PW_INFO_P = document.getElementById("password_info");
const SUBMIT_BTN = document.getElementById("submit_btn");

const checkUsername = () => UNAME_INPUT.value.trim().length >= MIN_USER_NAME_LENGTH && isAlphaNumeric(UNAME_INPUT.value.trim());
const checkPassword = () => matchingPasswords() && Math.max(PW1_INPUT.value.length, PW2_INPUT.value.length) >= MIN_PASSWORD_LENGTH;

function matchingPasswords() {
    let pw1 = PW1_INPUT.value;
    let pw2 = PW2_INPUT.value;
    if (pw1.length === 0
        && pw2.length === 0) return false;

    PW_INFO_P.textContent = pw1 === pw2 ? "" : NO_PASSWORD_MATCH;
    return pw1 === pw2;
}

async function uniqueUsername() {
    let query = UNAME_INPUT.value.trim();
    if (query.length === 0) {
        UN_INFO_P.textContent = "";
    } else if (query.includes('"')) { // prevent sql injection
        return undefined;
    } else {
        const rawResponse = await fetch("ajax_find_user_name.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `q=${query}`
        });
        const response = await rawResponse.text();
        UN_INFO_P.className = "";
        UN_INFO_P.textContent = response;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    PW1_INPUT.addEventListener("keyup", matchingPasswords);
    PW2_INPUT.addEventListener("keyup", matchingPasswords);
    UNAME_INPUT.addEventListener("keyup", uniqueUsername);

    // check input data via JavaScript BEFORE submit
    SUBMIT_BTN.addEventListener("click", (e) => {
        e.preventDefault();
        if (checkUsername()
         && checkPassword()) {
            REGISTER_FORM.submit();
        }
    });
});