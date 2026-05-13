<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Medical_record_model extends CI_Model {

    public function create($data)
    {
        $this->db->insert('medical_records', $data);
        return $this->db->insert_id();
    }

    public function get_by_id($id)
    {
        return $this->build_select()
            ->where('mr.id', $id)
            ->get()->row_array();
    }

    /**
     * Ambil semua rekam medis milik pasien tertentu
     */
    public function get_by_patient($pasien_id)
    {
        return $this->build_select()
            ->where('mr.pasien_id', $pasien_id)
            ->order_by('mr.created_at DESC')
            ->get()->result_array();
    }

    /**
     * SELECT dasar dengan JOIN ke pasien & dokter
     */
    private function build_select()
    {
        return $this->db
            ->select('mr.id, mr.pasien_id, mr.dokter_id,
                      mr.diagnosa, mr.tindakan, mr.resep, mr.catatan, mr.created_at,
                      up.name AS nama_pasien,
                      ud.name AS nama_dokter, d.spesialis')
            ->from('medical_records mr')
            ->join('patients pat', 'pat.id = mr.pasien_id')
            ->join('users up', 'up.id = pat.user_id')
            ->join('doctors d', 'd.id = mr.dokter_id')
            ->join('users ud', 'ud.id = d.user_id');
    }
}