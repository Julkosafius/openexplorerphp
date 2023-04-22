<?php

const MIN_USER_NAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 5;
const INTEGER_MAX_VALUE = 9223372036854775807;
const MAX_FOLDER_NAME_LEN = 255;
const MAX_FILE_NAME_LEN = 255;
const USER_DIR_PERMS = 0777;

const NO_PASSWORD_MATCH = 'Passwords do not match.';
const PASSWORD_TOO_SHORT = 'Password is too short.';
const USER_NAME_TAKEN = 'This user name is already taken.';
const USER_NAME_AVAILABLE = 'User name available.';
const USER_NAME_TOO_SHORT = 'User name is too short.';
const USER_NAME_ILLEGAL = 'User name contains illegal characters.';
const USER_NAME_OR_PASSWORD_WRONG = 'User name or password wrong.';
const NO_DB_ACCESS = 'No access to the database.';
const STH_WENT_WRONG = 'Something went wrong.';

const DATE_FORMAT = 'Y-m-d h:i:s';

$salt = '9509f879cbfd444b4ec76c7af6416c46a33f4a353d96aa1be01fd640a2e37144';

//$lang_json = file_get_contents('lang/'.locale_get_default().'.json');
$lang_json = file_get_contents('lang/en_US.json');
$lang = json_decode($lang_json, true);

$allowed_file_types = [
    'application/pdf',
    'image/gif',
    'image/jpeg',
    'image/png',
    'text/plain'
];