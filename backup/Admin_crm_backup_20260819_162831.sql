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
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `module` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `code` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'Dashboard','access','crm:Dashboard','Access to Dashboard (crm portal)','ACTIVE'),(2,'Leads','access','crm:Leads','Access to Leads (crm portal)','ACTIVE'),(3,'Companies','access','crm:Companies','Access to Companies (crm portal)','ACTIVE'),(4,'Contacts','access','crm:Contacts','Access to Contacts (crm portal)','ACTIVE'),(5,'Opportunities','access','crm:Opportunities','Access to Opportunities (crm portal)','ACTIVE'),(8,'Activities','access','crm:Activities','Access to Activities (crm portal)','ACTIVE'),(9,'Follow-ups','access','crm:Follow-ups','Access to Follow-ups (crm portal)','ACTIVE'),(10,'Email','access','crm:Email','Access to Email (crm portal)','ACTIVE'),(11,'WhatsApp','access','crm:WhatsApp','Access to WhatsApp (crm portal)','ACTIVE'),(12,'Sales Reports','access','crm:Sales Reports','Access to Sales Reports (crm portal)','ACTIVE'),(13,'Company Master','access','masters:Company Master','Access to Company Master (masters portal)','ACTIVE'),(14,'Product Master','access','masters:Product Master','Access to Product Master (masters portal)','ACTIVE'),(15,'Industry Master','access','masters:Industry Master','Access to Industry Master (masters portal)','ACTIVE'),(16,'Lead Source','access','masters:Lead Source','Access to Lead Source (masters portal)','ACTIVE'),(17,'Campaign','access','masters:Campaign','Access to Campaign (masters portal)','ACTIVE'),(18,'Activity Type','access','masters:Activity Type','Access to Activity Type (masters portal)','ACTIVE'),(19,'Lead Status','access','masters:Lead Status','Access to Lead Status (masters portal)','ACTIVE'),(20,'Lead Temperature','access','masters:Lead Temperature','Access to Lead Temperature (masters portal)','ACTIVE'),(21,'Next Action','access','masters:Next Action','Access to Next Action (masters portal)','ACTIVE'),(22,'Priority','access','masters:Priority','Access to Priority (masters portal)','ACTIVE'),(23,'Country','access','masters:Country','Access to Country (masters portal)','ACTIVE'),(24,'State','access','masters:State','Access to State (masters portal)','ACTIVE'),(25,'City','access','masters:City','Access to City (masters portal)','ACTIVE'),(26,'Users','access','admin:Users','Access to Users (admin portal)','ACTIVE'),(27,'Roles','access','admin:Roles','Access to Roles (admin portal)','ACTIVE'),(28,'Permissions','access','admin:Permissions','Access to Permissions (admin portal)','ACTIVE'),(77,'Dashboard','access','masters:Dashboard','Access to Dashboard (masters portal)','ACTIVE'),(91,'Dashboard','access','admin:Dashboard','Access to Dashboard (admin portal)','ACTIVE');
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
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(2,1),(3,1),(1,2),(2,2),(3,2),(1,3),(2,3),(3,3),(1,4),(2,4),(3,4),(1,5),(2,5),(3,5),(1,8),(2,8),(3,8),(1,9),(2,9),(3,9),(1,10),(2,10),(3,10),(1,11),(2,11),(3,11),(1,12),(2,12),(3,12),(1,13),(2,13),(1,14),(2,14),(1,15),(2,15),(1,16),(2,16),(1,17),(2,17),(1,18),(2,18),(1,19),(2,19),(1,20),(2,20),(1,21),(2,21),(1,22),(2,22),(1,23),(2,23),(1,24),(2,24),(1,25),(2,25),(1,26),(2,26),(1,27),(2,27),(1,28),(2,28),(1,77),(2,77),(1,91),(2,91);
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
  `name` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `tenant_company_id` int(11) DEFAULT 7,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'CEO','CEO','Executive access with full visibility across all modules','ACTIVE','2026-08-17 07:33:40','2026-08-18 05:21:37',NULL,NULL,'{\"crm\": {\"Dashboard\": true, \"Companies\": true, \"Contacts\": true, \"Leads\": true, \"Opportunities\": true, \"Activities\": true, \"Follow-ups\": true, \"Email\": true, \"WhatsApp\": true, \"Sales Reports\": true}, \"masters\": {\"Dashboard\": true, \"Company\": true, \"Contact\": true, \"Product\": true, \"Industry\": true, \"Lead Source\": true, \"Campaign\": true, \"Activity Type\": true, \"Lead Status\": true, \"Lead Temperature\": true, \"Next Action\": true, \"Priority\": true, \"Country\": true, \"State\": true, \"City\": true}, \"admin\": {\"Dashboard\": true, \"Users\": true, \"Roles\": true, \"Permissions\": true}}',7),(2,'Manager','MGR','Manage team, leads, opportunities and approvals','ACTIVE','2026-08-17 07:33:40','2026-08-18 05:21:37',NULL,NULL,'{\"crm\": {\"Dashboard\": true, \"Companies\": true, \"Contacts\": true, \"Leads\": true, \"Opportunities\": true, \"Activities\": true, \"Follow-ups\": true, \"Email\": true, \"WhatsApp\": true, \"Sales Reports\": true}, \"masters\": {\"Dashboard\": true, \"Company\": true, \"Contact\": true, \"Product\": true, \"Industry\": true, \"Lead Source\": true, \"Campaign\": true, \"Activity Type\": true, \"Lead Status\": true, \"Lead Temperature\": true, \"Next Action\": true, \"Priority\": true, \"Country\": true, \"State\": true, \"City\": true}, \"admin\": {\"Dashboard\": true, \"Users\": true, \"Roles\": true, \"Permissions\": true}}',7),(3,'Marketing','MKT','Manage campaigns, lead sources and marketing data','ACTIVE','2026-08-17 07:33:40','2026-08-18 07:30:38',NULL,NULL,'{\"crm\": {\"Dashboard\": true, \"Companies\": true, \"Contacts\": true, \"Leads\": true, \"Opportunities\": true, \"Activities\": true, \"Follow-ups\": true, \"Sales Reports\": true, \"Email\": true, \"WhatsApp\": true}, \"masters\": {\"Dashboard\": false, \"Company\": false, \"Contact\": false, \"Product\": false, \"Industry\": false, \"Lead Source\": false, \"Campaign\": false, \"Activity Type\": false, \"Lead Status\": false, \"Next Action\": false, \"Priority\": false, \"Country\": false, \"State\": false, \"City\": false, \"Lead Temperature\": false}, \"admin\": {\"Dashboard\": false, \"Users\": false, \"Roles\": false, \"Permissions\": false}}',7);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `session_id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `employee_code` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','LOCKED') DEFAULT 'ACTIVE',
  `password_hash` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `tenant_company_id` int(11) DEFAULT 7,
  `password_plain` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_code` (`employee_code`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'EMP-3201','Kabilesh',' ','kabilesh','kabilesh@gmail.com','+918778853952','Marketing','Manager',1,'ACTIVE','$2b$12$x/ar4n.QmgVwCsgXGrc8XuztrH5QrsXX1AvZcPU/2Q8Q8C8569QXa',NULL,NULL,'2026-08-17 09:31:10','2026-08-19 09:49:02',1,NULL,7,'kabil@123'),(3,'EMP-5829','Ishwarya',' ','ish','ish@gmail.com','+917667899655','Marketing','Marketing Person',3,'ACTIVE','$2b$12$9AJz1ieSEvDSnr1AQPCthefX8W3ZB3Q4OZ0CSn7iHblo0JPK3Pl5S',NULL,NULL,'2026-08-17 10:47:56','2026-08-17 10:47:56',1,NULL,7,NULL),(4,'EMP-ADMIN','Administrator',' ','admin','admin@techspire.in','','Management','System Administrator',1,'ACTIVE','$2b$12$GXD6XiJAp6zykuMoLp4GPO6g9kJs9Bj/v47vLM7p.7w9QqeNOgvTC',NULL,NULL,'2026-08-17 11:28:20','2026-08-17 11:28:20',1,NULL,7,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'Admin_crm'
--

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

-- Dump completed on 2026-08-19 16:28:32
