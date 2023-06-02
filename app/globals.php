<?php
$i18n = json_decode(file_get_contents('lang/i18n.json'), true);
$localeCookie = $_COOKIE['locale'];
$usedLocale = $i18n[$localeCookie] ? $localeCookie : 'en_US';
$I18N = $i18n[$usedLocale];

const MIN_USER_NAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 5;
const INTEGER_MAX_VALUE = 9223372036854775807;
const MAX_FOLDER_NAME_LEN = 255;
const MAX_FILE_NAME_LEN = 255;
const USER_DIR_PERMS = 0777;
const PASSWORD_TOO_SHORT = 'Password is too short.';

$salt = '9509f879cbfd444b4ec76c7af6416c46a33f4a353d96aa1be01fd640a2e37144';


$allowed_file_types = [
    'application/pdf',
    'image/gif',
    'image/jpeg',
    'image/png',
    'text/plain'
];