<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Poli_model extends CI_Model {

    public function get_all()
    {
        return $this->db->get('poli')->result_array();
    }

    public function get_by_id($id)
    {
        return $this->db->where('id', $id)->get('poli')->row_array();
    }

    public function create($data)
    {
        $this->db->insert('poli', $data);
        return $this->db->insert_id();
    }

    public function update($id, $data)
    {
        $this->db->where('id', $id)->update('poli', $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id)
    {
        $this->db->where('id', $id)->delete('poli');
        return $this->db->affected_rows() > 0;
    }
}