<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Doctors extends MY_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Doctor_model');
        $this->load->model('User_model');
    }

    /**
     * GET /api/doctors
     * List semua dokter dengan nested poli + jadwal.
     * Akses: publik (untuk halaman booking)
     */
    public function index()
    {
        $data = $this->Doctor_model->get_all_with_relations();
        $this->response_json([
            'status'  => true,
            'message' => 'Daftar dokter berhasil diambil',
            'data'    => $data
        ], 200);
    }

    /**
     * GET /api/doctors/{id}
     */
    public function detail($id)
    {
        $data = $this->Doctor_model->get_by_id_with_relations($id);
        if (!$data) {
            $this->response_json(['status' => false, 'message' => 'Dokter tidak ditemukan'], 404);
            return;
        }
        $this->response_json(['status' => true, 'data' => $data], 200);
    }

    /**
     * POST /api/doctors
     * Akses: admin only
     * Body: { name, email, password, spesialis, no_hp, poli_id }
     */
    public function create()
    {
        $this->check_role('admin');

        $input = $this->get_json_input();

        // Validasi
        $required = ['name', 'email', 'password', 'spesialis', 'poli_id'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->response_json(['status' => false, 'message' => "Field '$field' wajib diisi"], 400);
                return;
            }
        }

        // Cek email belum dipakai
        if ($this->User_model->email_exists($input['email'])) {
            $this->response_json(['status' => false, 'message' => 'Email sudah terdaftar'], 400);
            return;
        }

        // Cek poli_id valid
        $this->load->model('Poli_model');
        if (!$this->Poli_model->get_by_id($input['poli_id'])) {
            $this->response_json(['status' => false, 'message' => 'Poli tidak ditemukan'], 400);
            return;
        }

        $user_data = [
            'name'     => $input['name'],
            'email'    => $input['email'],
            'password' => password_hash($input['password'], PASSWORD_BCRYPT)
        ];
        $doctor_data = [
            'spesialis' => $input['spesialis'],
            'no_hp'     => $input['no_hp'] ?? null,
            'poli_id'   => $input['poli_id']
        ];

        $doctor_id = $this->Doctor_model->create($user_data, $doctor_data);
        if (!$doctor_id) {
            $this->response_json(['status' => false, 'message' => 'Gagal menambah dokter'], 500);
            return;
        }

        $this->response_json([
            'status'  => true,
            'message' => 'Dokter berhasil ditambahkan',
            'data'    => $this->Doctor_model->get_by_id_with_relations($doctor_id)
        ], 201);
    }

    /**
     * PUT /api/doctors/{id}
     * Akses: admin only
     */
    public function update($id)
    {
        $this->check_role('admin');

        $doctor = $this->Doctor_model->get_by_id($id);
        if (!$doctor) {
            $this->response_json(['status' => false, 'message' => 'Dokter tidak ditemukan'], 404);
            return;
        }

        $input = $this->get_json_input();

        $user_data = [];
        if (!empty($input['name']))  $user_data['name']  = $input['name'];
        if (!empty($input['email'])) $user_data['email'] = $input['email'];

        $doctor_data = [];
        if (!empty($input['spesialis'])) $doctor_data['spesialis'] = $input['spesialis'];
        if (isset($input['no_hp']))      $doctor_data['no_hp']     = $input['no_hp'];
        if (!empty($input['poli_id']))   $doctor_data['poli_id']   = $input['poli_id'];

        if (empty($user_data) && empty($doctor_data)) {
            $this->response_json(['status' => false, 'message' => 'Tidak ada data yang diupdate'], 400);
            return;
        }

        $ok = $this->Doctor_model->update($id, $user_data, $doctor_data);
        if (!$ok) {
            $this->response_json(['status' => false, 'message' => 'Gagal update dokter'], 500);
            return;
        }

        $this->response_json([
            'status'  => true,
            'message' => 'Dokter berhasil diupdate',
            'data'    => $this->Doctor_model->get_by_id_with_relations($id)
        ], 200);
    }

    /**
     * DELETE /api/doctors/{id}
     * Akses: admin only
     */
    public function delete($id)
    {
        $this->check_role('admin');

        $doctor = $this->Doctor_model->get_by_id($id);
        if (!$doctor) {
            $this->response_json(['status' => false, 'message' => 'Dokter tidak ditemukan'], 404);
            return;
        }

        $this->Doctor_model->delete($id);

        $this->response_json([
            'status'  => true,
            'message' => 'Dokter berhasil dihapus'
        ], 200);
    }
}