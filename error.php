<?php
$status = isset($_SERVER['REDIRECT_STATUS']) ? $_SERVER['REDIRECT_STATUS'] : 500;
$codes = [
    403 => [
        '403 Forbidden', 'The server has refused to fulfill your request.'
    ],
    404 => [
        '404 Not Found', 'The document/file requested was not found on this server.'
    ],
    405 => [
        '405 Method Not Allowed',
        'The method specified in the Request-Line is not allowed for the specified resource.'
    ],
    408 => [
        '408 Request Timeout', 'Your browser failed to send a request in the time allowed by the server.'
    ],
    500 => [
        '500 Internal Server Error',
        'The request was unsuccessful due to an unexpected condition encountered by the server.'
    ],
    502 => [
        '502 Bad Gateway',
        'The server received an invalid response from the upstream server while trying to fulfill the request.'
    ],
    504 => [
        '504 Gateway Timeout', 'The upstream server failed to send a request in the time allowed by the server.'
    ]
];

$title = $codes[$status][0];
$message = $codes[$status][1];

if (!$title || strlen($status) != 3) {
    $message = 'Please supply a valid status code.';
}
echo '<h1>'.$title.'</h1>
      <p>'.$message.'</p>';