<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Schedules extends MY_Controller {

    private $hari_valid = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Schedule_model');
        $this->load->model('Doctor_model');
    }

    /**
     * GET /api/schedules
     * Bisa pakai query string ?dokter_id=1 untuk filter
     */
    public function index()
    {
        $dokter_id = $this->input->get('dokter_id');
        $data = $this->Schedule_model->get_all($dokter_id);

        $this->response_json([
            'status'  => true,
            'message' => 'Daftar jadwal berhasil diambil',
            'data'    => $data
        ], 200);
    }

    /**
     * GET /api/schedules/{id}
     */
    public function detail($id)
    {
        $data = $this->Schedule_model->get_by_id($id);
        if (!$data) {
            $this->response_json(['status' => false, 'message' => 'Jadwal tidak ditemukan'], 404);
            return;
        }
        $this->response_json(['status' => true, 'data' => $data], 200);
    }

    /**
     * POST /api/schedules
     * Akses: admin only
     */
    public function create()
    {
        $this->check_role('admin');

        $input = $this->get_json_input();

        // Validasi field wajib
        $required = ['dokter_id', 'hari', 'jam_mulai', 'jam_selesai'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->response_json(['status' => false, 'message' => "Field '$field' wajib diisi"], 400);
                return;
            }
        }

        // Validasi dokter
        if (!$this->Doctor_model->get_by_id($input['dokter_id'])) {
            $this->response_json(['status' => false, 'message' => 'Dokter tidak ditemukan'], 400);
            return;
        }

        // Validasi hari
        if (!in_array($input['hari'], $this->hari_valid)) {
            $this->response_json([
                'status'  => false,
                'message' => 'Hari tidak valid. Pilih: ' . implode(', ', $this->hari_valid)
            ], 400);
            return;
        }

        // Validasi jam (jam_mulai harus sebelum jam_selesai)
        if (strtotime($input['jam_mulai']) >= strtotime($input['jam_selesai'])) {
            $this->response_json([
                'status'  => false,
                'message' => 'jam_mulai harus sebelum jam_selesai'
            ], 400);
            return;
        }

        $id = $this->Schedule_model->create([
            'dokter_id'   => $input['dokter_id'],
            'hari'        => $input['hari'],
            'jam_mulai'   => $input['jam_mulai'],
            'jam_selesai' => $input['jam_selesai']
        ]);

        $this->response_json([
            'status'  => true,
            'message' => 'Jadwal berhasil ditambahkan',
            'data'    => $this->Schedule_model->get_by_id($id)
        ], 201);
    }

    /**
     * PUT /api/schedules/{id}
     * Akses: admin only
     */
    public function update($id)
    {
        $this->check_role('admin');

        $existing = $this->Schedule_model->get_by_id($id);
        if (!$existing) {
            $this->response_json(['status' => false, 'message' => 'Jadwal tidak ditemukan'], 404);
            return;
        }

        $input = $this->get_json_input();

        $data = [];
        if (!empty($input['hari'])) {
            if (!in_array($input['hari'], $this->hari_valid)) {
                $this->response_json(['status' => false, 'message' => 'Hari tidak valid'], 400);
                return;
            }
            $data['hari'] = $input['hari'];
        }
        if (!empty($input['jam_mulai']))   $data['jam_mulai']   = $input['jam_mulai'];
        if (!empty($input['jam_selesai'])) $data['jam_selesai'] = $input['jam_selesai'];

        // Validasi jam kalau dua-duanya diupdate
        if (isset($data['jam_mulai'], $data['jam_selesai'])
            && strtotime($data['jam_mulai']) >= strtotime($data['jam_selesai'])) {
            $this->response_json(['status' => false, 'message' => 'jam_mulai harus sebelum jam_selesai'], 400);
            return;
        }

        if (empty($data)) {
            $this->response_json(['status' => false, 'message' => 'Tidak ada data yang diupdate'], 400);
            return;
        }

        $this->Schedule_model->update($id, $data);

        $this->response_json([
            'status'  => true,
            'message' => 'Jadwal berhasil diupdate',
            'data'    => $this->Schedule_model->get_by_id($id)
        ], 200);
    }

    /**
     * DELETE /api/schedules/{id}
     * Akses: admin only
     */
    public function delete($id)
    {
        $this->check_role('admin');

        $existing = $this->Schedule_model->get_by_id($id);
        if (!$existing) {
            $this->response_json(['status' => false, 'message' => 'Jadwal tidak ditemukan'], 404);
            return;
        }

        $this->Schedule_model->delete($id);

        $this->response_json(['status' => true, 'message' => 'Jadwal berhasil dihapus'], 200);
    }
}