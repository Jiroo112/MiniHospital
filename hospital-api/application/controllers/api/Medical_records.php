<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Medical_records extends MY_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Medical_record_model');
        $this->load->model('User_model');
    }

    /**
     * POST /api/medical-records
     * Akses: dokter only.
     * Body: { pasien_id, diagnosa, tindakan, resep, catatan }
     * dokter_id otomatis dari JWT.
     */
    public function create()
    {
        $user = $this->check_role('dokter');

        if (empty($user['dokter_id'])) {
            $this->response_json([
                'status'  => false,
                'message' => 'Data dokter tidak ditemukan. Silakan login ulang.'
            ], 400);
            return;
        }

        $input = $this->get_json_input();

        $required = ['pasien_id', 'diagnosa'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->response_json(['status' => false, 'message' => "Field '$field' wajib diisi"], 400);
                return;
            }
        }

        // Validasi pasien exists
        $patient = $this->db->where('id', $input['pasien_id'])->get('patients')->row_array();
        if (!$patient) {
            $this->response_json(['status' => false, 'message' => 'Pasien tidak ditemukan'], 400);
            return;
        }

        $id = $this->Medical_record_model->create([
            'pasien_id' => $input['pasien_id'],
            'dokter_id' => $user['dokter_id'],
            'diagnosa'  => $input['diagnosa'],
            'tindakan'  => $input['tindakan']  ?? null,
            'resep'     => $input['resep']     ?? null,
            'catatan'   => $input['catatan']   ?? null
        ]);

        $this->response_json([
            'status'  => true,
            'message' => 'Rekam medis berhasil disimpan',
            'data'    => $this->Medical_record_model->get_by_id($id)
        ], 201);
    }

    /**
     * GET /api/medical-records/patient/{pasien_id}
     * Akses:
     *   - admin, dokter: bebas akses
     *   - pasien: hanya boleh akses miliknya sendiri
     */
    public function by_patient($pasien_id)
    {
        $user = $this->check_auth();

        if ($user['role'] === 'pasien') {
            if (empty($user['pasien_id']) || $user['pasien_id'] != $pasien_id) {
                $this->response_json([
                    'status'  => false,
                    'message' => 'Anda hanya bisa melihat rekam medis Anda sendiri'
                ], 403);
                return;
            }
        }

        $data = $this->Medical_record_model->get_by_patient($pasien_id);

        $this->response_json([
            'status'  => true,
            'message' => 'Rekam medis berhasil diambil',
            'data'    => $data,
            'meta'    => ['total' => count($data)]
        ], 200);
    }

    /**
     * GET /api/medical-records/{id}
     * Detail satu rekam medis.
     * Pasien hanya boleh akses kalau itu miliknya.
     */
    public function detail($id)
    {
        $user = $this->check_auth();

        $record = $this->Medical_record_model->get_by_id($id);
        if (!$record) {
            $this->response_json(['status' => false, 'message' => 'Rekam medis tidak ditemukan'], 404);
            return;
        }

        if ($user['role'] === 'pasien') {
            if (empty($user['pasien_id']) || $user['pasien_id'] != $record['pasien_id']) {
                $this->response_json(['status' => false, 'message' => 'Bukan rekam medis Anda'], 403);
                return;
            }
        }

        $this->response_json([
            'status'  => true,
            'message' => 'Rekam medis berhasil diambil',
            'data'    => $record
        ], 200);
    }

    /**
     * GET /api/medical-records/my
     * Shortcut untuk pasien lihat rekam medisnya sendiri tanpa tahu ID
     */
    public function my_records()
    {
        $user = $this->check_role('pasien');

        if (empty($user['pasien_id'])) {
            $this->response_json(['status' => false, 'message' => 'Data pasien tidak ditemukan'], 400);
            return;
        }

        $data = $this->Medical_record_model->get_by_patient($user['pasien_id']);

        $this->response_json([
            'status'  => true,
            'message' => 'Rekam medis Anda',
            'data'    => $data
        ], 200);
    }
}