<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User_model extends CI_Model {

    public function email_exists($email)
    {
        return $this->db->where('email', $email)->count_all_results('users') > 0;
    }

    public function get_by_email($email)
    {
        return $this->db->where('email', $email)->get('users')->row_array();
    }

    public function get_by_id($id)
    {
        return $this->db->select('id, name, email, role, created_at')
                        ->where('id', $id)
                        ->get('users')
                        ->row_array();
    }

    public function create($data)
    {
        $this->db->insert('users', $data);
        return $this->db->insert_id();
    }

    public function create_patient($data)
    {
        $this->db->insert('patients', $data);
        return $this->db->insert_id();
    }

    public function get_patient_by_user_id($user_id)
    {
        return $this->db->select('patients.*, users.name, users.email')
                        ->from('patients')
                        ->join('users', 'users.id = patients.user_id')
                        ->where('patients.user_id', $user_id)
                        ->get()
                        ->row_array();
    }
}