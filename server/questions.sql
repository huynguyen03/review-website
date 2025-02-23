-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 10, 2025 lúc 04:06 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `reviewwebsitedb`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `questions`
--

CREATE TABLE `questions` (
  `question_id` int(11) NOT NULL,
  `question_title` varchar(255) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `answer_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answer_options`)),
  `correct_answer_index` int(11) DEFAULT NULL,
  `difficulty_level` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `question_type` enum('multiple_choice','fill_in_the_blank','essay','matching') DEFAULT 'multiple_choice',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `questions`
--

INSERT INTO `questions` (`question_id`, `question_title`, `teacher_id`, `question_text`, `answer_options`, `correct_answer_index`, `difficulty_level`, `category_id`, `status`, `question_type`, `created_at`, `updated_at`) VALUES
(42, 'Thủ đô của Việt Nam là gì?', 1, 'Thủ đô của Việt Nam là gì?', '[\"H\\u00e0 N\\u1ed9i\",\"H\\u1ed3 Ch\\u00ed Minh\",\"\\u0110\\u00e0 N\\u1eb5ng\",\"H\\u1ea3i Ph\\u00f2ng\"]', 0, 2, 2, 'draft', 'multiple_choice', '2025-02-04 14:54:28', '2025-02-04 14:54:28'),
(43, '2 + 2 bằng mấy?', 1, '2 + 2 bằng mấy?', '[\"3\",\"4\",\"5\",\"6\"]', 0, 1, 2, 'draft', 'multiple_choice', '2025-02-04 14:54:28', '2025-02-04 14:54:28'),
(44, 'Động vật lớn nhất trên cạn là gì?', 1, 'Động vật lớn nhất trên cạn là gì?', '[\"Voi\",\"H\\u1ed5\",\"B\\u00e1o\",\"H\\u00e0 m\\u00e3\"]', 0, 3, 2, 'draft', 'multiple_choice', '2025-02-04 14:54:28', '2025-02-04 14:54:28'),
(45, 'Điền vào chỗ trống: \"___ là hành tinh l?', 1, 'Điền vào chỗ trống: \"___ là hành tinh lớn nhất trong hệ Mặt Trời.\"', '[\"Tr\\u00e1i \\u0110\\u1ea5t\",\"Sao Th\\u1ed5\",\"Sao M\\u1ed9c\",\"Sao H\\u1ecfa\"]', 0, 2, 2, 'draft', 'multiple_choice', '2025-02-04 14:54:28', '2025-02-04 14:54:28');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`question_id`),
  ADD KEY `teacher_id_2` (`teacher_id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_difficulty_level` (`difficulty_level`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `questions`
--
ALTER TABLE `questions`
  MODIFY `question_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
