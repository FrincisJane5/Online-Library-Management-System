-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: olms
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_role` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,NULL,'Settings','Library settings were updated','Frincis Jane','admin','2026-05-21 06:02:28','2026-05-21 06:02:28'),(2,NULL,'Settings','Library settings were updated','Frincis Jane','admin','2026-05-21 06:02:34','2026-05-21 06:02:34');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned DEFAULT NULL,
  `id_number` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendances_student_id_foreign` (`student_id`),
  CONSTRAINT `attendances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `books` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `call_number` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `pages` int(11) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `year` year(4) DEFAULT NULL,
  `remarks` date DEFAULT NULL,
  `total` int(11) NOT NULL DEFAULT 1,
  `available` int(11) NOT NULL DEFAULT 1,
  `borrowed` int(11) NOT NULL DEFAULT 0,
  `damaged` int(11) NOT NULL DEFAULT 0,
  `lost` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (1,'7559','Licensure Examination for Criminologist','Miller F. Peekley',182,NULL,'Wiseman Trading',2018,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(2,'7560','Licensure Examination for Criminologist','Miller F. Peekley',182,NULL,'Wiseman Trading',2018,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(3,'7561','Comprehensive Reviewer for Criminology Board Examination','Leonardo A. Buchia',95,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(4,'7562','Comprehensive Reviewer for Criminology Board Examination','Leonardo A. Buchia',95,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(5,'7563','Comprehensive Reviewer for Criminology Board Examination','Leonardo A. Buchia',95,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(6,'7564','Comprehensive Reviewer for Criminology Board Examination','Leonardo A. Buchia',95,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(7,'7565','Comprehensive Reviewer for Criminology Board Examination','Leonardo A. Buchia',95,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(8,'7566','Theories of Crime Causation','Gladys J. Domingo, DPA, PhD',72,NULL,'Wiseman Trading',2020,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(9,'7567','Theories of Crime Causation','Gladys J. Domingo, DPA, PhD',72,NULL,'Wiseman Trading',2020,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(10,'7568','Theories of Crime Causation','Gladys J. Domingo, DPA, PhD',72,NULL,'Wiseman Trading',2020,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(11,'7569','Theories of Crime Causation','Gladys J. Domingo, DPA, PhD',72,NULL,'Wiseman Trading',2020,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(12,'7570','Theories of Crime Causation','Gladys J. Domingo, DPA, PhD',72,NULL,'Wiseman Trading',2020,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(13,'7571','Technical English: Crime Detection & Investigation','Mercedes A. Foronda (Ret.) DAN',58,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(14,'7572','Technical English: Crime Detection & Investigation','Mercedes A. Foronda (Ret.) DAN',58,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(15,'7573','Technical English: Crime Detection & Investigation','Mercedes A. Foronda (Ret.) DAN',58,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(16,'7574','Technical English: Crime Detection & Investigation','Mercedes A. Foronda (Ret.) DAN',58,NULL,'Wiseman Trading',2021,'0005-12-20',1,1,0,0,0,'Available',NULL,NULL),(17,'7575','Technical English: Crime Detection & Investigation','Mercedes A. Foronda (Ret.) DAN',58,NULL,'Wiseman Trading',2021,'0005-08-20',1,1,0,0,0,'Available',NULL,NULL),(18,'7576','Understanding the Self','Eden Joy Pastor Alata',174,NULL,'Rex Book Store',2018,'0001-07-20',1,1,0,0,0,'Available',NULL,NULL),(19,'7577','The Teacher and the School Curriculum','Greg Tabios Pawilen',152,NULL,'Rex Book Store',2019,'0001-07-24',1,1,0,0,0,'Available',NULL,NULL),(20,'7578','Building and Enhancing New Literacies','Ellen Joy P. Alata, M.A.Ed.',120,NULL,'Rex Book Store',2019,'0001-07-24',1,1,0,0,0,'Available',NULL,NULL),(21,'7579','Facilitating Learner-Centered Teaching','Ferdinand Bulusan',151,NULL,'Rex Book Store',2019,'0001-07-24',1,1,0,0,0,'Available',NULL,NULL),(22,'7580','Teaching Profession','Greg Tabios Pawilen',147,NULL,'Rex Book Store',2019,'0005-07-26',1,1,0,0,0,'Available',NULL,NULL),(23,'7581','Art Appreciation','Albed Napoleon Pawilen',180,NULL,'Rex Book Store',2019,'0005-01-26',1,1,0,0,0,'Available',NULL,NULL),(24,'7582','Strategic Management','Dr. Danilo P. Jacinto, Jr.',200,NULL,'Unlimited Books Lib. Services & Publishing',2019,'0005-05-26',1,1,0,0,0,'Available',NULL,NULL),(25,'7583','Strategic Management','Dr. Danilo P. Jacinto, Jr.',200,NULL,'Unlimited Books Lib. Services & Publishing',2019,'0005-05-26',1,1,0,0,0,'Available',NULL,NULL),(26,'7584','Research-Based Teaching and Learning','Rosita L. Navarro, Ph.D.',94,NULL,'Lorimar Publishing',2011,'0001-06-26',1,1,0,0,0,'Available',NULL,NULL),(27,'7585','Research-Based Teaching and Learning','Rosita L. Navarro, Ph.D.',94,NULL,'Lorimar Publishing',2011,'0005-06-26',1,1,0,0,0,'Available',NULL,NULL),(28,'7586','National Dev. via NSTP (RA 9163)','Sonia Gasilla-De la Cruz',284,NULL,'Books Atbp. Publishing',2014,'0005-07-26',1,1,0,0,0,'Available',NULL,NULL),(29,'7587','National Dev. via NSTP (RA 9163)','Sonia Gasilla-De la Cruz',284,NULL,'Books Atbp. Publishing',2014,'0005-06-26',1,1,0,0,0,'Available',NULL,NULL),(30,'7588','Essay Linguistics','Rosalyn B. Pantonig, Ph.D.',89,NULL,'Mindshapers Co., Inc.',2016,'0001-07-26',1,1,0,0,0,'Available',NULL,NULL),(31,'7589','Essay Linguistics','Rosalyn B. Pantonig, Ph.D.',89,NULL,'Mindshapers Co., Inc.',2016,'0005-07-26',1,1,0,0,0,'Available',NULL,NULL),(32,'7590','Advance Grammar & Composition Module','Romel M. Aceron',62,NULL,'G&T',2015,'0001-07-26',1,1,0,0,0,'Available',NULL,NULL),(33,'7591','Advance Grammar & Composition Module','Romel M. Aceron',62,NULL,'G&T',2015,'0001-07-26',1,1,0,0,0,'Available',NULL,NULL);
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrowing_records`
--

