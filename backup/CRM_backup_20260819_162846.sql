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
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `opportunity_id` int(11) DEFAULT NULL,
  `type` enum('Call','Meeting','Visit','Note','Demo','Other') NOT NULL,
  `subject` varchar(200) NOT NULL,
  `activity_date` datetime NOT NULL,
  `outcome` text DEFAULT NULL,
  `next_action` varchar(200) DEFAULT NULL,
  `conducted_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tenant_company_id` int(11) DEFAULT 7,
  PRIMARY KEY (`id`),
  KEY `lead_id` (`lead_id`),
  KEY `opportunity_id` (`opportunity_id`),
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approvals`
--

DROP TABLE IF EXISTS `approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `opportunity_id` int(11) NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `tenant_company_id` int(11) DEFAULT 7,
  PRIMARY KEY (`id`),
  KEY `opportunity_id` (`opportunity_id`),
  CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `approvals` ENABLE KEYS */;
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
  `crm_company_id` int(11) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_company_id`),
  KEY `idx_company` (`crm_company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,7,7,'CON-001','Mani .M',NULL,'Developer','IT','kabilesh@gmail.com','08778853952','ACTIVE','2026-08-18 07:14:17','2026-08-18 09:25:04');
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
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `founder` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_companies`
--

LOCK TABLES `crm_companies` WRITE;
/*!40000 ALTER TABLE `crm_companies` DISABLE KEYS */;
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
  `company_id` int(11) DEFAULT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `opportunity_id` int(11) DEFAULT NULL,
  `due_date` date NOT NULL,
  `due_time` time DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `status` enum('Pending','Completed','Cancelled') DEFAULT 'Pending',
  `outcome` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `tenant_company_id` int(11) DEFAULT 7,
  PRIMARY KEY (`id`),
  KEY `lead_id` (`lead_id`),
  KEY `opportunity_id` (`opportunity_id`),
  CONSTRAINT `followups_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `followups_ibfk_2` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `followups`
--

LOCK TABLES `followups` WRITE;
/*!40000 ALTER TABLE `followups` DISABLE KEYS */;
/*!40000 ALTER TABLE `followups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_products`
--

DROP TABLE IF EXISTS `lead_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_products` (
  `lead_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  PRIMARY KEY (`lead_id`,`product_name`),
  CONSTRAINT `lead_products_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_products`
--

LOCK TABLES `lead_products` WRITE;
/*!40000 ALTER TABLE `lead_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `company_id` int(11) NOT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `status` enum('New','Qualified','Confirmed','Converted','Lost') DEFAULT 'New',
  `score` int(11) DEFAULT 0,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `source` varchar(100) DEFAULT NULL,
  `value` decimal(15,2) DEFAULT 0.00,
  `budget` decimal(15,2) DEFAULT 0.00,
  `requirement` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `tenant_company_id` int(11) DEFAULT 7,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES (3,'LEAD-000134','2026-08-18',7,NULL,3,'Qualified',45,'Medium','BNI',12000000.00,1200000.00,'','2026-08-18 09:09:54','2026-08-18 09:11:53',3,3,7);
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
  `number` varchar(50) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `value` decimal(15,2) DEFAULT 0.00,
  `probability` int(11) DEFAULT 0,
  `expected_close` date DEFAULT NULL,
  `status` enum('Requirement','Demo','Approval','Won','Lost') DEFAULT 'Requirement',
  `req_description` text DEFAULT NULL,
  `req_product` varchar(100) DEFAULT NULL,
  `req_quantity` int(11) DEFAULT NULL,
  `req_value` decimal(15,2) DEFAULT NULL,
  `req_notes` text DEFAULT NULL,
  `req_date` date DEFAULT NULL,
  `req_priority` varchar(50) DEFAULT NULL,
  `demo_step` int(11) DEFAULT 0,
  `demo_notes_1` text DEFAULT NULL,
  `demo_notes_2` text DEFAULT NULL,
  `demo_notes_3` text DEFAULT NULL,
  `demo_notes_4` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `tenant_company_id` int(11) DEFAULT 7,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`),
  KEY `lead_id` (`lead_id`),
  KEY `idx_company_id` (`company_id`),
  CONSTRAINT `opportunities_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(80) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,7,'PRD-01','Manufacturing ERP','ERP','End-to-end manufacturing resource planning','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(2,7,'PRD-02','Hospital ERP','ERP','Hospital and healthcare management suite','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(3,7,'PRD-03','HRMS','HR','Human resource management system','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(4,7,'PRD-04','Payroll','HR','Payroll processing and compliance','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(5,7,'PRD-05','Rental ERP','ERP','Equipment and asset rental management','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(6,7,'PRD-06','Solar ERP','ERP','Solar EPC project management','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(7,7,'PRD-07','Inventory','Operations','Inventory and stock management','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(8,7,'PRD-08','Finance','Operations','Financial accounting and reporting','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(9,7,'PRD-09','CRM','Sales','Customer relationship management','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(10,7,'PRD-10','Custom Software','Services','Bespoke software development','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(11,7,'PRD-11','Digital Marketing','Services','Digital marketing services','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(12,7,'PRD-12','AMC','Services','Annual maintenance contract','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(13,7,'PRD-13','Cloud Hosting','Services','Managed cloud hosting','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(14,7,'PRD-14','Windmill Management','ERP','Wind energy asset management','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'CRM'
--

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

-- Dump completed on 2026-08-19 16:28:49
