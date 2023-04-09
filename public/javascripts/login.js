"use strict";
import { MIN_USER_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "./globals.js";

const LOGIN_FORM = document.getElementById("login_form");
const UNAME_INPUT = document.getElementById("user_name");
const PW_INPUT = document.getElementById("password");
const SUBMIT_BTN = document.getElementById("submit_btn");

const checkInput = () => UNAME_INPUT.value.length >= MIN_USER_NAME_LENGTH && PW_INPUT.value.length >= MIN_PASSWORD_LENGTH;

window.addEventListener("DOMContentLoaded", () => {
    // check input data via JavaScript BEFORE submit
    SUBMIT_BTN.addEventListener("click", (e) => {
        e.preventDefault();
        if (checkInput()) {
            LOGIN_FORM.submit();
        }
    });
});