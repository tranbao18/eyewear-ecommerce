<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Tạo URL thanh toán MoMo
     */
    public function createMomoPayment(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Đơn hàng này đã được thanh toán'], 400);
        }

        $endpoint = env('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create');
        $partnerCode = env('MOMO_PARTNER_CODE');
        $accessKey = env('MOMO_ACCESS_KEY');
        $secretKey = env('MOMO_SECRET_KEY');
        $returnUrl = env('MOMO_RETURN_URL', 'http://localhost:3000/checkout/success');
        $notifyUrl = env('APP_URL', 'http://localhost:8000') . '/api/payment/momo-ipn';

        $orderInfo = "Thanh toan don hang #" . $order->id;
        $amount = (string) (int) $order->total_amount;
        $orderIdMomo = $order->id . "_" . time();
        $requestId = time() . "";
        $requestType = "captureWallet";
        $extraData = "";

        // Tự động tạo chữ ký
        $rawHash = "accessKey=" . $accessKey . "&amount=" . $amount . "&extraData=" . $extraData . "&ipnUrl=" . $notifyUrl . "&orderId=" . $orderIdMomo . "&orderInfo=" . $orderInfo . "&partnerCode=" . $partnerCode . "&redirectUrl=" . $returnUrl . "&requestId=" . $requestId . "&requestType=" . $requestType;
        $signature = hash_hmac("sha256", $rawHash, $secretKey);

        Log::info("MoMo Debug: secretKey length: " . strlen((string)$secretKey) . ", partner: " . $partnerCode);
        Log::info("MoMo Debug rawHash: " . $rawHash);

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

        // Chế độ Mock (Giả lập MoMo) để test luồng
        if (env('MOMO_MOCK_MODE', true)) { // Đặt mặc định true để test qua màn
            // Tự động cập nhật order sang paid (Giả lập IPN)
            $order->payment_status = 'paid';
            $order->save();

            // Tạo URL trả về frontend với resultCode = 0 (Thành công)
            $mockPayUrl = $returnUrl . "?partnerCode=" . $partnerCode . "&orderId=" . $orderIdMomo . "&requestId=" . $requestId . "&amount=" . $amount . "&orderInfo=" . urlencode($orderInfo) . "&orderType=momo_wallet&transId=123456789&resultCode=0&message=Successful.&payType=qr&responseTime=" . time() . "&extraData=" . $extraData;

            return response()->json([
                'success' => true,
                'payment_url' => $mockPayUrl,
                'is_mock' => true
            ]);
        }

        $result = $this->execPostRequest($endpoint, json_encode($data));
        $jsonResult = json_decode($result, true);

        if (isset($jsonResult['payUrl'])) {
            return response()->json([
                'success' => true,
                'payment_url' => $jsonResult['payUrl']
            ]);
        }

        Log::error('MoMo Payment Error: ' . $result);
        return response()->json(['message' => 'Không thể khởi tạo thanh toán MoMo', 'momo_error' => $jsonResult, 'momo_raw' => $result], 500);
    }

    /**
     * Xử lý IPN từ MoMo gọi về Backend (Server-to-Server)
     */
    public function momoIpn(Request $request)
    {
        $partnerCode = env('MOMO_PARTNER_CODE');
        $accessKey = env('MOMO_ACCESS_KEY');
        $secretKey = env('MOMO_SECRET_KEY');

        // Lấy thông tin từ request
        $orderIdMomo = $request->input('orderId');
        $amount = $request->input('amount');
        $orderInfo = $request->input('orderInfo');
        $orderType = $request->input('orderType');
        $transId = $request->input('transId');
        $resultCode = $request->input('resultCode');
        $message = $request->input('message');
        $payType = $request->input('payType');
        $responseTime = $request->input('responseTime');
        $extraData = $request->input('extraData');
        $m2signature = $request->input('signature');

        // Tính toán lại chữ ký để verify
        $rawHash = "accessKey=" . $accessKey . "&amount=" . $amount . "&extraData=" . $extraData . "&message=" . $message . "&orderId=" . $orderIdMomo . "&orderInfo=" . $orderInfo . "&orderType=" . $orderType . "&partnerCode=" . $partnerCode . "&payType=" . $payType . "&requestId=" . $request->input('requestId') . "&responseTime=" . $responseTime . "&resultCode=" . $resultCode . "&transId=" . $transId;
        
        $signature = hash_hmac("sha256", $rawHash, $secretKey);

        if ($m2signature == $signature) {
            // Check success
            if ($resultCode == 0) {
                $orderIdParts = explode('_', $orderIdMomo);
                $orderId = $orderIdParts[0];

                $order = Order::find($orderId);
                if ($order && $order->payment_status !== 'paid') {
                    $order->payment_status = 'paid';
                    $order->save();
                }
                return response()->json(['status' => 'success', 'message' => 'Received successfully']);
            } else {
                // Payment failed
                return response()->json(['status' => 'success', 'message' => 'Transaction failed']);
            }
        } else {
            Log::error('MoMo Signature Mismatch!');
            return response()->json(['message' => 'Invalid signature'], 400);
        }
    }

    private function execPostRequest($url, $data)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data))
        );
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        // Execute post
        $result = curl_exec($ch);
        
        if ($result === false) {
            Log::error('Curl error: ' . curl_error($ch));
        }

        curl_close($ch);
        return $result;
    }
}
