<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Doctor_model extends CI_Model {

    /**
     * Ambil semua dokter dengan nested poli + jadwal
     */
    public function get_all_with_relations()
    {
        $doctors = $this->db
            ->select('d.id, u.name AS nama, d.spesialis, d.no_hp, u.email, d.user_id, d.poli_id')
            ->from('doctors d')
            ->join('users u', 'u.id = d.user_id')
            ->get()
            ->result_array();

        // Untuk tiap dokter, tambahkan nested 'poli' dan 'jadwal'
        foreach ($doctors as &$dr) {
            $dr['poli']   = $this->get_poli($dr['poli_id']);
            $dr['jadwal'] = $this->get_schedules($dr['id']);
        }

        return $doctors;
    }

    /**
     * Ambil 1 dokter berdasarkan ID dengan nested data
     */
    public function get_by_id_with_relations($id)
    {
        $doctor = $this->db
            ->select('d.id, u.name AS nama, d.spesialis, d.no_hp, u.email, d.user_id, d.poli_id')
            ->from('doctors d')
            ->join('users u', 'u.id = d.user_id')
            ->where('d.id', $id)
            ->get()
            ->row_array();

        if (!$doctor) return null;

        $doctor['poli']   = $this->get_poli($doctor['poli_id']);
        $doctor['jadwal'] = $this->get_schedules($doctor['id']);

        return $doctor;
    }

    /**
     * Cek apakah dokter dengan ID ini ada
     */
    public function get_by_id($id)
    {
        return $this->db->where('id', $id)->get('doctors')->row_array();
    }

    /**
     * Insert dokter baru.
     * Catatan: $user_data berisi name, email, password
     * $doctor_data berisi spesialis, no_hp, poli_id
     * Return ID dokter (bukan user_id) yang baru dibuat.
     */
    public function create($user_data, $doctor_data)
    {
        $this->db->trans_start();

        // Insert ke users dengan role 'dokter'
        $user_data['role'] = 'dokter';
        $this->db->insert('users', $user_data);
        $user_id = $this->db->insert_id();

        // Insert ke doctors
        $doctor_data['user_id'] = $user_id;
        $this->db->insert('doctors', $doctor_data);
        $doctor_id = $this->db->insert_id();

        $this->db->trans_complete();

        if ($this->db->trans_status() === FALSE) {
            return false;
        }

        return $doctor_id;
    }

    /**
     * Update data dokter dan user (transaksi)
     */
    public function update($id, $user_data, $doctor_data)
    {
        $doctor = $this->get_by_id($id);
        if (!$doctor) return false;

        $this->db->trans_start();

        if (!empty($user_data)) {
            $this->db->where('id', $doctor['user_id'])->update('users', $user_data);
        }

        if (!empty($doctor_data)) {
            $this->db->where('id', $id)->update('doctors', $doctor_data);
        }

        $this->db->trans_complete();

        return $this->db->trans_status() !== FALSE;
    }

    /**
     * Hapus dokter — cukup hapus user, doctors otomatis ikut terhapus (ON DELETE CASCADE)
     */
    public function delete($id)
    {
        $doctor = $this->get_by_id($id);
        if (!$doctor) return false;

        $this->db->where('id', $doctor['user_id'])->delete('users');
        return $this->db->affected_rows() > 0;
    }

    // --- Helper internal ---

    private function get_poli($poli_id)
    {
        return $this->db
            ->select('id, nama_poli, lokasi')
            ->where('id', $poli_id)
            ->get('poli')
            ->row_array();
    }

    private function get_schedules($doctor_id)
    {
        return $this->db
            ->select('id, hari, jam_mulai, jam_selesai')
            ->where('dokter_id', $doctor_id)
            ->get('schedules')
            ->result_array();
    }
}