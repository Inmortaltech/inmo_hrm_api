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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_url` varchar(255) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `marital_status` varchar(20) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `work_email` varchar(150) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `show_password` varchar(100) DEFAULT NULL,
  `personal_email` varchar(150) DEFAULT NULL,
  `emergency_contact_name` varchar(150) DEFAULT NULL,
  `relation_with_emergency` varchar(100) DEFAULT NULL,
  `emergency_contact_no` varchar(20) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `profile_type` varchar(50) DEFAULT NULL,
  `is_logged_in` tinyint(1) DEFAULT NULL,
  `password_request` varchar(255) DEFAULT NULL,
  `attachments` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_account_no` varchar(50) DEFAULT NULL,
  `bank_ifsc_code` varchar(20) DEFAULT NULL,
  `govt_uid` varchar(100) DEFAULT NULL,
  `department_name` varchar(150) DEFAULT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `office_time_policy` varchar(100) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `shift_start_date` date DEFAULT NULL,
  `resignation_date` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `work_email` (`work_email`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (58,NULL,'Nandani','Bharti','2002-07-31','Female','Single','B-','nandanibharti48@gmail.com','9625416431','$2b$10$43mhGXJmuzArKFoaNFljlexLScyVNZCaqGSOLYq83516/skH4YiKa','nandani123','','','','','Employee','',0,NULL,NULL,NULL,'','','','','','','',NULL,'2026-03-16',NULL,'','2026-04-09 09:47:12'),(59,'/uploads/1775819226162.jpg','Shivani','Aswal','1997-12-31','Female','Married','B-','shivaniinmortal@gmail.com','8077899526','$2b$10$dHA3kDhuuYFPDiEQ1KLVZOBFauouVI.NjvaUNZFOJjpv0ADjzVTc2','shivani123','','','','','Employee','',1,'pending',NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:30:46'),(60,NULL,'Mansi','Saxena','1999-03-22','Female','Single','O postive','mansi@inmortaltechnologies.com','7518724209','$2b$10$YYTUqNrMrzawogroXx2Kk.oc44B83JHEBCKSjbObnmPemecJYXwdq','mansi123','','','','','Employee','',1,'pending',NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:35:26'),(61,NULL,'Shubhangi','Sharma','2002-01-01','Female','Single','A+','shubhinmo@gmail.com','8218805883','$2b$10$CKcOolPHDvJlTyEKuWbYDuKVpOBivHJ.tFyBpxskI.0b.jI8fu4zC','shubhangi123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:38:26'),(62,NULL,'Shruti ',' Mehta	','2002-01-01','Female','Single','A+','shrutiinmortal@gmail.com','9717350122','$2b$10$AJvdDC3xtN7WpPnAnPP0z.bvXYZn1s1jAgpINO2g7NmXZvwX5Piia','shruti123','','','','','Employee','',1,'pending',NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:41:13'),(63,NULL,'Anchal  ',' Verma','2002-01-01','Female','Single','A+','anchal@inmortaltechnologies.com','8707083391','$2b$10$UmHhu9mLXrqqPpwFxTdV8OxgcgxNgTS.5QrkvCrrDdKHutuly15Jq','anchal123','','','','','Employee','',0,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:45:13'),(64,NULL,'Soni','Mishra','2002-01-01','Female','Single','A+','soniinmortal@gmail.com','9305145356','$2b$10$saR34HH4kqabYMV1hZ.ylO71t6sL.vtLGcozyRBh3lVbd7jA793Dm','soni123','','','','','Employee','',1,'pending',NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:47:49'),(65,'/uploads/1777380188058.jpg','Riya','Rajput','2001-12-27','Female','Single','A+','riyainmortal@gmail.com','9528673126','$2b$10$3cFbDf/F4QvL29Wdj3kTCeLZKfdkFfZQQPv/yN2gx.UTRg61XwhJ6','riya123','','bdbdbd','','','Employee','',0,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:50:32'),(66,NULL,'Ravi','Gautam','2002-01-01','Male','Single','A+','ravigoutaminmo@gmail.com','7505135066','$2b$10$gRisHJQGMfnustOKE9.lSO7twZANeIbpPWBhuAICOzc20dw6OPdkO','ravi123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:52:50'),(67,'/uploads/1775819260163.png','Dileep','Singh','1995-10-10','Male','Married','A+','dileepios@inmortaltechnologies.com','9981276511','$2b$10$6BGL4FhdDh.NMTv7HVaMiOGc4jUrBWUQ5va31Kxheo1wdlaTnL6ni','Dileep@123#','','','','','Employee','',1,'pending',NULL,NULL,'','','','','-','-','',NULL,NULL,NULL,'','2026-04-10 09:55:47'),(68,NULL,'Divesh','Kushwaha','2002-01-01','Male','Single','A+','diveshinmortal@gmail.com','7248440590','$2b$10$QKHnnTM7MkHcVQxt7uZGoulJGpdQH3H0UNCleUrcXZseeEmLdF2nm','divesh123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 09:58:00'),(69,NULL,'Ashutosh ','Narayan','2001-12-29','Male','Single','A+','ashuinmo@gmail.com','6200005378','$2b$10$/6t6udEAPgxthplmJNV4IesH0zYdz9LUIdT4ncEEf5m4LdBGxjVZG','ashutosh123','vishalashu001@gmail.com','','','','Employee','',1,NULL,NULL,NULL,'','','','','-','-','',NULL,NULL,NULL,'','2026-04-10 10:00:53'),(70,'/uploads/1777527034214.webp','Tushar','Sharma','2001-12-31','Male','Single','A+','tushar@inmortaltechnologies.com','9456066494','$2b$10$O12wEf8ezE4jzaltzo55j.bloeoiz5BdBzJ2g6Bkqoz6q0WdmFY6e','tushar123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:05:10'),(71,'/uploads/1776315932716.jpg','Mukesh','Aswal','2001-11-02','Male','single','B-','mukesh@inmortaltechnologies.com','8938000512','$2b$10$7VNIQgR73XdBiJmHqD30IeHuY3/oDBrCFH732yiYoKmN89NXZPYdq','mukesh123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:07:16'),(72,NULL,'Ashutosh ','Mudgal','2002-01-01','Male','Single','A+','ashu.world91@gmail.com','9887109618','$2b$10$/RADsWhVaeKgJPQkLQa8p.ZLoSnmImcVhsPAebe6su3LBpLCaYHUu','ashutosh123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:09:20'),(73,NULL,'Gaurav','Verma','2002-01-01','Male','Single','A+','gauravinmortal@gmail.com','7985667638','$2b$10$5PRHvHH5MZnSfpIQITY6lOFhNTqSLC/OVM76BC2z0KFWOZZJFE/h2','gaurav123','','','','','Employee','',1,'pending',NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:12:10'),(74,NULL,'Tarun ','Sharma','2002-01-01','Male','Single','A+','tarun@inmortaltechnologies.com','9412321099','$2b$10$sJCOF1KrqE/znGduKVp2he5ZNsV0t575KZVqrUNP9pqA/tO2RvWji','tarun123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:14:40'),(75,NULL,'Nand Ji','Jayaswal','2001-12-29','Male','Single','O-','nandinmortal@gmail.com','9589455168','$2b$10$0epJ/dBDy2wykKoT7pLZEelx6POTJYh77lOBY6jDqRxW7qaQZXqG2','nand123','jayaswalnandji@gmail.com','','','','Employee','',1,'pending',NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:16:23'),(76,NULL,'Shivansh','s','2002-01-01','Male','Single','A+','shivanshinmo@gmail.com','9873532468','$2b$10$3s7YDJ8OzJ1lX3Ykr8WpwuHKnEDJ.H9fpmAWxCzj56N4/b9y6k1yu','shivansh123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:18:30'),(77,NULL,'Arun ','kumar','2002-01-01','Male','Single','A+','aruninmo@gmail.com','7037189677','$2b$10$DOnay5Z3UYYEEU8cTGRc2eJCoTPsPYQQXZsgNHBcSlZLagjr.mZQ2','arun123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:23:15'),(78,NULL,'Ravi ','Kumar','2002-01-01','Male','Single','A+','raviinmo@gmail.com','9785169757','$2b$10$ogwK6NW5M/JWp0.fVNH8Ee9OzliQwndFVqaNxwpWihzAFGphPTF4y','ravi123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:25:33'),(79,NULL,'Mratyunjaya ','Sharma','2002-01-01','Male','Single','A+','mratyunjayainmo@gmail.com','9528531871','$2b$10$KoNqYlNRwGJbFWHNMMswVuM6wHTW5CtC41GitF9p2H3H7xFjS0Jee','mratyunjaya123','','','','','Employee','',1,NULL,NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:28:01'),(80,NULL,'Akash','Sharma','2002-01-01','Male','Single','A+','akashinmortal@gmail.com','9810719591','$2b$10$HYhepW3gYJYrqHxRfeeftuzZQI1lnb5EaZFKXUBcUg6rTqsaYTm4q','akash123','','','','','Employee','',1,'pending',NULL,NULL,'','','','','','','',NULL,NULL,NULL,'','2026-04-10 10:55:40'),(81,NULL,'Jubair ','Siddiqui','2000-07-17','Male','Single','B-','jubairinmortal@gmail.com','9711549311','$2b$10$MKxOCOBhBkZxvwk2Fz5g1OFySY90wv9W8.hGIcbC9oLqVbLT1KQVy','Zuber@786','jubairinmortal@gmail.com','Ayan','Brother','8802436573','Employee','',1,'pending',NULL,NULL,'','','','','','iOS Developer','','2023-09-05','2023-09-08',NULL,'','2026-04-15 06:37:33');
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

-- Dump completed on 2026-05-04 12:17:53
