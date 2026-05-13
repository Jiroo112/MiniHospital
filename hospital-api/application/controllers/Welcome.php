<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

	public function index()
	{
		$this->load->view('welcome_message');
		if ($this->db->conn_id) {
			echo "Database auto-loaded, terkoneksi ke: <b>" . $this->db->database . "</b>";
			echo "<br>";
			echo "Base URL: " . base_url();
		} else {
			echo "Koneksi database GAGAL";
		}
	}
}
