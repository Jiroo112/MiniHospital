<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Schedule_model extends CI_Model {

    /**
     * Ambil semua jadwal dengan nama dokter (JOIN ke users)
     * Bisa difilter by dokter_id
     */
    public function get_all($dokter_id = null)
    {
        $this->db
            ->select('s.id, s.dokter_id, u.name AS nama_dokter, s.hari, s.jam_mulai, s.jam_selesai')
            ->from('schedules s')
            ->join('doctors d', 'd.id = s.dokter_id')
            ->join('users u', 'u.id = d.user_id')
            ->order_by('s.dokter_id, FIELD(s.hari, "Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu")');

        if ($dokter_id) {
            $this->db->where('s.dokter_id', $dokter_id);
        }

        return $this->db->get()->result_array();
    }

    public function get_by_id($id)
    {
        return $this->db->where('id', $id)->get('schedules')->row_array();
    }

    public function create($data)
    {
        $this->db->insert('schedules', $data);
        return $this->db->insert_id();
    }

    public function update($id, $data)
    {
        $this->db->where('id', $id)->update('schedules', $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id)
    {
        $this->db->where('id', $id)->delete('schedules');
        return $this->db->affected_rows() > 0;
    }
}