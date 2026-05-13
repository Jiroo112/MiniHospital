<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Jwt_lib {

    private $secret;
    private $algo = 'HS256';

    public function __construct()
    {
        $CI =& get_instance();
        $this->secret = $CI->config->item('jwt_secret');
    }

    /**
     * Generate JWT token dari payload (data user)
     */
    public function encode($payload, $expire_seconds = null)
    {
        $CI =& get_instance();
        $exp = $expire_seconds ?? $CI->config->item('jwt_expire_time');

        // Header JWT
        $header = [
            'typ' => 'JWT',
            'alg' => $this->algo
        ];

        // Tambahkan iat (issued at) dan exp (expiry) ke payload
        $payload['iat'] = time();
        $payload['exp'] = time() + $exp;

        // Encode header & payload ke base64url
        $header_encoded  = $this->base64url_encode(json_encode($header));
        $payload_encoded = $this->base64url_encode(json_encode($payload));

        // Buat signature
        $signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", $this->secret, true);
        $signature_encoded = $this->base64url_encode($signature);

        return "$header_encoded.$payload_encoded.$signature_encoded";
    }

    /**
     * Decode dan verifikasi token. Return payload, atau null kalau invalid/expired
     */
    public function decode($token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;

        // Verifikasi signature
        $signature_check = hash_hmac('sha256', "$header_encoded.$payload_encoded", $this->secret, true);
        $signature_check_encoded = $this->base64url_encode($signature_check);

        if (!hash_equals($signature_check_encoded, $signature_encoded)) {
            return null; // signature tidak cocok, token palsu
        }

        // Decode payload
        $payload = json_decode($this->base64url_decode($payload_encoded), true);
        if (!$payload) return null;

        // Cek expiry
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // token expired
        }

        return $payload;
    }

    private function base64url_encode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64url_decode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}