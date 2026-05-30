# Mini Hospital System

Kontibusi
Jiroo112 : Ali Maskur Alfatah
Iskaa : Bagas Suyendra

Sistem informasi mini rumah sakit dengan REST API dan JWT Authentication.

Dibuat sebagai test case onboarding magang TIF POLIJE di CV. Esolusindo Ritme Teknologi.


## Teknologi

**Backend**
- PHP 8.x
- CodeIgniter 3.1.13
- MySQL
- JWT (custom HS256)

**Frontend**
- HTML, CSS
- Bootstrap 5
- jQuery + AJAX

**Tool**
- Laragon
- Postman

## Struktur Project

```
MiniHospital/
├── hospital-api/         Backend REST API (CodeIgniter 3)
├── hospital-web/         Frontend (HTML + Bootstrap + jQuery)
└── README.md
```

## Cara Install

1. Clone repository

```bash
git clone https://github.com/USERNAME/mini-hospital-system.git
```

2. Pindahkan folder `MiniHospital` ke `C:\laragon\www\` (atau folder web server Anda)
3. Buat database baru bernama `hospital_db` di phpMyAdmin
4. Import file SQL: `database/hospital_db.sql`
5. Edit `hospital-api/application/config/database.php`, sesuaikan kredensial database
6. Jalankan Laragon (Apache + MySQL)
7. Akses frontend: `http://localhost/MiniHospital/hospital-web/views/auth/login.html`

## Akun Default

| Role | Email | Password |
|------|-------|----------|
| Admin | admin2@hospital.com | admin123 |
| Dokter | budi.dokter@hospital.com | dokter123 |
| Pasien | budi@test.com | budi123 |

## Endpoint API

Base URL: `http://localhost/MiniHospital/hospital-api/index.php/api`

### Authentication
- `POST /auth/register` - Daftar pasien baru
- `POST /auth/login` - Login (semua role)
- `GET /auth/profile` - Profile user login

### Poli
- `GET /poli` - List semua poli
- `POST /poli` - Tambah poli (admin)
- `PUT /poli/{id}` - Update poli (admin)
- `DELETE /poli/{id}` - Hapus poli (admin)

### Doctors
- `GET /doctors` - List dokter (nested data)
- `POST /doctors` - Tambah dokter (admin)
- `PUT /doctors/{id}` - Update dokter (admin)
- `DELETE /doctors/{id}` - Hapus dokter (admin)

### Schedules
- `GET /schedules` - List jadwal (filter by `?dokter_id=X`)
- `POST /schedules` - Tambah jadwal (admin)
- `PUT /schedules/{id}` - Update jadwal (admin)
- `DELETE /schedules/{id}` - Hapus jadwal (admin)

### Queue
- `POST /queue/book` - Booking antrian (pasien)
- `GET /queue/today` - Antrian hari ini (role-based)
- `GET /queue/my` - Riwayat booking (pasien)
- `PUT /queue/{id}/status` - Update status

### Medical Records
- `POST /medical-records` - Input rekam medis (dokter)
- `GET /medical-records/patient/{id}` - Rekam medis pasien
- `GET /medical-records/my` - Rekam medis sendiri (pasien)
- `GET /medical-records/{id}` - Detail rekam medis

## Fitur

- JWT Authentication dengan multi-role (admin, dokter, pasien)
- CRUD lengkap untuk poli, dokter, jadwal, rekam medis
- Booking antrian dengan nomor otomatis per dokter per tanggal
- Realtime monitoring antrian (AJAX polling tiap 5 detik)
- Nested relational API response
- Validasi multi-layer (frontend + backend)
- Otorisasi berdasarkan role dan kepemilikan data
