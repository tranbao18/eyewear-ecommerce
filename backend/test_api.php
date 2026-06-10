<?php
// Send a test request to local API
$ch = curl_init('http://localhost:8000/api/payment/momo/create/31');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
echo "Result: " . $result . "\n";
