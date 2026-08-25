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
-- Current Database: `masters_crm`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `masters_crm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;

USE `masters_crm`;

--
-- Table structure for table `activity_types`
--

DROP TABLE IF EXISTS `activity_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color_code` varchar(10) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_types`
--

LOCK TABLES `activity_types` WRITE;
/*!40000 ALTER TABLE `activity_types` DISABLE KEYS */;
INSERT INTO `activity_types` VALUES (1,'Call','blue','bi-telephone',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard call used in the system.'),(2,'Email','gray','bi-envelope',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard email used in the system.'),(3,'Meeting','purple','bi-people',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard meeting used in the system.'),(4,'Demo','orange','bi-display',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard demo used in the system.'),(5,'Site Visit','green','bi-geo-alt',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard site visit used in the system.'),(6,'Follow-up','teal','bi-arrow-repeat',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard follow-up used in the system.'),(7,'WhatsApp','success','bi-whatsapp',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard whatsapp used in the system.'),(8,'Video Call','info','bi-camera-video',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard video call used in the system.'),(9,'Task','warning','bi-check2-square',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard task used in the system.'),(10,'Note','secondary','bi-file-text',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard note used in the system.'),(11,'Proposal Sent','primary','bi-file-earmark-text',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard proposal sent used in the system.'),(12,'Quotation Sent','primary','bi-receipt',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard quotation sent used in the system.'),(13,'Presentation','indigo','bi-easel',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard presentation used in the system.'),(14,'Product Discussion','pink','bi-chat-dots',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard product discussion used in the system.'),(15,'Requirement Discussion','red','bi-chat-square-text',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard requirement discussion used in the system.'),(16,'Negotiation','yellow','bi-briefcase',1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard negotiation used in the system.');
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
  `name` varchar(150) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (1,'Website Enquiry Campaign','WEB-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard website enquiry campaign used in the system.'),(2,'Google Ads Campaign','ADS-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard google ads campaign used in the system.'),(3,'LinkedIn Lead Generation','LNKD-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard linkedin lead generation used in the system.'),(4,'Email Marketing Campaign','EML-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard email marketing campaign used in the system.'),(5,'Social Media Campaign','SOC-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard social media campaign used in the system.'),(6,'Product Promotion Campaign','PROMO-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard product promotion campaign used in the system.'),(7,'Trade Show Campaign','SHOW-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard trade show campaign used in the system.'),(8,'Customer Referral Campaign','REF-001',NULL,NULL,1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard customer referral campaign used in the system.');
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
  `state_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`),
  CONSTRAINT `1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,1,'Chennai',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(2,1,'Coimbatore',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(3,1,'Madurai',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(4,2,'Mumbai',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(5,2,'Pune',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(6,2,'Nagpur',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(7,3,'Bengaluru',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(8,3,'Mysuru',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(9,3,'Mangaluru',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(10,4,'New Delhi',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(11,5,'Los Angeles',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(12,5,'San Francisco',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(13,5,'San Diego',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(14,6,'New York City',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(15,6,'Buffalo',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(16,7,'Houston',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(17,7,'Austin',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(18,7,'Dallas',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(19,1,'Mumbai',1,'2026-08-20 07:50:25','2026-08-20 07:50:25'),(20,1,'Pune',1,'2026-08-20 07:50:25','2026-08-20 07:50:25'),(21,2,'Bangalore',1,'2026-08-20 07:50:25','2026-08-20 07:50:25'),(22,3,'San Francisco',1,'2026-08-20 07:50:25','2026-08-20 07:50:25');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_types`
--

DROP TABLE IF EXISTS `company_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_types`
--

