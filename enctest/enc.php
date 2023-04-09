<?php

function str_contains($haystack, $needle) {
    return $needle !== '' && mb_strpos($haystack, $needle) !== false;
}
function getFileType($file_name) {
    if (str_contains($file_name, '.')) {
        $tmp = explode('.', $file_name); // cannot pass explode directly into end!!
        $file_type = strtolower(end($tmp));
    }
    return $file_type;
}

$user_id = "4f96939f19a1692655fa50bac8067e22";

$file = "p.jpg";

define('SEPERATOR', ';');

encrypt($file, $user_id);
decrypt($file, $user_id);

function encrypt($file_path, $user_id) {
    $fileData = file_get_contents($file_path);
    $iv = substr(sha1(mt_rand()), 24); // 16 random numbers and letters

    $file_type = getFileType($file_path);
    $added_meta = $file_type.SEPERATOR.$iv.SEPERATOR;

    $encData = AES::encrypt($user_id, $iv, $fileData);
    file_put_contents($file_path, $added_meta.$encData); // save initialization vector in the file
}

function decrypt($file_path, $user_id) {
    $iterateUntilSeperator = function($str, $i = 0) {
        $out = '';
        for ($i; $str[$i] != SEPERATOR; $i++) {
            $out .= $str[$i];
        }
        return $out;
    };

    $fileData = file_get_contents($file_path);

    $readIndex = 0;
    $file_type = $iterateUntilSeperator($fileData);

    $readIndex += strlen($file_type) + 1;
    $iv = $iterateUntilSeperator($fileData, $readIndex);

    $readIndex += strlen($iv) + 1;
    $fileData = substr($fileData, $readIndex);

    $decData = AES::decrypt($user_id, $fileData);
    file_put_contents($file_path, $decData);
}

class AES {

    private static $OPENSSL_CIPHER_NAME = "aes-128-cbc"; // Name of OpenSSL Cipher 
    private static $CIPHER_KEY_LEN = 16; // 128 bits
 
    static function encrypt($key, $iv, $data) {
     
        if (strlen($key) < AES::$CIPHER_KEY_LEN) {
            $key = str_pad("$key", AES::$CIPHER_KEY_LEN, "0"); // 0 pad to len 16
        } else if (strlen($key) > AES::$CIPHER_KEY_LEN) {
            $key = substr($key, 0, AES::$CIPHER_KEY_LEN); // truncate to 16 bytes
        }
         
        $encodedEncryptedData = base64_encode(openssl_encrypt($data, AES::$OPENSSL_CIPHER_NAME, $key, OPENSSL_RAW_DATA, $iv));
        $encodedIV = base64_encode($iv);
        $encryptedPayload = $encodedEncryptedData.":".$encodedIV;
 
        return bin2hex($encryptedPayload);
         
    }
 
     
    static function decrypt($key, $data) {
        if (strlen($key) < AES::$CIPHER_KEY_LEN) {
            $key = str_pad("$key", AES::$CIPHER_KEY_LEN, "0"); // 0 pad to len 16
        } else if (strlen($key) > AES::$CIPHER_KEY_LEN) {
            $key = substr($key, 0, AES::$CIPHER_KEY_LEN); // truncate to 16 bytes
        }
        $dataStr = hex2bin($data);
         
        $parts = explode(':', $dataStr); // Separate Encrypted data from iv.
        $decryptedData = openssl_decrypt(base64_decode($parts[0]), AES::$OPENSSL_CIPHER_NAME, $key, OPENSSL_RAW_DATA, base64_decode($parts[1]));
         
        return $decryptedData;
    }
  
  }