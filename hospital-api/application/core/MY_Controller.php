<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MY_Controller extends CI_Controller {

    protected $user_data = null;

    public function __construct()
    {
        parent::__construct();

        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($this->input->method() === 'options') {
            http_response_code(200);
            exit();
        }
    }

    /**
     * Kirim respons JSON dengan status code (normal flow)
     */
    protected function response_json($data, $status_code = 200)
    {
        $this->output
            ->set_status_header($status_code)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }


    protected function send_error_and_exit($message, $status_code)
    {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode([
            'status'  => false,
            'message' => $message
        ]);
        exit;
    }

    protected function get_json_input()
    {
        return json_decode($this->input->raw_input_stream, true);
    }

    /**
     * Cek JWT di header Authorization
     */
    protected function check_auth()
    {
        $header = $this->input->get_request_header('Authorization');

        if (!$header || !preg_match('/Bearer\s+(\S+)/', $header, $matches)) {
            $this->send_error_and_exit('Token tidak ditemukan', 401);
        }

        $token = $matches[1];
        $this->load->library('jwt_lib');
        $payload = $this->jwt_lib->decode($token);

        if (!$payload) {
            $this->send_error_and_exit('Token invalid atau expired', 401);
        }

        $this->user_data = $payload;
        return $payload;
    }

    /**
     * Cek role user
     */
    protected function check_role($allowed_roles)
    {
        $user = $this->check_auth();

        if (!is_array($allowed_roles)) {
            $allowed_roles = [$allowed_roles];
        }

        if (!in_array($user['role'], $allowed_roles)) {
            $this->send_error_and_exit('Akses ditolak. Anda tidak punya izin untuk fitur ini.', 403);
        }

        return $user;
    }
}