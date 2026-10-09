-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: inmo_hrms
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `leavetype` varchar(50) DEFAULT NULL,
  `fromdate` date DEFAULT NULL,
  `todate` date DEFAULT NULL,
  `totalleavedays` int DEFAULT NULL,
  `reasonforleave` text,
  `request_status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `reasonstatus` varchar(255) DEFAULT NULL,
  `upload` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (10,1,'Casual Leave','2025-10-09','2025-10-11',2,'feeling not well!','approved',NULL,'i don\'t want',NULL),(11,1,'Casual Leave','2025-10-09','2025-10-11',2,'feeling not well!','reject',NULL,NULL,NULL),(12,1,'Earned Leave','2025-09-24','2025-09-26',3,'breakup','reject',NULL,NULL,NULL),(13,1,'Earned Leave','2025-09-24','2025-09-26',3,'breakup','approved',NULL,NULL,NULL),(14,1,'Earned Leave','2025-10-10','2025-10-15',6,'jvjgjgjf','approved',NULL,NULL,NULL),(31,33,'Earned Leave','2025-10-22','2025-10-29',8,'diwaliii','approved',NULL,NULL,NULL),(32,33,'Leave Without Pay','2025-10-15','2025-10-16',2,'leave','rejected',NULL,NULL,NULL),(33,33,'Earned Leave','2025-10-17','2025-10-22',6,'Diwali celebration','rejected',NULL,NULL,NULL),(34,37,'Half day Leave','2025-10-30','2025-10-30',1,'for Sibling Wedding','approved',NULL,NULL,NULL),(35,42,'Casual Leave','2025-12-03','2026-12-03',366,'pata nhi','approved',NULL,NULL,NULL),(36,42,'Casual Leave','2025-12-04','2025-12-13',10,'no reason','reject',NULL,NULL,NULL),(37,42,'Casual Leave','2025-12-05','2030-12-05',1827,'change','approved',NULL,NULL,NULL),(38,42,'Half day Leave','2025-12-05','2025-12-05',1,'bhag','rejected',NULL,NULL,NULL),(39,42,'Casual Leave','2025-12-05','2025-12-05',1,'hshsbdh','rejected',NULL,NULL,NULL),(40,38,'Earned Leave','2025-12-08','2025-12-10',3,'fever','approved',NULL,NULL,NULL),(41,42,'Earned Leave','2025-12-08','2026-12-08',366,'hnhigjfb','rejected',NULL,NULL,NULL),(42,42,'Half day Leave','2025-12-09','2025-12-09',1,'half day de leave','approved',NULL,NULL,NULL),(43,42,'Half day Leave','2025-12-09','2025-12-09',1,'testcase','approved',NULL,NULL,NULL),(46,42,'Casual Leave','2025-12-11','2026-12-11',366,'maze','approved',NULL,NULL,NULL),(47,42,'Leave Without Pay','2025-12-11','2025-12-11',1,'w rcf c G','rejected',NULL,NULL,NULL),(48,42,'Earned Leave','2025-12-11','2025-12-11',1,'belive','approved',NULL,NULL,NULL),(49,42,'Half day Leave','2025-12-11','2025-12-11',1,'usuhdhd','approved',NULL,NULL,NULL),(50,42,'Casual Leave','2025-12-15','2025-12-20',6,'hzhhes','approved',NULL,NULL,NULL),(51,42,'Casual Leave','2025-12-11','2025-12-13',3,'behxhxeh','approved',NULL,NULL,NULL),(52,42,'Casual Leave','2025-12-12','2025-12-12',1,'gzhxb','approved',NULL,NULL,NULL),(53,42,'Casual Leave','2025-12-11','2025-12-11',1,'hdjjfnd','approved',NULL,NULL,NULL),(54,42,'Casual Leave','2025-12-11','2025-12-11',1,'hdjjddbhd','approved',NULL,NULL,NULL),(55,42,'Casual Leave','2025-12-11','2025-12-11',1,'gdhdhdh','approved',NULL,NULL,NULL),(56,42,'Casual Leave','2025-12-11','2025-12-11',1,'jdjsbd','approved',NULL,NULL,NULL),(57,42,'Casual Leave','2025-12-11','2025-12-11',1,'jdjdjjfnd','approved',NULL,NULL,NULL),(58,42,'Casual Leave','2025-12-12','2025-12-12',1,'ggsgah','approved',NULL,NULL,NULL),(59,35,'Earned Leave','2025-12-17','2025-12-31',15,'feverrr','pending',NULL,NULL,NULL),(60,49,'Casual Leave','2025-12-17','2025-12-20',4,'need to attend marriage','pending',NULL,NULL,NULL),(61,51,'Casual Leave','2026-03-19','2026-03-19',1,'xluxkydykd','approved',NULL,NULL,NULL),(62,51,NULL,'2026-03-05','2026-03-19',NULL,NULL,'pending',NULL,NULL,NULL),(63,51,NULL,'2026-03-13','2026-03-19',NULL,NULL,'approved',NULL,NULL,NULL),(64,51,NULL,'2026-03-19','2026-03-19',NULL,NULL,'rejected',NULL,NULL,NULL),(65,51,NULL,'2026-03-19','2026-03-19',NULL,NULL,'rejected',NULL,NULL,NULL),(66,51,NULL,'2026-03-19','2025-12-19',NULL,NULL,'approved',NULL,NULL,NULL),(67,52,'Leave Without Pay','2026-03-19','2026-06-30',104,'no reason','rejected',NULL,NULL,NULL),(68,12,'Earned Leave','2026-03-23','2026-03-23',1,'leave','pending',NULL,NULL,NULL),(69,51,NULL,'2026-03-23','2025-12-23',NULL,NULL,'approved',NULL,NULL,NULL),(70,55,'Earned Leave','2026-03-23','2026-03-23',1,'fever','rejected',NULL,NULL,NULL),(71,55,'Earned Leave','2026-03-23','2026-03-23',1,'ddd','approved',NULL,NULL,NULL),(72,55,'Earned Leave','2026-03-23','2026-03-23',1,'date','rejected',NULL,NULL,NULL),(73,55,'Casual Leave','2026-03-23','2026-03-23',1,'ehhe','pending',NULL,NULL,NULL),(74,51,NULL,'2026-03-23','2025-12-23',NULL,NULL,'rejected',NULL,NULL,NULL),(75,51,'Earned Leave','2026-03-23','2026-03-23',1,'Na','pending',NULL,NULL,NULL),(76,51,'Earned Leave','2026-03-23','2026-03-23',1,'vgv','pending',NULL,NULL,NULL),(77,42,'Earned Leave','2026-03-23','2026-03-23',1,'hshhss','pending',NULL,NULL,NULL),(78,42,'Earned Leave','2026-03-23','2026-03-23',1,'uywhe','pending',NULL,NULL,NULL),(79,51,NULL,'2026-03-24','2025-12-24',NULL,NULL,'approved',NULL,NULL,NULL),(80,51,NULL,'2026-03-25','2025-12-25',NULL,NULL,'pending',NULL,NULL,NULL),(81,51,'Leave Without Pay','2027-03-24','2027-03-31',8,'future','pending',NULL,NULL,NULL),(82,51,'Casual Leave','2026-04-08','2026-04-09',2,'fever','approved',NULL,NULL,NULL),(83,75,'Earned Leave','2026-04-20','2026-04-21',2,'personal','rejected',NULL,NULL,NULL),(84,59,'Casual Leave','2026-04-14','2026-04-14',1,'urgent work','rejected',NULL,NULL,NULL),(85,67,'Casual Leave','2026-04-10','2026-04-10',1,'urgent work','rejected',NULL,NULL,NULL),(86,68,'Casual Leave','2026-04-13','2026-04-13',1,'testing','approved',NULL,NULL,NULL),(87,71,'Half day Leave','2026-04-13','2026-04-13',1,'going to home town','rejected',NULL,NULL,NULL),(88,74,'Casual Leave','2026-04-13','2026-04-13',1,'Casual','rejected',NULL,NULL,NULL),(89,73,'Casual Leave','2026-04-17','2026-04-17',1,'I am going to home','approved',NULL,NULL,NULL),(90,75,'Earned Leave','2026-04-14','2026-04-14',1,'personal','pending',NULL,NULL,NULL),(91,81,'Casual Leave','2026-04-15','2026-04-15',1,'fever','rejected',NULL,'no i dont want you to go on leave',NULL),(92,51,NULL,'2026-03-10','2026-04-15',NULL,NULL,'pending',NULL,NULL,NULL),(93,1,'Casual Leave','2025-10-09','2025-10-11',2,'feeling not well!','pending',NULL,NULL,'1776331312270.jpg'),(110,65,'Half day Leave','2026-04-28','2026-04-28',1,'fever','pending',NULL,NULL,'1777370329094.jpg'),(111,65,'Half day Leave','2026-04-28','2026-04-30',3,'rhhe','pending',NULL,NULL,'1777375356477.jpg'),(112,65,'Earned Leave','2026-04-30','2026-04-30',1,'tuyf','pending',NULL,NULL,'1777380135981.jpg'),(113,80,'Earned Leave','2026-04-29','2026-04-29',1,'for testing','rejected',NULL,'TESTING',NULL),(114,80,'Earned Leave','2026-04-29','2026-04-29',1,'testing purpose','pending',NULL,NULL,'1777451483971.jpg'),(115,65,'Casual Leave','2026-05-01','2026-05-02',2,'for casually','pending',NULL,NULL,NULL);
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 12:17:54
