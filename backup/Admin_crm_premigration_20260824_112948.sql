-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: 100.86.181.18    Database: Admin_crm
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `Admin_crm`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `Admin_crm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;

USE `Admin_crm`;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `industry_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `founder` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_mobile` varchar(20) DEFAULT NULL,
  `contact_designation` varchar(50) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `max_users` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `industry_id` (`industry_id`),
  KEY `type_id` (`type_id`),
  KEY `city_id` (`city_id`),
  KEY `state_id` (`state_id`),
  KEY `country_id` (`country_id`),
  CONSTRAINT `1` FOREIGN KEY (`industry_id`) REFERENCES `Masters_crm`.`industries` (`id`) ON DELETE SET NULL,
  CONSTRAINT `2` FOREIGN KEY (`type_id`) REFERENCES `Masters_crm`.`company_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`city_id`) REFERENCES `Masters_crm`.`cities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `4` FOREIGN KEY (`state_id`) REFERENCES `Masters_crm`.`states` (`id`) ON DELETE SET NULL,
  CONSTRAINT `5` FOREIGN KEY (`country_id`) REFERENCES `Masters_crm`.`countries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Techspire Solutions',1,1,'Uma','Sitra',2,1,1,'no','Admin','admin@techspire.com','55667899','Sales Executive','/uploads/logos/447ed105-6be2-4566-a962-ec34f7135982.jpeg','Active',1,'2026-08-20 06:10:15','2026-08-24 05:36:56',NULL,2),(6,'Softcore Tech',2,1,'Uma N','Senthil residency',2,1,1,'no','Kabilesh','kabilesh@gmail.com','07667899655','Developer','/uploads/logos/011a5b1e-2f2a-4623-a128-d52d5a03e9ed.jpg','Active',1,'2026-08-20 10:26:19','2026-08-20 10:40:11',NULL,2);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `portal` varchar(50) NOT NULL,
  `screen` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'crm','Dashboard',NULL,1,'2026-08-24 05:14:04'),(2,'crm','Companies','Access to Companies in crm',1,'2026-08-24 05:14:15'),(3,'crm','Contacts','Access to Contacts in crm',1,'2026-08-24 05:14:15'),(4,'crm','Products','Access to Products in crm',1,'2026-08-24 05:14:15'),(5,'crm','Leads','Access to Leads in crm',1,'2026-08-24 05:14:15'),(6,'crm','Opportunities','Access to Opportunities in crm',1,'2026-08-24 05:14:15'),(7,'crm','Activities','Access to Activities in crm',1,'2026-08-24 05:14:15'),(8,'crm','Follow-ups','Access to Follow-ups in crm',1,'2026-08-24 05:14:15'),(9,'crm','Sales Reports','Access to Sales Reports in crm',1,'2026-08-24 05:14:15'),(10,'masters','Dashboard','Access to Dashboard in masters',1,'2026-08-24 05:14:15'),(11,'masters','Company','Access to Company in masters',1,'2026-08-24 05:14:15'),(12,'masters','Industry','Access to Industry in masters',1,'2026-08-24 05:14:15'),(13,'masters','Lead Source','Access to Lead Source in masters',1,'2026-08-24 05:14:16'),(14,'masters','Campaign','Access to Campaign in masters',1,'2026-08-24 05:14:16'),(15,'masters','Activity Type','Access to Activity Type in masters',1,'2026-08-24 05:14:16'),(16,'masters','Lead Status','Access to Lead Status in masters',1,'2026-08-24 05:14:16'),(17,'masters','Next Action','Access to Next Action in masters',1,'2026-08-24 05:14:16'),(18,'masters','Priority','Access to Priority in masters',1,'2026-08-24 05:14:16'),(19,'masters','Country','Access to Country in masters',1,'2026-08-24 05:14:16'),(20,'masters','State','Access to State in masters',1,'2026-08-24 05:14:16'),(21,'masters','City','Access to City in masters',1,'2026-08-24 05:14:16'),(22,'admin','Dashboard','Access to Dashboard in admin',1,'2026-08-24 05:14:16'),(23,'admin','Users','Access to Users in admin',1,'2026-08-24 05:14:16'),(24,'admin','Roles','Access to Roles in admin',1,'2026-08-24 05:14:16'),(25,'admin','Permissions','Access to Permissions in admin',1,'2026-08-24 05:14:16'),(26,'masters','Product Category','Access to Product Category in masters',1,'2026-08-24 05:24:55'),(27,'masters','Company Type','Access to Company Type in masters',1,'2026-08-24 05:24:55'),(28,'admin','Companies','Access to Companies in admin',1,'2026-08-24 05:24:55');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (3,1),(5,1),(3,2),(5,2),(3,3),(5,3),(3,4),(5,4),(3,5),(5,5),(3,6),(5,6),(3,7),(5,7),(3,8),(5,8),(3,9),(5,9),(3,10),(3,12),(3,13),(3,14),(3,15),(3,16),(3,17),(3,18),(3,19),(3,20),(3,21),(3,22),(3,23),(3,24),(3,25),(3,26),(3,27),(3,28);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'CEO','Executive access','#7c3aed',1,'2026-08-24 05:14:15','2026-08-24 05:14:15'),(5,'Sales Executive','Manage own leads','#2563eb',1,'2026-08-24 05:14:15','2026-08-24 05:14:15');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tenant_company_id` int(11) DEFAULT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `revoked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`tenant_company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `color` varchar(20) DEFAULT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `signature_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  CONSTRAINT `1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `2` FOREIGN KEY (`tenant_company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,1,'Techspire Admin','Admin','',NULL,'admin','admin@techspire.com','','$2b$12$Uarn0N3RxgQPAbk2iU8pre3ul6dsGtYClZ6MWGSKT/Lsepx4znTgy',3,'ACTIVE',NULL,'/uploads/profiles/954f5f6b-e5d5-452b-bb2d-b68de64ef2eb.jpg',NULL,1,'2026-08-20 07:52:40','2026-08-24 05:41:27',NULL),(4,1,'Kabilesh','Sales','Sales Executive',NULL,'kabilesh','kabilesh@gmail.com','55768935277','$2b$12$y.2I3ERJ8VuFhFvobqNltODpxXyoVWDvlVkiegpr7SDfqmBSmEBz.',5,'ACTIVE',NULL,NULL,NULL,1,'2026-08-20 10:00:56','2026-08-20 10:11:59',NULL),(5,6,'Sachin','Sales','Sales Executive ',NULL,'sachin','sachin@gmail.com','07667899655','$2b$12$EMQBymJIH.lWF4mfVytN.ei35yaO8uvpBN12GmD.OMpDAlP96thXW',5,'Active',NULL,NULL,NULL,1,'2026-08-20 10:34:09','2026-08-20 10:34:09',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'Admin_crm'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 12.2.2-MariaDB-ubu2404.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-24 11:29:49
