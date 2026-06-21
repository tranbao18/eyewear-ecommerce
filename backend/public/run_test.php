<?php
$endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
$partnerCode = "MOMO";
$accessKey = "M8brj9K6E22vXoDB";
$secretKey = "nqQiVSgDMy809JoPF6OzP5OdPdBPvX4s";

$orderInfo = "Thanh toan don hang #123";
$amount = "100000";
$orderIdMomo = "123_" . time();
$requestId = time() . "";
$requestType = "captureWallet";
$extraData = "";
$returnUrl = "http://localhost:3000/checkout/success";
$notifyUrl = "http://localhost:8000/api/payment/momo-ipn";

$rawHash = "accessKey=" . $accessKey . "&amount=" . $amount . "&extraData=" . $extraData . "&ipnUrl=" . $notifyUrl . "&orderId=" . $orderIdMomo . "&orderInfo=" . $orderInfo . "&partnerCode=" . $partnerCode . "&redirectUrl=" . $returnUrl . "&requestId=" . $requestId . "&requestType=" . $requestType;
$signature = hash_hmac("sha256", $rawHash, $secretKey);

$data = array(
    'partnerCode' => $partnerCode,
    'partnerName' => "Test Store",
    'storeId' => "MomoTestStore",
    'requestId' => $requestId,
    'amount' => (int) $amount,
    'orderId' => $orderIdMomo,
    'orderInfo' => $orderInfo,
    'redirectUrl' => $returnUrl,
    'ipnUrl' => $notifyUrl,
    'lang' => 'vi',
    'extraData' => $extraData,
    'requestType' => $requestType,
    'signature' => $signature
);

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Content-Length: ' . strlen(json_encode($data)))
);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$result = curl_exec($ch);
curl_close($ch);

echo "RawHash: " . $rawHash . "\n";
echo "Signature: " . $signature . "\n";
echo "Response: " . $result . "\n";
