<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Queue extends MY_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Queue_model');
        $this->load->model('Doctor_model');
    }

    /**
     * POST /api/queue/book
     * Pasien booking antrian.
     * Body: { dokter_id, tanggal (YYYY-MM-DD, optional, default hari ini) }
     */
    public function book()
    {
        $user = $this->check_role('pasien');

        if (empty($user['pasien_id'])) {
            $this->response_json([
                'status'  => false,
                'message' => 'Data pasien tidak ditemukan. Silakan login ulang.'
            ], 400);
            return;
        }

        $input = $this->get_json_input();

        if (empty($input['dokter_id'])) {
            $this->response_json(['status' => false, 'message' => 'Field dokter_id wajib diisi'], 400);
            return;
        }

        $tanggal = $input['tanggal'] ?? date('Y-m-d');

        // Validasi dokter
        if (!$this->Doctor_model->get_by_id($input['dokter_id'])) {
            $this->response_json(['status' => false, 'message' => 'Dokter tidak ditemukan'], 400);
            return;
        }

        // Validasi tanggal tidak boleh masa lalu
        if (strtotime($tanggal) < strtotime(date('Y-m-d'))) {
            $this->response_json(['status' => false, 'message' => 'Tanggal tidak boleh masa lalu'], 400);
            return;
        }

        // Cek pasien sudah punya booking aktif di tanggal yang sama
        $existing = $this->Queue_model->get_active_by_patient($user['pasien_id'], $tanggal);
        if ($existing) {
            $this->response_json([
                'status'  => false,
                'message' => 'Anda masih punya antrian aktif di tanggal ini. Selesaikan atau batalkan dulu.'
            ], 400);
            return;
        }

        // Hitung nomor antrian
        $nomor_antrian = $this->Queue_model->get_next_antrian($input['dokter_id'], $tanggal);

        // Insert
        $id = $this->Queue_model->create([
            'pasien_id'     => $user['pasien_id'],
            'dokter_id'     => $input['dokter_id'],
            'tanggal'       => $tanggal,
            'nomor_antrian' => $nomor_antrian,
            'status'        => 'menunggu'
        ]);

        $this->response_json([
            'status'  => true,
            'message' => 'Booking antrian berhasil',
            'data'    => [
                'id'            => (int) $id,
                'nomor_antrian' => $nomor_antrian,
                'tanggal'       => $tanggal,
                'status'        => 'menunggu'
            ]
        ], 201);
    }

    /**
     * GET /api/queue/today
     * Lihat antrian hari ini. Response beda berdasarkan role.
     */
    public function today()
    {
        $user = $this->check_auth();
        $tanggal = $this->input->get('tanggal') ?? date('Y-m-d');

        if ($user['role'] === 'admin') {
            $data = $this->Queue_model->get_today_all($tanggal);
        } elseif ($user['role'] === 'dokter') {
            if (empty($user['dokter_id'])) {
                $this->response_json(['status' => false, 'message' => 'Data dokter tidak ditemukan. Silakan login ulang.'], 400);
                return;
            }
            $data = $this->Queue_model->get_today_by_doctor($user['dokter_id'], $tanggal);
        } else { // pasien
            if (empty($user['pasien_id'])) {
                $this->response_json(['status' => false, 'message' => 'Data pasien tidak ditemukan. Silakan login ulang.'], 400);
                return;
            }
            $data = $this->Queue_model->get_today_by_patient($user['pasien_id'], $tanggal);
        }

        $this->response_json([
            'status'  => true,
            'message' => 'Antrian berhasil diambil',
            'data'    => $data,
            'meta'    => [
                'tanggal' => $tanggal,
                'total'   => count($data)
            ]
        ], 200);
    }

    /**
     * GET /api/queue/my
     * Pasien lihat semua booking-nya (riwayat)
     */
    public function my_booking()
    {
        $user = $this->check_role('pasien');

        if (empty($user['pasien_id'])) {
            $this->response_json(['status' => false, 'message' => 'Data pasien tidak ditemukan'], 400);
            return;
        }

        $data = $this->Queue_model->get_all_by_patient($user['pasien_id']);

        $this->response_json([
            'status'  => true,
            'message' => 'Riwayat booking berhasil diambil',
            'data'    => $data
        ], 200);
    }

    /**
     * PUT /api/queue/{id}/status
     * Update status antrian.
     * - admin / dokter: bisa set 'selesai' atau 'batal'
     * - pasien: hanya bisa 'batal' miliknya sendiri
     */
    public function update_status($id)
    {
        $user = $this->check_auth();

        $queue = $this->Queue_model->get_by_id($id);
        if (!$queue) {
            $this->response_json(['status' => false, 'message' => 'Antrian tidak ditemukan'], 404);
            return;
        }

        $input = $this->get_json_input();
        $status_baru = $input['status'] ?? null;

        $allowed_statuses = ['menunggu', 'selesai', 'batal'];
        if (!in_array($status_baru, $allowed_statuses)) {
            $this->response_json([
                'status'  => false,
                'message' => 'Status tidak valid. Pilih: ' . implode(', ', $allowed_statuses)
            ], 400);
            return;
        }

        // Otorisasi by role
        if ($user['role'] === 'pasien') {
            // Pasien cuma boleh batalkan booking-nya sendiri
            if ($queue['pasien_id'] != $user['pasien_id']) {
                $this->response_json(['status' => false, 'message' => 'Bukan booking Anda'], 403);
                return;
            }
            if ($status_baru !== 'batal') {
                $this->response_json(['status' => false, 'message' => 'Pasien hanya bisa membatalkan booking'], 403);
                return;
            }
        } elseif ($user['role'] === 'dokter') {
            // Dokter cuma boleh update antrian untuk dirinya sendiri
            if ($queue['dokter_id'] != $user['dokter_id']) {
                $this->response_json(['status' => false, 'message' => 'Bukan antrian Anda'], 403);
                return;
            }
        }
        // admin: bebas

        $this->Queue_model->update_status($id, $status_baru);

        $this->response_json([
            'status'  => true,
            'message' => 'Status antrian berhasil diupdate',
            'data'    => $this->Queue_model->get_by_id($id)
        ], 200);
    }
}