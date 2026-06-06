<?php

// Script to move images from private to public storage
$privateDir = __DIR__ . '/storage/app/private/products';
$publicDir = __DIR__ . '/storage/app/public/products';

if (!is_dir($publicDir)) {
    mkdir($publicDir, 0777, true);
}

if (!is_dir($publicDir . '/gallery')) {
    mkdir($publicDir . '/gallery', 0777, true);
}

function copyDir($src, $dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                copyDir($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

if (is_dir($privateDir)) {
    copyDir($privateDir, $publicDir);
    echo "Files copied successfully from private to public.";
} else {
    echo "Private products directory does not exist.";
}
