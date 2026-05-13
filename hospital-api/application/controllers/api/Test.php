<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Test extends MY_Controller {

    public function index()
    {
        $this->response_json([
            'status'  => true,
            'message' => 'API CI3 berhasil jalan',
            'data'    => [
                'database'    => $this->db->database,
                'php_version' => phpversion(),
                'ci_version'  => CI_VERSION
            ]
        ], 200);
    }

    public function jwt()
    {
        $this->load->library('jwt_lib');

        // Generate token contoh
        $token = $this->jwt_lib->encode([
            'user_id' => 1,
            'name'    => 'Test User',
            'role'    => 'admin'
        ]);

        // Decode kembali untuk verifikasi
        $decoded = $this->jwt_lib->decode($token);

        $this->response_json([
            'status'  => true,
            'message' => 'JWT library jalan',
            'data'    => [
                'token'   => $token,
                'decoded' => $decoded
            ]
        ], 200);
    }
}