DROP TABLE IF EXISTS `borrowing_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrowing_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `book_id` bigint(20) unsigned DEFAULT NULL,
  `student_id` bigint(20) unsigned DEFAULT NULL,
  `student_name` varchar(255) NOT NULL,
  `id_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  `academic_year` varchar(255) DEFAULT NULL,
  `semester` varchar(255) DEFAULT NULL,
  `book_title` varchar(255) NOT NULL,
  `call_number` varchar(255) DEFAULT NULL,
  `borrow_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'borrowed',
  `action` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `fine_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fine_status` varchar(255) NOT NULL DEFAULT 'unpaid',
  `last_notification_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `borrowing_records_book_id_foreign` (`book_id`),
  KEY `borrowing_records_student_id_foreign` (`student_id`),
  CONSTRAINT `borrowing_records_book_id_foreign` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE SET NULL,
  CONSTRAINT `borrowing_records_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrowing_records`
--

LOCK TABLES `borrowing_records` WRITE;
/*!40000 ALTER TABLE `borrowing_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrowing_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrows`
--

DROP TABLE IF EXISTS `borrows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrows` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id_number` varchar(255) DEFAULT NULL,
  `book_call_number` varchar(255) DEFAULT NULL,
  `borrow_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'borrowed',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrows`
--

LOCK TABLES `borrows` WRITE;
/*!40000 ALTER TABLE `borrows` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_settings`
--

DROP TABLE IF EXISTS `library_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `loan_duration` int(10) unsigned NOT NULL DEFAULT 7,
  `fine_rate` decimal(10,2) NOT NULL DEFAULT 5.00,
  `damaged_fine` decimal(10,2) NOT NULL DEFAULT 100.00,
  `lost_fine` decimal(10,2) NOT NULL DEFAULT 500.00,
  `open_time` varchar(255) NOT NULL DEFAULT '08:00',
  `close_time` varchar(255) NOT NULL DEFAULT '17:00',
  `email_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `sms_notifications` tinyint(1) NOT NULL DEFAULT 0,
  `library_policies` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_settings`
--

LOCK TABLES `library_settings` WRITE;
/*!40000 ALTER TABLE `library_settings` DISABLE KEYS */;
INSERT INTO `library_settings` VALUES (1,7,5.00,100.00,500.00,'08:00','23:00',1,0,NULL,'2026-05-21 05:54:48','2026-05-21 06:02:34'),(2,7,5.00,100.00,500.00,'08:00','17:00',1,0,'','2026-05-21 06:10:45','2026-05-21 06:10:45');
/*!40000 ALTER TABLE `library_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_04_02_155046_create_activity_logs_table',1),(5,'2026_04_04_124459_create_attendances_table',1),(6,'2026_04_04_124956_create_students_table',1),(7,'2026_04_04_124958_create_books_table',1),(8,'2026_04_04_125000_create_borrows_table',1),(9,'2026_04_12_144513_create_personal_access_tokens_table',1),(10,'2026_04_23_170000_add_library_fields_to_users_table',1),(11,'2026_04_24_120000_add_id_number_to_attendances_table',1),(12,'2026_04_24_120100_create_borrowing_records_table',1),(13,'2026_04_24_120200_create_library_settings_table',1),(14,'2026_04_25_023202_create_programs_tables',1),(15,'2026_05_06_120000_add_student_id_to_attendances_table',1),(16,'2026_05_06_210000_add_user_fields_to_activity_logs',1),(17,'2026_05_07_090000_add_missing_columns_to_borrowing_records',1),(18,'2026_05_07_200000_drop_call_number_category_from_books',1),(19,'2026_05_09_140307_add_last_login_to_users_table',1),(20,'2026_05_09_220000_add_inventory_fields_to_books_table',1),(21,'2026_05_10_160000_add_course_year_to_borrowing_records',1),(22,'2026_05_10_170000_make_id_number_nullable_in_borrowing_records',1),(23,'2026_05_10_180000_change_user_status_deactivated_to_inactive',1),(24,'2026_05_10_182000_create_notification_logs_table',1),(25,'2026_05_10_190000_add_damaged_lost_fine_to_library_settings',1),(26,'2026_05_10_210000_add_book_id_to_borrowing_records',1),(27,'2026_05_10_212000_add_foreign_keys_to_system_tables',1),(28,'2026_05_10_220000_add_total_years_to_programs_and_fk_to_students',1),(29,'2026_05_16_100000_add_academic_year_semester_to_borrowing_records',1),(30,'2026_05_20_150000_add_description_to_borrowing_records',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `borrowing_record_id` bigint(20) unsigned DEFAULT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_email` varchar(255) DEFAULT NULL,
  `call_number` varchar(255) DEFAULT NULL,
  `book_title` varchar(255) NOT NULL,
  `type` enum('Overdue','Fine Reminder','Damaged','Lost') NOT NULL,
  `message` text NOT NULL,
  `status` enum('Sent','Pending','Failed') NOT NULL DEFAULT 'Pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_logs_borrowing_record_id_foreign` (`borrowing_record_id`),
  CONSTRAINT `notification_logs_borrowing_record_id_foreign` FOREIGN KEY (`borrowing_record_id`) REFERENCES `borrowing_records` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_years` tinyint(3) unsigned NOT NULL DEFAULT 4,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,'BSIT','Bachelor of Science in Information Technology',4,'2026-05-21 05:53:42','2026-05-21 05:53:42'),(2,'BSBA','Bachelor of Science in Business Administration',4,'2026-05-21 05:53:42','2026-05-21 05:53:42'),(3,'BSED','Bachelor of Secondary Education',4,'2026-05-21 05:53:42','2026-05-21 05:53:42'),(4,'BSCRIM','Bachelor of Science in Criminology',4,'2026-05-21 05:53:42','2026-05-21 05:53:42');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `program_id` bigint(20) unsigned DEFAULT NULL,
  `student_id_number` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `year_level` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_student_id_number_unique` (`student_id_number`),
  UNIQUE KEY `students_email_unique` (`email`),
  KEY `students_program_id_foreign` (`program_id`),
  CONSTRAINT `students_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Library Admin','Library Admin','admin','admin@local.library',NULL,'$2y$12$wh/X.mJqnnsuC9.PnPd4Au9K5sRure6rt0BrWGjpiiXcFaRJd8a.2','admin','Active','2026-05-21 06:14:28',NULL,'2026-05-21 06:10:25','2026-05-21 06:17:31'),(2,'Library Staff','Library Staff','staff','staff@local.library',NULL,'$2y$12$bP0w2P24VaYQGW0KkXjkleC250qakI2NYQfY5LnHU2W2iAUJahlA6','staff','Active',NULL,NULL,'2026-05-21 06:10:26','2026-05-21 06:17:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21 22:19:42