LOCK TABLES `company_types` WRITE;
/*!40000 ALTER TABLE `company_types` DISABLE KEYS */;
INSERT INTO `company_types` VALUES (1,'Private Limited',1,'2026-08-20 07:50:25','2026-08-20 10:16:03','Standard private limited used in the system.'),(2,'Public Limited',1,'2026-08-20 07:50:25','2026-08-20 10:16:03','Standard public limited used in the system.'),(4,'Partnership',1,'2026-08-20 07:50:25','2026-08-20 10:16:03','Standard partnership used in the system.'),(5,'Proprietorship',1,'2026-08-20 07:50:25','2026-08-20 10:16:03','Standard proprietorship used in the system.'),(6,'Testing Type 123',1,'2026-08-20 14:54:16','2026-08-20 14:54:16',NULL);
/*!40000 ALTER TABLE `company_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'IN','India',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(2,'US','United States',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(3,'GB','United Kingdom',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(4,'AE','United Arab Emirates',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(5,'SA','Saudi Arabia',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(6,'QA','Qatar',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(7,'OM','Oman',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(8,'KW','Kuwait',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(9,'BH','Bahrain',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(10,'SG','Singapore',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(11,'MY','Malaysia',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(12,'AU','Australia',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(13,'NZ','New Zealand',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(14,'CA','Canada',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(15,'DE','Germany',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(16,'FR','France',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(17,'IT','Italy',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(18,'ES','Spain',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(19,'NL','Netherlands',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(20,'CH','Switzerland',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(21,'ZA','South Africa',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(22,'JP','Japan',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(23,'CN','China',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(24,'KR','South Korea',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(25,'ID','Indonesia',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(26,'TH','Thailand',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(27,'VN','Vietnam',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(28,'PH','Philippines',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(29,'BD','Bangladesh',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(30,'LK','Sri Lanka',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(31,'NP','Nepal',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(32,'PK','Pakistan',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(33,'BR','Brazil',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(34,'MX','Mexico',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(35,NULL,'India',1,'2026-08-20 07:50:25','2026-08-20 07:50:25'),(36,NULL,'USA',1,'2026-08-20 07:50:25','2026-08-20 07:50:25');
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
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `industries`
--

LOCK TABLES `industries` WRITE;
/*!40000 ALTER TABLE `industries` DISABLE KEYS */;
INSERT INTO `industries` VALUES (1,'IT-SW','IT & Software','Information Technology and Software Services',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(2,'MFG','Manufacturing','Manufacturing and Production',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(3,'AUTO','Automotive','Automotive Industry',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(4,'HLTH','Healthcare','Healthcare and Medical',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(5,'PHARMA','Pharmaceuticals','Pharmaceutical Industry',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(6,'HOSP','Hospitality','Hospitality and Hotels',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(8,'EDU','Education','Education and Training',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(9,'CONST','Construction','Construction and Real Estate Development',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(10,'REAL','Real Estate','Real Estate Sales and Management',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(11,'BFSI','Banking & Finance','Banking, Financial Services and Insurance',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(12,'RETL','Retail','Retail and E-commerce',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(13,'WHSL','Wholesale','Wholesale and Distribution',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(14,'LOGI','Logistics & Transportation','Logistics, Shipping and Transportation',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(15,'TELE','Telecommunications','Telecommunications',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(16,'MEDIA','Media & Entertainment','Media, News and Entertainment',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(17,'FNB','Food & Beverage','Food and Beverage',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(18,'AGRI','Agriculture','Agriculture and Farming',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(19,'ENRG','Energy & Utilities','Energy, Power and Utilities',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(20,'OIL','Oil & Gas','Oil and Gas',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(21,'CHEM','Chemicals','Chemicals and Petrochemicals',1,'2026-08-20 06:09:04','2026-08-20 06:09:04'),(22,'TEXT','Textiles & Apparel','Textiles, Apparel and Fashion',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(23,'ENG','Engineering','Engineering Services',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(24,'ELEC','Electronics','Electronics and Components',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(25,'FMCG','Consumer Goods','Fast Moving Consumer Goods',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(26,'PROF','Professional Services','Professional Services',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(27,'CONS','Consulting','Management and Business Consulting',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(28,'GOV','Government','Government and Public Sector',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(29,'NGO','Non-Profit','Non-Governmental Organizations',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(30,NULL,'Technology','Standard technology used in the system.',1,'2026-08-20 07:50:25','2026-08-20 10:16:02'),(31,NULL,'Finance','Standard finance used in the system.',1,'2026-08-20 07:50:25','2026-08-20 10:16:02'),(32,NULL,'Healthcare','Standard healthcare used in the system.',1,'2026-08-20 07:50:25','2026-08-20 10:16:02'),(33,NULL,'Manufacturing','Standard manufacturing used in the system.',1,'2026-08-20 07:50:25','2026-08-20 10:16:02'),(34,NULL,'Retail','Standard retail used in the system.',1,'2026-08-20 07:50:25','2026-08-20 10:16:02');
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
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_sources`
--

LOCK TABLES `lead_sources` WRITE;
/*!40000 ALTER TABLE `lead_sources` DISABLE KEYS */;
INSERT INTO `lead_sources` VALUES (1,'WEB','Website',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard website used in the system.'),(2,'ORG-SEARCH','Google Search',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard google search used in the system.'),(3,'G-ADS','Google Ads',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard google ads used in the system.'),(4,'SOCIAL','Social Media',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard social media used in the system.'),(5,'FB','Facebook',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard facebook used in the system.'),(6,'IG','Instagram',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard instagram used in the system.'),(7,'LNKD','LinkedIn',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard linkedin used in the system.'),(8,'EMAIL-CMP','Email Campaign',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard email campaign used in the system.'),(9,'PHONE','Phone Call',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard phone call used in the system.'),(10,'WA','WhatsApp',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard whatsapp used in the system.'),(11,'REF','Referral',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard referral used in the system.'),(12,'CUST-REF','Customer Referral',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard customer referral used in the system.'),(13,'PTR','Partner',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard partner used in the system.'),(14,'TRD-SHOW','Trade Show',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard trade show used in the system.'),(15,'EXHB','Exhibition',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard exhibition used in the system.'),(16,'CONF','Conference',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard conference used in the system.'),(17,'WEBINAR','Webinar',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard webinar used in the system.'),(18,'MKT-PLC','Online Marketplace',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard online marketplace used in the system.'),(19,'COLD','Cold Outreach',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard cold outreach used in the system.'),(20,'SALES','Sales Team',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard sales team used in the system.'),(21,'INB','Inbound Enquiry',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard inbound enquiry used in the system.'),(22,'EXIST','Existing Customer',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard existing customer used in the system.'),(23,'ADS','Advertisement',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard advertisement used in the system.'),(24,'DIR','Direct Enquiry',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard direct enquiry used in the system.'),(25,'OTH','Other',1,'2026-08-20 06:09:05','2026-08-20 10:16:02','Standard other used in the system.');
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
  `name` varchar(100) NOT NULL,
  `color_code` varchar(10) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_statuses`
--

LOCK TABLES `lead_statuses` WRITE;
/*!40000 ALTER TABLE `lead_statuses` DISABLE KEYS */;
INSERT INTO `lead_statuses` VALUES (1,'New','primary',1,1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard new used in the system.'),(2,'Contacted','info',2,1,'2026-08-20 06:09:06','2026-08-20 10:16:02','Standard contacted used in the system.'),(3,'Qualified','success',3,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard qualified used in the system.'),(4,'Follow-up Required','warning',4,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard follow-up required used in the system.'),(5,'Interested','teal',5,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard interested used in the system.'),(6,'Converted','green',6,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard converted used in the system.'),(7,'Not Interested','secondary',7,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard not interested used in the system.'),(8,'Unqualified','gray',8,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard unqualified used in the system.'),(9,'Lost','danger',9,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard lost used in the system.');
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
  `name` varchar(100) NOT NULL,
  `color_code` varchar(10) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `next_actions`
--

LOCK TABLES `next_actions` WRITE;
/*!40000 ALTER TABLE `next_actions` DISABLE KEYS */;
INSERT INTO `next_actions` VALUES (1,'Call Customer','primary',1,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard call customer used in the system.'),(2,'Send Email','info',2,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard send email used in the system.'),(3,'Schedule Meeting','purple',3,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard schedule meeting used in the system.'),(4,'Schedule Demo','orange',4,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard schedule demo used in the system.'),(5,'Send Brochure','teal',5,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard send brochure used in the system.'),(6,'Send Product Details','teal',6,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard send product details used in the system.'),(7,'Send Quotation','success',7,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard send quotation used in the system.'),(8,'Send Proposal','success',8,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard send proposal used in the system.'),(9,'Follow Up','warning',9,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard follow up used in the system.'),(10,'Arrange Site Visit','green',10,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard arrange site visit used in the system.'),(11,'Arrange Product Demo','orange',11,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard arrange product demo used in the system.'),(12,'Discuss Requirements','indigo',12,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard discuss requirements used in the system.'),(13,'Negotiate Pricing','yellow',13,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard negotiate pricing used in the system.'),(14,'Send Contract','success',14,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard send contract used in the system.'),(15,'Collect Documents','gray',15,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard collect documents used in the system.'),(16,'Await Customer Response','secondary',16,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard await customer response used in the system.'),(17,'Internal Discussion','pink',17,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard internal discussion used in the system.'),(18,'Management Approval','danger',18,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard management approval used in the system.'),(19,'Close Lead','dark',19,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard close lead used in the system.');
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
  `name` varchar(100) NOT NULL,
  `color_code` varchar(10) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priorities`
--

LOCK TABLES `priorities` WRITE;
/*!40000 ALTER TABLE `priorities` DISABLE KEYS */;
INSERT INTO `priorities` VALUES (1,'Low','secondary',1,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard low used in the system.'),(2,'Medium','info',2,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard medium used in the system.'),(3,'High','warning',3,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard high used in the system.'),(4,'Urgent','danger',4,1,'2026-08-20 06:09:06','2026-08-20 10:16:03','Standard urgent used in the system.');
/*!40000 ALTER TABLE `priorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Software Subscriptions','SaaS and cloud software licenses',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(2,'Hardware Setup','Physical servers, laptops, and networking gear',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(3,'Consulting Services','Strategic advising and management consulting',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(4,'Support & Maintenance','Annual Maintenance Contracts (AMC) and SLA support',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(5,'Training & Onboarding','Employee and client training packages',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(6,'Implementation Fees','One-time setup and implementation charges',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(7,'Custom Development','Bespoke software or hardware engineering',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(8,'Managed Services','Outsourced IT or business operations',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(9,'Advertising Credits','Ad-spend allocations for digital campaigns',1,'2026-08-20 06:09:05','2026-08-20 06:09:05'),(10,'Event Sponsorships','Booth space, speaking slots, or event branding',1,'2026-08-20 06:09:05','2026-08-20 06:09:05');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country_id` int(11) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `country_id` (`country_id`),
  CONSTRAINT `1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,1,'TN','Tamil Nadu',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(2,1,'MH','Maharashtra',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(3,1,'KA','Karnataka',1,'2026-08-20 06:09:06','2026-08-20 06:09:06'),(4,1,'DL','Delhi',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(5,2,'CA','California',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(6,2,'NY','New York',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(7,2,'TX','Texas',1,'2026-08-20 06:09:07','2026-08-20 06:09:07'),(8,1,NULL,'Maharashtra',1,'2026-08-20 07:50:25','2026-08-20 07:50:25'),(9,1,NULL,'Karnataka',1,'2026-08-20 07:50:25','2026-08-20 07:50:25'),(10,2,NULL,'California',1,'2026-08-20 07:50:25','2026-08-20 07:50:25'),(11,1,NULL,'Test State API 3',1,'2026-08-20 14:54:40','2026-08-20 14:54:40');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;

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

-- Dump completed on 2026-08-24 11:29:50
