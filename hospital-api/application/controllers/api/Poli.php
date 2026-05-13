<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Poli extends MY_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Poli_model');
    }

    /**
     * GET /api/poli
     * List semua poli. Akses: publik (untuk halaman booking pasien)
     */
    public function index()
    {
        $data = $this->Poli_model->get_all();
        $this->response_json([
            'status'  => true,
            'message' => 'Daftar poli berhasil diambil',
            'data'    => $data
        ], 200);
    }

    /**
     * GET /api/poli/{id}
     */
    public function detail($id)
    {
        $data = $this->Poli_model->get_by_id($id);
        if (!$data) {
            $this->response_json(['status' => false, 'message' => 'Poli tidak ditemukan'], 404);
            return;
        }
        $this->response_json(['status' => true, 'data' => $data], 200);
    }

    /**
     * POST /api/poli
     * Akses: admin only
     */
    public function create()
    {
        $this->check_role('admin');

        $input = $this->get_json_input();

        if (empty($input['nama_poli'])) {
            $this->response_json(['status' => false, 'message' => 'nama_poli wajib diisi'], 400);
            return;
        }

        $id = $this->Poli_model->create([
            'nama_poli' => $input['nama_poli'],
            'lokasi'    => $input['lokasi'] ?? null
        ]);

        $this->response_json([
            'status'  => true,
            'message' => 'Poli berhasil ditambahkan',
            'data'    => ['id' => $id]
        ], 201);
    }

    /**
     * PUT /api/poli/{id}
     * Akses: admin only
     */
    public function update($id)
    {
        $this->check_role('admin');

        $existing = $this->Poli_model->get_by_id($id);
        if (!$existing) {
            $this->response_json(['status' => false, 'message' => 'Poli tidak ditemukan'], 404);
            return;
        }

        $input = $this->get_json_input();

        $data = [];
        if (!empty($input['nama_poli'])) $data['nama_poli'] = $input['nama_poli'];
        if (isset($input['lokasi']))     $data['lokasi']    = $input['lokasi'];

        if (empty($data)) {
            $this->response_json(['status' => false, 'message' => 'Tidak ada data yang diupdate'], 400);
            return;
        }

        $this->Poli_model->update($id, $data);

        $this->response_json([
            'status'  => true,
            'message' => 'Poli berhasil diupdate',
            'data'    => $this->Poli_model->get_by_id($id)
        ], 200);
    }

    /**
     * DELETE /api/poli/{id}
     * Akses: admin only
     */
    public function delete($id)
    {
        $this->check_role('admin');

        $existing = $this->Poli_model->get_by_id($id);
        if (!$existing) {
            $this->response_json(['status' => false, 'message' => 'Poli tidak ditemukan'], 404);
            return;
        }

        $this->Poli_model->delete($id);

        $this->response_json([
            'status'  => true,
            'message' => 'Poli berhasil dihapus'
        ], 200);
    }
}