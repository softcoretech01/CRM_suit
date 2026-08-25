-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: 100.86.181.18    Database: Masters_crm
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
-- Table structure for table `activity_types`
--

DROP TABLE IF EXISTS `activity_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(30) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_types`
--

LOCK TABLES `activity_types` WRITE;
/*!40000 ALTER TABLE `activity_types` DISABLE KEYS */;
INSERT INTO `activity_types` VALUES (1,'ACT-01','Call','Phone call','tone-blue','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(2,'ACT-02','Email','Email correspondence','tone-indigo','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(3,'ACT-03','Meeting','In-person / online meeting','tone-purple','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(4,'ACT-04','Visit','Site visit','tone-teal','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(5,'ACT-05','WhatsApp','WhatsApp message','tone-green','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(6,'ACT-06','Demo','Product demonstration','tone-amber','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(7,'ACT-07','Proposal','Proposal / quotation','tone-pink','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(8,'ACT-08','Task','General task','tone-gray','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57'),(9,'ACT-09','Note','Note / remark','tone-gray','ACTIVE','2026-08-17 12:07:57','2026-08-17 12:07:57');
/*!40000 ALTER TABLE `activity_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (1,'CMP-01','ERP Growth Q3 2026','Q3 ERP growth campaign','ACTIVE','2026-08-17 12:07:56','2026-08-17 12:07:56'),(2,'CMP-02','Healthcare Digital 2026','Healthcare digitalization','ACTIVE','2026-08-17 12:07:56','2026-08-17 12:07:56'),(3,'CMP-03','Referral Rewards Program','Customer referral rewards','ACTIVE','2026-08-17 12:07:56','2026-08-17 12:07:56'),(4,'CMP-04','Renewable Energy Expo','Renewable energy expo lead-gen','ACTIVE','2026-08-17 12:07:56','2026-08-17 12:07:56'),(5,'CMP-05','SME Digital Transformation','SME digital push','ACTIVE','2026-08-17 12:07:56','2026-08-17 12:07:56');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `state` varchar(80) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'CBE','Coimbatore','City in Tamil Nadu','Tamil Nadu','ACTIVE','2026-08-17 12:08:02','2026-08-17 12:08:02'),(2,'MAA','Chennai','City in Tamil Nadu','Tamil Nadu','ACTIVE','2026-08-17 12:08:02','2026-08-17 12:08:02'),(3,'BLR','Bengaluru','City in Karnataka','Karnataka','ACTIVE','2026-08-17 12:08:02','2026-08-17 12:08:02'),(4,'COK','Kochi','City in Kerala','Kerala','ACTIVE','2026-08-17 12:08:02','2026-08-17 12:08:02'),(5,'HYD','Hyderabad','City in Telangana','Telangana','ACTIVE','2026-08-17 12:08:02','2026-08-17 12:08:02'),(6,'TUP','Tirupur','City in Tamil Nadu','Tamil Nadu','ACTIVE','2026-08-17 12:08:02','2026-08-17 12:08:02');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'India',
  `founder` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_designation` varchar(50) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_mobile` varchar(20) DEFAULT NULL,
  `max_users` int(11) DEFAULT 1,
  `logo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (7,'COM-001','Techspire Solutions','Information Technology','Private Limited','Coimbatore','Tamil Nadu','India','uma','Sitra','no','ACTIVE','2026-08-17 13:26:07','2026-08-19 09:41:08','Kabilesh','Developer','softcore@gmail.com','08778853952',3,NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'IN','India','India','ACTIVE','2026-08-17 12:08:01','2026-08-17 12:08:01'),(3,'AE','United Arab Emirates','UAE','ACTIVE','2026-08-17 12:08:01','2026-08-17 12:08:01'),(5,'SG','Singapore','Singapore','ACTIVE','2026-08-17 12:08:01','2026-08-17 12:08:01');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `industries`
--

DROP TABLE IF EXISTS `industries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `industries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `industries`
--

LOCK TABLES `industries` WRITE;
/*!40000 ALTER TABLE `industries` DISABLE KEYS */;
INSERT INTO `industries` VALUES (1,'IND-01','Manufacturing','Manufacturing sector','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(2,'IND-02','Healthcare','Hospitals and healthcare','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(3,'IND-03','Engineering','Engineering services','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(4,'IND-04','Textiles','Textiles and apparel','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(5,'IND-05','Renewable Energy','Solar and wind energy','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(7,'IND-07','Automotive','Automotive and dealerships','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(8,'IND-08','Rental Services','Equipment rental','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(10,'IND-009','Information Technology ','IT','ACTIVE','2026-08-18 08:45:13','2026-08-18 08:45:13');
/*!40000 ALTER TABLE `industries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_sources`
--

DROP TABLE IF EXISTS `lead_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_sources`
--

LOCK TABLES `lead_sources` WRITE;
/*!40000 ALTER TABLE `lead_sources` DISABLE KEYS */;
INSERT INTO `lead_sources` VALUES (1,'SRC-01','Website','Company website enquiry','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(2,'SRC-02','Google Ads','Google advertising','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(3,'SRC-03','Meta Ads','Facebook / Instagram ads','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(4,'SRC-04','LinkedIn','LinkedIn outreach','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(5,'SRC-05','Referral','Customer / partner referral','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(6,'SRC-06','BNI','BNI networking','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(7,'SRC-07','Cold Calling','Outbound cold calls','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(8,'SRC-08','Trade Fair','Trade fairs and expos','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(9,'SRC-09','WhatsApp','WhatsApp enquiry','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55'),(10,'SRC-10','Existing Customer','Repeat / existing customer','ACTIVE','2026-08-17 12:07:55','2026-08-17 12:07:55');
/*!40000 ALTER TABLE `lead_sources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_statuses`
--

DROP TABLE IF EXISTS `lead_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_statuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(30) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_statuses`
--

LOCK TABLES `lead_statuses` WRITE;
/*!40000 ALTER TABLE `lead_statuses` DISABLE KEYS */;
INSERT INTO `lead_statuses` VALUES (4,'LS-04','Qualified','Meets qualification criteria','tone-purple',4,'ACTIVE','2026-08-17 12:07:58','2026-08-17 12:07:58'),(6,'LS-06','Demo','Demo stage','tone-teal',6,'ACTIVE','2026-08-17 12:07:58','2026-08-17 12:07:58'),(7,'LS-07','Proposal','Proposal sent','tone-amber',7,'ACTIVE','2026-08-17 12:07:58','2026-08-17 12:07:58'),(8,'LS-08','Negotiation','In negotiation','tone-pink',8,'ACTIVE','2026-08-17 12:07:58','2026-08-17 12:07:58'),(9,'LS-09','PO Expected','Purchase order expected','tone-indigo',9,'ACTIVE','2026-08-17 12:07:58','2026-08-17 12:07:58'),(10,'LS-10','Won','Deal won','tone-green',10,'ACTIVE','2026-08-17 12:07:58','2026-08-17 12:07:58'),(11,'LS-11','Lost','Deal lost','tone-red',11,'ACTIVE','2026-08-17 12:07:58','2026-08-17 12:07:58');
/*!40000 ALTER TABLE `lead_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `next_actions`
--

DROP TABLE IF EXISTS `next_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `next_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `next_actions`
--

LOCK TABLES `next_actions` WRITE;
/*!40000 ALTER TABLE `next_actions` DISABLE KEYS */;
INSERT INTO `next_actions` VALUES (1,'NA-01','Call','Make a call','ACTIVE','2026-08-17 12:07:59','2026-08-17 12:07:59'),(2,'NA-02','Send Proposal','Send a proposal','ACTIVE','2026-08-17 12:07:59','2026-08-17 12:07:59'),(3,'NA-03','Schedule Meeting','Schedule a meeting','ACTIVE','2026-08-17 12:07:59','2026-08-17 12:07:59'),(4,'NA-04','Product Demo','Give a product demo','ACTIVE','2026-08-17 12:07:59','2026-08-17 12:07:59'),(5,'NA-05','Send Quotation','Send a quotation','ACTIVE','2026-08-17 12:07:59','2026-08-17 12:07:59'),(6,'NA-06','Follow-up','Follow up with customer','ACTIVE','2026-08-17 12:07:59','2026-08-17 12:07:59'),(7,'NA-07','Close Deal','Close the deal','ACTIVE','2026-08-17 12:07:59','2026-08-17 12:07:59');
/*!40000 ALTER TABLE `next_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `priorities`
--

DROP TABLE IF EXISTS `priorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `priorities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(30) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priorities`
--

LOCK TABLES `priorities` WRITE;
/*!40000 ALTER TABLE `priorities` DISABLE KEYS */;
INSERT INTO `priorities` VALUES (1,'PRI-01','High','High priority','tone-red',1,'ACTIVE','2026-08-17 12:08:00','2026-08-17 12:08:00'),(2,'PRI-02','Medium','Medium priority','tone-amber',2,'ACTIVE','2026-08-17 12:08:00','2026-08-17 12:08:00'),(3,'PRI-03','Low','Low priority','tone-teal',3,'ACTIVE','2026-08-17 12:08:00','2026-08-17 12:08:00');
/*!40000 ALTER TABLE `priorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(80) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'PRD-01','Manufacturing ERP','End-to-end manufacturing resource planning','ERP','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(2,'PRD-02','Hospital ERP','Hospital and healthcare management suite','ERP','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(3,'PRD-03','HRMS','Human resource management system','HR','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(4,'PRD-04','Payroll','Payroll processing and compliance','HR','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(5,'PRD-05','Rental ERP','Equipment and asset rental management','ERP','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(6,'PRD-06','Solar ERP','Solar EPC project management','ERP','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(7,'PRD-07','Inventory','Inventory and stock management','Operations','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(8,'PRD-08','Finance','Financial accounting and reporting','Operations','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(9,'PRD-09','CRM','Customer relationship management','Sales','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(10,'PRD-10','Custom Software','Bespoke software development','Services','ACTIVE','2026-08-17 12:07:53','2026-08-17 12:07:53'),(11,'PRD-11','Digital Marketing','Digital marketing services','Services','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(12,'PRD-12','AMC','Annual maintenance contract','Services','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(13,'PRD-13','Cloud Hosting','Managed cloud hosting','Services','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(14,'PRD-14','Windmill Management','Wind energy asset management','ERP','ACTIVE','2026-08-17 12:07:54','2026-08-17 12:07:54'),(15,'PRD-15','Test',NULL,'ERP','ACTIVE','2026-08-19 10:38:01','2026-08-19 10:38:01');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `country` varchar(80) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,'TN','Tamil Nadu','State in India','India','ACTIVE','2026-08-17 12:08:01','2026-08-17 12:08:01'),(2,'KA','Karnataka','State in India','India','ACTIVE','2026-08-17 12:08:01','2026-08-17 12:08:01'),(3,'KL','Kerala','State in India','India','ACTIVE','2026-08-17 12:08:01','2026-08-17 12:08:01'),(5,'MH','Maharashtra','State in India','India','ACTIVE','2026-08-17 12:08:01','2026-08-17 12:08:01');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'Masters_crm'
--

--
-- Dumping routines for database 'Masters_crm'
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

-- Dump completed on 2026-08-19 16:28:48
