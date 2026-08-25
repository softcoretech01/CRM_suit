-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: 100.86.181.18    Database: CRM
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
-- Current Database: `crm`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `crm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;

USE `crm`;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `opportunity_id` int(11) DEFAULT NULL,
  `activity_type` varchar(50) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `activity_datetime` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `outcome` varchar(50) DEFAULT NULL,
  `next_action` varchar(50) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  KEY `company_id` (`company_id`),
  KEY `contact_id` (`contact_id`),
  KEY `lead_id` (`lead_id`),
  KEY `opportunity_id` (`opportunity_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `1` FOREIGN KEY (`tenant_company_id`) REFERENCES `admin_crm`.`companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`company_id`) REFERENCES `crm_companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `3` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `4` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `5` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `6` FOREIGN KEY (`assigned_to`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `7` FOREIGN KEY (`created_by`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  KEY `company_id` (`company_id`),
  KEY `created_by` (`created_by`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `1` FOREIGN KEY (`tenant_company_id`) REFERENCES `admin_crm`.`companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`company_id`) REFERENCES `crm_companies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`created_by`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `4` FOREIGN KEY (`assigned_to`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,6,1,'Kabilesh',NULL,'kabilesh@gmail.com',NULL,'Developer','Active',NULL,NULL,NULL,'2026-08-20 10:52:49','2026-08-20 10:52:49');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_companies`
--

DROP TABLE IF EXISTS `crm_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_by` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  KEY `created_by` (`created_by`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `1` FOREIGN KEY (`tenant_company_id`) REFERENCES `admin_crm`.`companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`created_by`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`assigned_to`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_companies`
--

LOCK TABLES `crm_companies` WRITE;
/*!40000 ALTER TABLE `crm_companies` DISABLE KEYS */;
INSERT INTO `crm_companies` VALUES (1,6,'SVP','Real Estate','Private Limited','Coimbatore','Tamil Nadu','India','Senthil residency','no','Active',NULL,NULL,'2026-08-20 10:44:26','2026-08-20 10:51:54');
/*!40000 ALTER TABLE `crm_companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `followups`
--

DROP TABLE IF EXISTS `followups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `followups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `opportunity_id` int(11) DEFAULT NULL,
  `followup_date` datetime DEFAULT NULL,
  `followup_type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  KEY `lead_id` (`lead_id`),
  KEY `contact_id` (`contact_id`),
  KEY `opportunity_id` (`opportunity_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `1` FOREIGN KEY (`tenant_company_id`) REFERENCES `admin_crm`.`companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `3` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `4` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `5` FOREIGN KEY (`assigned_to`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `6` FOREIGN KEY (`created_by`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `followups`
--

LOCK TABLES `followups` WRITE;
/*!40000 ALTER TABLE `followups` DISABLE KEYS */;
/*!40000 ALTER TABLE `followups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `lead_name` varchar(150) DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'New',
  `priority` varchar(50) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `value` decimal(15,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  KEY `company_id` (`company_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `1` FOREIGN KEY (`tenant_company_id`) REFERENCES `admin_crm`.`companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`company_id`) REFERENCES `crm_companies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`assigned_to`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `4` FOREIGN KEY (`created_by`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opportunities`
--

DROP TABLE IF EXISTS `opportunities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opportunities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `value` decimal(15,2) DEFAULT NULL,
  `stage` varchar(50) DEFAULT NULL,
  `probability` int(11) DEFAULT NULL,
  `expected_close_date` date DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  KEY `company_id` (`company_id`),
  KEY `lead_id` (`lead_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `1` FOREIGN KEY (`tenant_company_id`) REFERENCES `admin_crm`.`companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`company_id`) REFERENCES `crm_companies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
  CONSTRAINT `4` FOREIGN KEY (`assigned_to`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `5` FOREIGN KEY (`created_by`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opportunities`
--

LOCK TABLES `opportunities` WRITE;
/*!40000 ALTER TABLE `opportunities` DISABLE KEYS */;
/*!40000 ALTER TABLE `opportunities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_company_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `sku_code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `unit_price` decimal(15,2) DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_company_id` (`tenant_company_id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `1` FOREIGN KEY (`tenant_company_id`) REFERENCES `admin_crm`.`companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`category_id`) REFERENCES `masters_crm`.`product_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`created_by`) REFERENCES `admin_crm`.`users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'CRM'
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

-- Dump completed on 2026-08-24 11:29:51
