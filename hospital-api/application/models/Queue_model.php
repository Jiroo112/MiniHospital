<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Queue_model extends CI_Model {

    /**
     * Cek apakah pasien punya booking aktif (status menunggu) hari ini
     */
    public function get_active_by_patient($pasien_id, $tanggal)
    {
        return $this->db
            ->where('pasien_id', $pasien_id)
            ->where('tanggal', $tanggal)
            ->where('status', 'menunggu')
            ->get('queues')
            ->row_array();
    }

    /**
     * Ambil nomor antrian berikutnya untuk dokter + tanggal tertentu
     */
    public function get_next_antrian($dokter_id, $tanggal)
    {
        $max = $this->db
            ->select_max('nomor_antrian')
            ->where('dokter_id', $dokter_id)
            ->where('tanggal', $tanggal)
            ->get('queues')
            ->row_array();

        return ($max && $max['nomor_antrian']) ? $max['nomor_antrian'] + 1 : 1;
    }

    public function create($data)
    {
        $this->db->insert('queues', $data);
        return $this->db->insert_id();
    }

    public function get_by_id($id)
    {
        return $this->db->where('id', $id)->get('queues')->row_array();
    }

    /**
     * Antrian hari ini — semua (untuk admin)
     */
    public function get_today_all($tanggal)
    {
        return $this->build_select()
            ->where('q.tanggal', $tanggal)
            ->order_by('q.dokter_id, q.nomor_antrian')
            ->get()->result_array();
    }

    /**
     * Antrian hari ini — untuk dokter tertentu
     */
    public function get_today_by_doctor($dokter_id, $tanggal)
    {
        return $this->build_select()
            ->where('q.dokter_id', $dokter_id)
            ->where('q.tanggal', $tanggal)
            ->order_by('q.nomor_antrian')
            ->get()->result_array();
    }

    /**
     * Antrian hari ini — milik pasien tertentu
     */
    public function get_today_by_patient($pasien_id, $tanggal)
    {
        return $this->build_select()
            ->where('q.pasien_id', $pasien_id)
            ->where('q.tanggal', $tanggal)
            ->order_by('q.created_at')
            ->get()->result_array();
    }

    /**
     * Semua booking milik pasien (semua tanggal)
     */
    public function get_all_by_patient($pasien_id)
    {
        return $this->build_select()
            ->where('q.pasien_id', $pasien_id)
            ->order_by('q.tanggal DESC, q.nomor_antrian')
            ->get()->result_array();
    }

    public function update_status($id, $status)
    {
        $this->db->where('id', $id)->update('queues', ['status' => $status]);
        return $this->db->affected_rows() > 0;
    }

    /**
     * SELECT dasar dengan JOIN ke pasien & dokter, dipakai berulang.
     */
    private function build_select()
    {
        return $this->db
            ->select('q.id, q.tanggal, q.nomor_antrian, q.status, q.created_at,
                      q.pasien_id, up.name AS nama_pasien,
                      q.dokter_id, ud.name AS nama_dokter, p.nama_poli')
            ->from('queues q')
            ->join('patients pat', 'pat.id = q.pasien_id')
            ->join('users up', 'up.id = pat.user_id')
            ->join('doctors d', 'd.id = q.dokter_id')
            ->join('users ud', 'ud.id = d.user_id')
            ->join('poli p', 'p.id = d.poli_id');
    }
}