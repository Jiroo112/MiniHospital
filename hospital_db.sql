-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 13, 2026 at 02:39 PM
-- Server version: 8.4.3
-- PHP Version: 8.1.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hospital_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `poli_id` int NOT NULL,
  `spesialis` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `user_id`, `poli_id`, `spesialis`, `no_hp`) VALUES
(1, 3, 1, 'Penyakit Dalam & Endokrin', '081212913189'),
(2, 4, 3, 'Anak', '081345678901');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int NOT NULL,
  `pasien_id` int NOT NULL,
  `dokter_id` int NOT NULL,
  `diagnosa` varchar(255) DEFAULT NULL,
  `tindakan` varchar(255) DEFAULT NULL,
  `resep` varchar(255) DEFAULT NULL,
  `catatan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `pasien_id`, `dokter_id`, `diagnosa`, `tindakan`, `resep`, `catatan`, `created_at`) VALUES
(1, 1, 1, 'Hipertensi ringan', 'Pemeriksaan tekanan darah dan EKG', 'Amlodipine 5mg 1x sehari', 'Pasien diminta kontrol kembali 2 minggu lagi', '2026-05-12 08:43:20'),
(2, 1, 1, 'Serangan Jantung', 'Operasi', 'antibiotik', 'kurangi rokok', '2026-05-13 14:18:19');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `user_id`, `alamat`, `tanggal_lahir`) VALUES
(1, 1, 'Jl. Mawar No. 5, Jember', '1995-08-17'),
(3, 5, 'Jl. Mawar No. 5, Jember', '1995-08-17'),
(4, 6, NULL, '2000-01-13');

-- --------------------------------------------------------

--
-- Table structure for table `poli`
--

CREATE TABLE `poli` (
  `id` int NOT NULL,
  `nama_poli` varchar(100) NOT NULL,
  `lokasi` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `poli`
--

INSERT INTO `poli` (`id`, `nama_poli`, `lokasi`) VALUES
(1, 'Poli Gigi', 'Lantai 2 Gedung B (Pindah)'),
(3, 'Poli Wajah', 'Lantai 3 Gedung B');

-- --------------------------------------------------------

--
-- Table structure for table `queues`
--

CREATE TABLE `queues` (
  `id` int NOT NULL,
  `pasien_id` int NOT NULL,
  `dokter_id` int NOT NULL,
  `tanggal` date NOT NULL,
  `nomor_antrian` int NOT NULL,
  `status` enum('menunggu','selesai','batal') DEFAULT 'menunggu',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `queues`
--

INSERT INTO `queues` (`id`, `pasien_id`, `dokter_id`, `tanggal`, `nomor_antrian`, `status`, `created_at`) VALUES
(1, 1, 1, '2026-05-13', 1, 'selesai', '2026-05-12 08:19:07'),
(2, 3, 1, '2026-05-13', 2, 'selesai', '2026-05-12 08:21:47'),
(3, 3, 1, '2026-05-12', 1, 'batal', '2026-05-12 08:26:26'),
(4, 1, 1, '2026-05-13', 3, 'selesai', '2026-05-13 14:16:18'),
(5, 1, 1, '2026-05-13', 4, 'batal', '2026-05-13 14:21:59');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int NOT NULL,
  `dokter_id` int NOT NULL,
  `hari` varchar(10) NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `dokter_id`, `hari`, `jam_mulai`, `jam_selesai`) VALUES
(1, 1, 'Senin', '08:00:00', '12:00:00'),
(2, 1, 'Rabu', '13:00:00', '17:00:00'),
(3, 2, 'Selasa', '08:00:00', '11:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','dokter','pasien') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Budi Santoso', 'budi@test.com', '$2y$10$DPQPuaSyLgtjta3fQEBUfOVgkj9kyZ3D/Ppz2jxQIDqLQwC9TeEDC', 'pasien', '2026-05-12 05:54:17'),
(2, 'Admin Klinik', 'admin2@hospital.com', '$2y$10$HEzo/833wZ/fmyQ3wiIgbuRdui1OzwnQ31ae.9g1iDBno.3OB1bzC', 'admin', '2026-05-12 05:58:47'),
(3, 'Dr. Budi Setiawan', 'budi.dokter@hospital.com', '$2y$10$g136Ft1yAJfQ91CfKAK/h.T/as2LXYYsilEqvCgpt.Bd5EXRAocIG', 'dokter', '2026-05-12 07:11:30'),
(4, 'Dr. Siti Aminah', 'siti.dokter@hospital.com', '$2y$10$i8kXp92KoyOsgue4X0ngJ.PlMNn7A6ukG6LuGEAliXTO7W2Fe2F2O', 'dokter', '2026-05-12 07:18:50'),
(5, 'Budi Santoso', 'budo@test.com', '$2y$10$dP8vqnlco1kF8J4HinLaR.YhEhkcat7Ijgfh0fKDaWrfXM3SWN5Oi', 'pasien', '2026-05-12 08:20:51'),
(6, 'Ines Soraya', 'Inesukasoto@gmail.com', '$2y$10$Tb/IODqmHHxei9v0BlaqI.tbF47.w9UQUZJXi7DSpsxv5VTLlOGva', 'pasien', '2026-05-13 01:11:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `poli_id` (`poli_id`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pasien_id` (`pasien_id`),
  ADD KEY `dokter_id` (`dokter_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `poli`
--
ALTER TABLE `poli`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `queues`
--
ALTER TABLE `queues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pasien_id` (`pasien_id`),
  ADD KEY `dokter_id` (`dokter_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dokter_id` (`dokter_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `poli`
--
ALTER TABLE `poli`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `queues`
--
ALTER TABLE `queues`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctors_ibfk_2` FOREIGN KEY (`poli_id`) REFERENCES `poli` (`id`);

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`pasien_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `medical_records_ibfk_2` FOREIGN KEY (`dokter_id`) REFERENCES `doctors` (`id`);

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `queues`
--
ALTER TABLE `queues`
  ADD CONSTRAINT `queues_ibfk_1` FOREIGN KEY (`pasien_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `queues_ibfk_2` FOREIGN KEY (`dokter_id`) REFERENCES `doctors` (`id`);

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`dokter_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
