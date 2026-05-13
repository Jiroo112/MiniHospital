<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends MY_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->library('jwt_lib');
    }

    public function register()
    {
        $input = $this->get_json_input();

        // Validasi field wajib
        $required = ['name', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                return $this->response_json([
                    'status'  => false,
                    'message' => "Field '$field' wajib diisi"
                ], 400);
            }
        }

        // Validasi format email
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->response_json([
                'status'  => false,
                'message' => 'Format email tidak valid'
            ], 400);
        }

        // Cek email sudah dipakai
        if ($this->User_model->email_exists($input['email'])) {
            return $this->response_json([
                'status'  => false,
                'message' => 'Email sudah terdaftar'
            ], 400);
        }

        // Hash password
        $hashed_password = password_hash($input['password'], PASSWORD_BCRYPT);

        // Insert ke tabel users (role: pasien)
        $user_id = $this->User_model->create([
            'name'     => $input['name'],
            'email'    => $input['email'],
            'password' => $hashed_password,
            'role'     => 'pasien'
        ]);

        // Insert ke tabel patients
        $this->User_model->create_patient([
            'user_id'       => $user_id,
            'alamat'        => $input['alamat'] ?? null,
            'tanggal_lahir' => $input['tanggal_lahir'] ?? null
        ]);

        return $this->response_json([
            'status'  => true,
            'message' => 'Registrasi berhasil. Silakan login.',
            'data'    => [
                'user_id' => $user_id,
                'name'    => $input['name'],
                'email'   => $input['email']
            ]
        ], 201);
    }


    public function login()
    {
        $input = $this->get_json_input();

        if (empty($input['email']) || empty($input['password'])) {
            return $this->response_json([
                'status'  => false,
                'message' => 'Email dan password wajib diisi'
            ], 400);
        }

        // Cari user di database
        $user = $this->User_model->get_by_email($input['email']);

        if (!$user) {
            return $this->response_json([
                'status'  => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        // Verifikasi password
        if (!password_verify($input['password'], $user['password'])) {
            return $this->response_json([
                'status'  => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        // Ambil ID role-specific (pasien_id atau dokter_id)
        $extra_data = [];
        if ($user['role'] === 'pasien') {
            $patient = $this->db->where('user_id', $user['id'])->get('patients')->row_array();
            if ($patient) $extra_data['pasien_id'] = (int) $patient['id'];
        } elseif ($user['role'] === 'dokter') {
            $doctor = $this->db->where('user_id', $user['id'])->get('doctors')->row_array();
            if ($doctor) $extra_data['dokter_id'] = (int) $doctor['id'];
        }

        // Generate JWT token
        $token = $this->jwt_lib->encode(array_merge([
            'user_id' => (int) $user['id'],
            'name'    => $user['name'],
            'email'   => $user['email'],
            'role'    => $user['role']
        ], $extra_data));

        return $this->response_json([
            'status'  => true,
            'message' => 'Login berhasil',
            'data'    => [
                'token' => $token,
                'user'  => array_merge([
                    'id'    => (int) $user['id'],
                    'name'  => $user['name'],
                    'email' => $user['email'],
                    'role'  => $user['role']
                ], $extra_data)
            ]
        ], 200);
    }

    public function profile()
    {
        $user_data = $this->check_auth();  // ini cek JWT otomatis

        $user = $this->User_model->get_by_id($user_data['user_id']);

        if (!$user) {
            return $this->response_json([
                'status'  => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        return $this->response_json([
            'status'  => true,
            'message' => 'Profile berhasil diambil',
            'data'    => $user
        ], 200);
    }
}