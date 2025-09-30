-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: improvio_db
-- ------------------------------------------------------
-- Server version	8.0.38

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
-- Table structure for table `alert`
--

DROP TABLE IF EXISTS `alert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_urgent` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`alert_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `alert_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert`
--

LOCK TABLES `alert` WRITE;
/*!40000 ALTER TABLE `alert` DISABLE KEYS */;
INSERT INTO `alert` VALUES (1,1,'12','12',1,'2025-09-24 06:29:11',1);
/*!40000 ALTER TABLE `alert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachment`
--

DROP TABLE IF EXISTS `attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachment` (
  `attachment_id` int NOT NULL AUTO_INCREMENT,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `suggestion_id` int DEFAULT NULL,
  PRIMARY KEY (`attachment_id`),
  KEY `suggestion_id` (`suggestion_id`),
  CONSTRAINT `attachment_ibfk_1` FOREIGN KEY (`suggestion_id`) REFERENCES `suggestion` (`suggestion_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachment`
--

LOCK TABLES `attachment` WRITE;
/*!40000 ALTER TABLE `attachment` DISABLE KEYS */;
INSERT INTO `attachment` VALUES (1,'1.jpg','2025-09-22 21:27:29',1),(2,'2.jpg','2025-09-22 21:27:29',2),(3,'3.jpg','2025-09-22 21:27:29',3),(4,'4.jpg','2025-09-22 21:27:29',4),(5,'5.jpeg','2025-09-22 21:27:29',5),(6,'6.webp','2025-09-22 21:27:29',7),(7,'7.jpg','2025-09-22 21:27:29',8),(8,'8.webp','2025-09-22 21:27:29',9),(9,'9.jpg','2025-09-22 21:27:29',10),(10,'10.jfif','2025-09-22 21:27:29',11),(11,'11.jpg','2025-09-22 21:27:29',12),(12,'12.jpg','2025-09-22 21:27:29',13),(13,'13.png','2025-09-22 21:27:29',14),(14,'14.jfif','2025-09-22 21:27:29',15),(15,'15.png','2025-09-22 21:27:29',16),(16,'16.jfif','2025-09-22 21:27:29',17),(17,'17.jfif','2025-09-22 21:27:29',18),(54,'1759209655309-799416670.png','2025-09-30 05:20:55',59);
/*!40000 ALTER TABLE `attachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `board`
--

DROP TABLE IF EXISTS `board`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board` (
  `board_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`board_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board`
--

LOCK TABLES `board` WRITE;
/*!40000 ALTER TABLE `board` DISABLE KEYS */;
INSERT INTO `board` VALUES (1,'자유게시판','자유롭게 이야기하는 공간','2025-09-24 20:19:59'),(2,'신입게시판','신입 회원들을 위한 공간','2025-09-24 20:19:59'),(3,'비밀게시판','익명으로 이야기할 수 있는 공간','2025-09-24 20:19:59'),(4,'정보게시판','유용한 정보를 공유하는 공간','2025-09-24 20:19:59'),(5,'장터게시판','물건을 사고파는 공간','2025-09-24 20:19:59'),(6,'시사/이슈','최근 이슈와 뉴스를 다루는 공간','2025-09-24 20:19:59');
/*!40000 ALTER TABLE `board` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `suggestion_id` int DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `suggestion_id` (`suggestion_id`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`suggestion_id`) REFERENCES `suggestion` (`suggestion_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (67,'1212','2025-09-30 04:45:30',1,9),(68,'1212','2025-09-30 04:48:31',1,2),(69,'11','2025-09-30 04:48:44',1,1),(70,'1212','2025-09-30 05:21:00',1,2),(71,'2323','2025-09-30 07:10:10',1,2),(72,'12','2025-09-30 07:13:05',9,2),(73,'1212','2025-09-30 07:13:20',9,61),(74,'45','2025-09-30 07:22:34',28,2);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment_like`
--

DROP TABLE IF EXISTS `comment_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_like` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `comment_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `user_id` (`user_id`,`comment_id`),
  KEY `comment_id` (`comment_id`),
  CONSTRAINT `comment_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `comment_like_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_like`
--

LOCK TABLES `comment_like` WRITE;
/*!40000 ALTER TABLE `comment_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_name` (`department_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (7,'PM'),(1,'R&D'),(9,'경영지원'),(8,'구매'),(3,'기본설계'),(4,'미래사업개발'),(10,'안전'),(5,'조선설계'),(6,'해양설계'),(2,'해외영업');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dislike`
--

DROP TABLE IF EXISTS `dislike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dislike` (
  `dislike_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `suggestion_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`dislike_id`),
  UNIQUE KEY `unique_user_suggestion` (`user_id`,`suggestion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dislike`
--

LOCK TABLES `dislike` WRITE;
/*!40000 ALTER TABLE `dislike` DISABLE KEYS */;
INSERT INTO `dislike` VALUES (2,1,5,'2025-09-24 07:59:03'),(3,1,2,'2025-09-25 02:27:48');
/*!40000 ALTER TABLE `dislike` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance`
--

DROP TABLE IF EXISTS `performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance` (
  `performance_id` int NOT NULL AUTO_INCREMENT,
  `suggestion_id` int DEFAULT NULL,
  `expected_reduction_rate` decimal(5,2) DEFAULT NULL,
  `actual_reduction_rate` decimal(5,2) DEFAULT NULL,
  `expected_productivity` decimal(5,2) DEFAULT NULL,
  `actual_productivity` decimal(5,2) DEFAULT NULL,
  `expected_cost_saving` decimal(15,2) DEFAULT NULL,
  `actual_cost_saving` decimal(15,2) DEFAULT NULL,
  `effect_summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','evaluated','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `department_id` int DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`performance_id`),
  KEY `suggestion_id` (`suggestion_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `performance_ibfk_1` FOREIGN KEY (`suggestion_id`) REFERENCES `suggestion` (`suggestion_id`) ON DELETE CASCADE,
  CONSTRAINT `performance_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance`
--

LOCK TABLES `performance` WRITE;
/*!40000 ALTER TABLE `performance` DISABLE KEYS */;
INSERT INTO `performance` VALUES (1,1,12.50,10.20,8.00,6.50,5000000.00,4200000.00,'에너지 절약 및 생산성 향상 기대','evaluated',2,'2025-09-19 15:30:00','2025-09-24 21:00:00'),(2,2,15.00,NULL,10.00,NULL,7000000.00,NULL,'공정 개선으로 인한 비용 절감 예상','pending',3,'2025-09-21 16:00:00',NULL),(3,3,8.00,7.50,5.00,4.80,3000000.00,2800000.00,'작업 효율 향상','completed',1,'2025-09-17 20:20:00','2025-09-22 17:30:00'),(4,4,20.00,18.50,12.00,11.50,10000000.00,9500000.00,'설비 개선으로 인한 생산성 향상','completed',2,'2025-09-18 14:45:00','2025-09-23 22:00:00'),(5,5,5.00,NULL,3.00,NULL,1500000.00,NULL,'작업 방식 변경으로 인한 절감 기대','pending',1,'2025-09-24 19:15:00',NULL),(6,6,18.00,16.20,9.00,8.50,8000000.00,7500000.00,'자동화 장비 도입으로 효율 상승','completed',3,'2025-09-20 17:00:00','2025-09-25 16:00:00'),(7,7,10.00,9.00,6.00,5.50,4000000.00,3800000.00,'재고 관리 최적화','evaluated',2,'2025-09-22 15:00:00','2025-09-24 20:00:00'),(8,8,7.50,NULL,4.00,NULL,2000000.00,NULL,'작업자 교육을 통한 생산성 향상','pending',4,'2025-09-23 18:30:00',NULL),(9,9,25.00,22.00,15.00,14.00,12000000.00,11000000.00,'공정 혁신 프로젝트 완료','completed',5,'2025-09-16 16:10:00','2025-09-22 15:00:00'),(10,10,6.00,5.50,3.50,3.20,1800000.00,1700000.00,'작업 표준화 효과','completed',1,'2025-09-19 21:20:00','2025-09-24 18:00:00'),(11,11,13.00,NULL,7.00,NULL,5500000.00,NULL,'에너지 절감 설비 개선','pending',2,'2025-09-20 19:00:00',NULL),(12,12,9.50,8.50,5.50,5.00,3500000.00,3200000.00,'프로세스 효율화','evaluated',3,'2025-09-18 15:50:00','2025-09-23 21:30:00'),(13,13,11.00,10.00,6.50,6.00,4500000.00,4200000.00,'부품 낭비 감소','completed',4,'2025-09-17 22:00:00','2025-09-22 19:00:00'),(14,14,16.00,NULL,9.50,NULL,7500000.00,NULL,'신규 장비 도입 기대 효과','pending',5,'2025-09-21 20:30:00',NULL),(15,15,5.50,5.00,3.20,3.00,1600000.00,1500000.00,'소모품 절감 효과','completed',1,'2025-09-22 17:20:00','2025-09-24 23:00:00'),(16,16,12.00,11.00,7.00,6.50,5000000.00,4800000.00,'공정 재배치로 인한 생산성 향상','completed',2,'2025-09-19 14:40:00','2025-09-23 20:10:00'),(17,17,8.50,NULL,4.50,NULL,2800000.00,NULL,'직원 교육 효과 예상','pending',3,'2025-09-23 16:50:00',NULL),(18,18,14.00,13.00,8.00,7.50,6000000.00,5700000.00,'설비 점검 및 최적화 완료','completed',4,'2025-09-18 19:30:00','2025-09-23 22:50:00'),(19,19,7.00,6.50,3.80,3.50,2200000.00,2100000.00,'작업 표준화 교육 완료','completed',5,'2025-09-20 18:10:00','2025-09-24 17:40:00'),(20,20,10.50,NULL,6.00,NULL,4000000.00,NULL,'부분 자동화 도입 기대','pending',1,'2025-09-24 15:30:00',NULL);
/*!40000 ALTER TABLE `performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `board_id` (`board_id`),
  KEY `user_id` (`user_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `board` (`board_id`) ON DELETE CASCADE,
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `post_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,1,1,'첫 번째 자유게시판 글','안녕하세요! 첫 번째 글입니다 ?','approved','2025-09-24 20:27:50',1),(2,1,2,'React 질문 있습니다','React에서 useEffect와 useState 차이가 궁금합니다.','approved','2025-09-24 20:27:50',2),(3,2,3,'신입게시판 인사드립니다','안녕하세요. 이번에 새로 들어온 박지훈입니다. 잘 부탁드립니다 ?','approved','2025-09-24 20:27:50',5),(4,4,2,'정보 공유: MySQL 팁','JOIN 최적화하는 방법을 정리했습니다.','approved','2025-09-24 20:27:50',2),(5,6,1,'? 시사/이슈 - AI 뉴스','최근 AI 관련 큰 이슈가 있어 공유드립니다.','approved','2025-09-24 20:27:50',1),(6,5,1,'ww','ww','pending','2025-09-29 06:01:31',5),(9,3,1,'12','12','pending','2025-09-30 04:42:56',3),(10,1,1,'ggg','ggg','pending','2025-09-30 05:13:43',1),(11,1,9,'12','12','pending','2025-09-30 07:16:14',1),(12,2,9,'12','12','pending','2025-09-30 07:16:30',2),(13,1,28,'ㄹㄹ','ㄹㄹ','pending','2025-09-30 07:21:51',1),(14,1,28,'dd','dd','pending','2025-09-30 07:29:36',1);
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_like`
--

DROP TABLE IF EXISTS `post_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_like` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique_like` (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `post_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `post_like_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_like`
--

LOCK TABLES `post_like` WRITE;
/*!40000 ALTER TABLE `post_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postattachment`
--

DROP TABLE IF EXISTS `postattachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postattachment` (
  `attachment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `postattachment_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postattachment`
--

LOCK TABLES `postattachment` WRITE;
/*!40000 ALTER TABLE `postattachment` DISABLE KEYS */;
INSERT INTO `postattachment` VALUES (1,6,'/uploads/1759125691810-641929496.jpg','2025-09-29 06:01:31'),(4,9,'/uploads/1759207376943-745612236.jpg','2025-09-30 04:42:56'),(5,10,'/uploads/1759209223009-538130163.jpg','2025-09-30 05:13:43'),(6,11,'/uploads/1759216574388-281519737.jpg','2025-09-30 07:16:14'),(7,12,'/uploads/1759216590537-424182258.jpg','2025-09-30 07:16:30'),(8,13,'/uploads/1759216911049-190156946.jpg','2025-09-30 07:21:51'),(9,14,'/uploads/1759217376338-499406831.png','2025-09-30 07:29:36');
/*!40000 ALTER TABLE `postattachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postcomment`
--

DROP TABLE IF EXISTS `postcomment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postcomment` (
  `postcomment_id` int NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  PRIMARY KEY (`postcomment_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `postcomment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `postcomment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postcomment`
--

LOCK TABLES `postcomment` WRITE;
/*!40000 ALTER TABLE `postcomment` DISABLE KEYS */;
INSERT INTO `postcomment` VALUES (1,'와 정말 유용한 정보네요. 감사합니다!','2025-09-24 20:27:50',2,1),(2,'저도 이 방법 써봤는데 잘 되더라구요!','2025-09-24 20:27:50',3,1),(3,'저도 궁금합니다. 혹시 코드 공유 가능할까요?','2025-09-24 20:27:50',1,2),(4,'좋은 소식 감사합니다 ?','2025-09-24 20:27:50',2,3),(6,'1212','2025-09-30 05:02:25',1,1),(7,'11','2025-09-30 05:02:59',1,1),(8,'44','2025-09-30 05:03:32',1,2),(9,'12','2025-09-30 05:12:50',1,1),(10,'33','2025-09-30 05:12:57',1,2),(11,'1212','2025-09-30 05:13:17',1,6),(12,'1212','2025-09-30 05:13:18',1,6),(13,'1212','2025-09-30 05:13:25',1,6),(14,'1212','2025-09-30 05:13:26',1,6),(15,'1212','2025-09-30 05:13:28',1,6),(16,'12','2025-09-30 07:16:23',1,11),(17,'22','2025-09-30 07:16:34',1,12),(18,'ㄹㄹ','2025-09-30 07:21:58',1,13);
/*!40000 ALTER TABLE `postcomment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postcomment_like`
--

DROP TABLE IF EXISTS `postcomment_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postcomment_like` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `postcomment_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique_like` (`user_id`,`postcomment_id`),
  KEY `postcomment_id` (`postcomment_id`),
  CONSTRAINT `postcomment_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `postcomment_like_ibfk_2` FOREIGN KEY (`postcomment_id`) REFERENCES `postcomment` (`postcomment_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postcomment_like`
--

LOCK TABLES `postcomment_like` WRITE;
/*!40000 ALTER TABLE `postcomment_like` DISABLE KEYS */;
INSERT INTO `postcomment_like` VALUES (1,1,1,'2025-09-24 20:27:50'),(2,3,1,'2025-09-24 20:27:50'),(3,2,2,'2025-09-24 20:27:50'),(4,1,3,'2025-09-24 20:27:50');
/*!40000 ALTER TABLE `postcomment_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suggestion`
--

DROP TABLE IF EXISTS `suggestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suggestion` (
  `suggestion_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_effect` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `user_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_urgent` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`suggestion_id`),
  KEY `user_id` (`user_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `suggestion_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `suggestion_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suggestion`
--

LOCK TABLES `suggestion` WRITE;
/*!40000 ALTER TABLE `suggestion` DISABLE KEYS */;
INSERT INTO `suggestion` VALUES (1,'작업동선 최적화','작업장 내 자재를 공정 순서와 사용 빈도에 맞추어 재배치함으로써 불필요한 이동을 최소화하고 기존의 비효율적인 동선을 개선하여 작업자가 이동에 소모하는 시간을 절감함. 최적 동선을 설계하여 작업 시간 단축과 피로 감소를 동시에 달성하며 장기적으로 생산성과 직원 만족도를 향상시킴.','작업 효율 15% 향상','pending',1,1,'2025-09-22 21:02:07',0),(2,'불량품 체크리스트 도입','생산 초기 단계에서 품질 체크리스트를 체계적으로 도입하여 작은 실수까지 사전에 예방할 수 있도록 설계함. 신규 직원 교육 자료로 활용하고 숙련 직원도 반복 점검을 통해 품질 편차를 최소화하며, 장기적으로 불량률 감소와 제품 신뢰도 향상에 기여함.','불량률 10% 감소','approved',2,2,'2025-09-22 21:02:07',0),(3,'설비 예지보전 시스템','설비에 센서를 설치하고 실시간 모니터링 시스템을 구축하여 고장을 조기에 예측하고 계획적 유지보수를 통해 불필요한 비용과 시간 낭비를 방지함. 장기적으로 설비 가동률을 극대화하고 안정적인 생산 환경과 효율적 운영 관리를 동시에 가능하게 하며, 데이터 기반 의사결정으로 전략적 개선을 가능하게 함.','설비 가동률 20% 향상','pending',3,3,'2025-09-22 21:02:07',0),(4,'안전 보호구 착용 강화','작업장 입구에 자동 감지 장치를 설치하여 보호구 착용 여부를 확인하고 미착용 시 즉시 경고 알림을 제공함. 직원들은 안전 규정을 준수하게 되며, 안전 문화 정착과 안전 의식 강화, 장기적 사고 발생률 감소에 기여하고 기업 신뢰도 향상에도 긍정적인 영향을 미침.','안전사고 30% 감소','rejected',4,4,'2025-09-22 21:02:07',0),(5,'신소재 연구 적용','고강도이면서 경량화 가능한 신소재를 연구하여 제품에 적용함으로써 성능과 안정성을 확보함. 시제품 테스트로 품질과 내구성을 검증하고, 경쟁사 대비 기술 우위를 확보하며 장기적으로 기술 혁신과 브랜드 신뢰성을 동시에 강화할 수 있음. 데이터 활용으로 최적 소재 선정과 설계 개선도 가능함.','제품 경쟁력 강화','completed',5,2,'2025-09-22 21:02:07',0),(6,'자동재고 관리 시스템','자동화된 재고 관리 시스템을 도입하여 재고량을 실시간 모니터링하고 부족 시 알람을 발생시켜 중복 주문이나 누락을 방지함. 관리자는 실시간 데이터를 확인하며 적정 재고를 유지할 수 있고, 자재 비용 절감과 계획 생산 효율 향상, 전체 운영 효율을 최적화할 수 있음.','재고 부족 문제 최소화','pending',6,1,'2025-09-22 21:02:07',0),(7,'작업표준서 개선','작업자별 표준 작업 매뉴얼을 최신 공정과 장비 환경에 맞게 개편하여 오류와 편차를 최소화하고 작업 속도와 품질을 균일하게 유지함. 신규 직원 교육에 활용되며, 장기적으로 조직 공정 안정성과 생산 효율성 향상에 기여하고 문서화된 데이터는 향후 개선 활동에도 활용 가능함.','작업 속도 및 품질 향상','approved',7,2,'2025-09-22 21:02:07',0),(8,'설비 청소 주기 최적화','설비 청소 주기를 자동화 시스템으로 관리하여 불필요한 설비 중단을 최소화함. 청소 일정과 진행 상황을 데이터 기반으로 최적화하여 작업자 부담을 줄이고 생산성을 높이며, 설비 수명을 연장하고 고장률을 낮추어 장기적인 비용 절감 효과와 안전 및 품질 관리에도 긍정적인 영향을 미침.','설비 다운타임 15% 감소','pending',8,3,'2025-09-22 21:02:07',0),(9,'품질 분석 자동 리포트','생산 과정에서 발생하는 품질 데이터를 자동으로 분석하여 관리자에게 실시간 리포트를 제공함. 시각화된 데이터로 문제를 즉시 파악하고 신속하게 대응 가능하며, 관리자의 업무 효율과 의사결정 속도를 높이고 전체 생산 품질 수준을 체계적으로 관리하며 데이터 기반 품질 관리 문화를 정착시킬 수 있음.','관리자 업무 효율 20% 향상','approved',9,4,'2025-09-22 21:02:07',0),(10,'작업 안전 알림 시스템','위험 구역 접근 시 자동 알람을 발생시켜 사고를 사전에 예방함. 근접 센서와 시각·청각 경고로 위험 상황을 즉시 인지하고 안전성을 극대화하며, 작업자의 안전 의식 강화 및 안전 관리 기준 준수 향상에 기여함. 장기적으로 기업 안전 문화 정착에도 긍정적 영향을 미침.','사고 예방 25% 향상','completed',10,1,'2025-09-22 21:02:07',0),(11,'사내 회의실 예약 시스템 개선','회의실 예약 시스템을 개선하여 실시간 예약 현황을 확인할 수 있도록 하고, 중복 예약으로 인한 업무 지연을 방지하며 모바일과 대시보드 연동으로 언제 어디서나 예약 가능하게 함. 직원 편의성과 협업 효율 증대, 회의 운영 체계화로 생산성과 업무 만족도를 동시에 향상시킴.','회의 예약 충돌 최소화','pending',1,1,'2025-09-22 21:02:07',0),(12,'사내 복지 포인트 지급 확대','복지 포인트 지급 기준을 확대하고 사용처를 외부 제휴처까지 적용함. 직원들이 다양한 혜택을 경험하며 만족도가 높아지고, 포인트 활용과 참여를 통해 몰입도를 향상시킴. 장기적으로 긍정적인 기업 문화 조성 및 근무 의욕과 팀워크 향상에 기여함.','직원 만족도 향상','approved',2,2,'2025-09-22 21:02:07',0),(13,'커피머신 추가 설치','휴게실에 커피머신을 추가 설치하여 직원 대기 시간을 줄이고 쾌적한 휴식 환경을 제공함. 휴식 시간 회복을 효율적으로 활용하여 집중력과 업무 효율을 높이며, 직원 만족도 향상과 근무 환경 개선, 장기적인 생산성 향상과 조직 분위기 개선 효과를 동시에 기대할 수 있음.','휴식 편의성 향상','completed',3,3,'2025-09-22 21:02:07',0),(14,'사내 통신망 속도 개선','사내 네트워크 장비 업그레이드 및 속도 최적화로 화상회의, 파일 전송 등 업무 환경을 개선함. 통신 지연과 오류를 최소화하고 안정적인 협업 환경 제공, 업무 효율성을 높이고 직원 스트레스 감소, 전반적인 생산성과 신뢰도 향상으로 조직 전체의 디지털 업무 환경 수준을 높이는 효과를 가져옴.','업무 효율 향상','pending',4,4,'2025-09-22 21:02:07',0),(15,'출근 시간 유연화 제도','출근 시간 유연화 제도를 도입하여 직원들이 개인 상황에 맞춰 근무 시간을 조정할 수 있도록 함. 교통 혼잡과 출근 스트레스 감소, 개인 생활과 업무 균형 향상, 근무 집중도와 업무 효율 상승, 직원 만족도 개선, 장기적으로 조직 몰입도를 높이는 긍정적 효과를 기대하며 재택·원격 근무와 연계해 유연성을 더욱 강화함.','업무 집중도 향상','approved',5,1,'2025-09-22 21:02:07',0),(16,'사내 헬스장 보강','사내 헬스장을 보강하여 운동기구 추가 및 환경 개선으로 직원 건강 증진을 지원함. 대기 시간 단축, 편리한 운동 환경 제공, 정기적 운동 참여로 체력 향상과 업무 집중력 증진, 건강한 조직 문화 조성, 장기적으로 근무 의욕과 생산성 향상 효과를 가져올 수 있음.','직원 건강 증진','pending',6,2,'2025-09-22 21:02:07',0),(17,'온라인 휴가 신청 시스템 개선','온라인 휴가 신청 시스템을 개선하여 모바일로 간편하게 신청·승인 가능하게 함. 관리자는 알림 기능으로 빠르게 대응할 수 있어 승인 지연 최소화, 시스템 자동화로 휴가 관리 업무 효율 향상, 직원 편리성과 근무 만족도 증대, 조직 신뢰도 향상에도 긍정적 효과를 가져올 수 있음.','관리자 업무 효율 향상','completed',7,3,'2025-09-22 21:02:07',0),(18,'사내 이벤트 개최','분기별 사내 이벤트 개최로 부서 간 교류와 팀워크를 강화함. 다양한 활동으로 직원 친밀감과 협업 능력 향상, 긍정적 분위기 조성, 참여율 증가로 조직 소속감과 몰입도 상승, 장기적으로 팀 성과와 조직 문화 개선에 긍정적 영향을 미칠 수 있음.','팀워크 향상','pending',8,4,'2025-09-22 21:02:07',0),(19,'직원 제안함 활성화','직원 제안함 활성화를 위해 사용을 독려하고 우수 아이디어에는 인센티브 제공. 자발적 참여를 유도하고 다양한 개선안 확보, 투명한 제안 처리로 신뢰 강화, 조직 내 협력과 혁신 문화 조성, 장기적인 개선 효과를 가져올 수 있음.','참여도 증가','approved',9,1,'2025-09-22 21:02:07',0),(20,'사내 메신저 알림 최적화','사내 메신저 알림 최적화로 불필요한 알림을 줄이고 중요한 메시지만 강조함. 직원들이 핵심 내용에 집중하여 업무 방해 최소화, 모바일 푸시와 우선순위 설정으로 신속 소통 가능, 업무 효율성 향상과 팀 간 의사소통 질 개선으로 조직 전체 생산성 증대에 기여함.','업무 집중도 향상','pending',10,2,'2025-09-22 21:02:07',0),(59,'12','12','12','pending',NULL,NULL,'2025-09-30 05:20:55',0),(60,'12','12','12','pending',NULL,NULL,'2025-09-30 06:18:09',0),(61,'44','44','44','pending',9,1,'2025-09-30 07:08:33',0);
/*!40000 ALTER TABLE `suggestion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('employee','manager','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'employee',
  `department_id` int DEFAULT NULL,
  `join_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('활성','비활성') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '활성',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_user_department` (`department_id`),
  CONSTRAINT `fk_user_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'김현우','hkim','hashed_pw1','employee',1,'2025-09-23 23:40:15','비활성'),(2,'이서연','sylee','hashed_pw2','employee',2,'2025-09-23 23:40:15','비활성'),(3,'박지훈','jhpark','hashed_pw3','manager',5,'2025-09-23 23:40:15','활성'),(4,'한지민','hjmin','hashed_pw7','employee',3,'2025-09-23 23:40:15','활성'),(5,'최민정','mjchoi','hashed_pw5','employee',7,'2025-09-23 23:40:15','비활성'),(6,'정우성','wsjung','hashed_pw6','employee',9,'2025-09-23 23:40:15','비활성'),(7,'이가은','golee','hashed_pw7','employee',4,'2025-09-24 05:48:36','비활성'),(8,'정민규','mjjoeng','hashed_pw8','employee',8,'2025-09-25 02:13:34','활성'),(9,'12','12','$2b$10$zhlRe2duyOiy5TEdlUsuVeY9nhMIkOA3SJkIepTvAckoHFDlOO7pm','employee',1,'2025-09-25 02:43:21','활성'),(10,'22','22','$2b$10$hTxhF141O03.NZrO6vMwH.YTNEQFraDRE0FstRtY.gSoHvP9wCRBy','employee',7,'2025-09-25 02:57:35','활성'),(11,'1212','1212','$2b$10$p8SCUwF79vdzxu0dngSOte9T0EubsDIoMq01tQ35FpVhri03HfBlS','manager',1,'2025-09-25 04:55:42','활성'),(12,'1111','1111','$2b$10$JvgkUiTq6ZQsH4Kg2UKlGOVpfauG4p87XYEQJyKmCMOE4lpLdiv6e','employee',9,'2025-09-25 05:00:02','활성'),(13,'2222','2222','$2b$10$CFEsWh2ndmbr5fH8yQSJXenxN/opKBHOAPVFJUrRK2iEAMGLfugPK','employee',9,'2025-09-25 05:00:43','활성'),(14,'3333','3333','$2b$10$d.3dNMpALIN1hxgN5tdvy.bLAAGSdxnxmDTfKwjNRDwmYNTdzy8LW','manager',3,'2025-09-25 05:02:15','활성'),(15,'22222','22222','$2b$10$nMtzzljvbtzjiqRcvpAd1uCUpNGwxHAi7Cy.bdTWFGPhq6VOe7cqK','manager',1,'2025-09-25 06:04:11','활성'),(16,'122','122','$2b$10$3/gs1qiptH4mguQUPURSuOqBO12m8mV1ODTmmzB/n5AeMlBEcH3.u','employee',1,'2025-09-29 06:12:45','활성'),(17,'5','5','$2b$10$F0gaFsCCGZ303SN7Ty3KgO0/6V0TPNvIp57RfzBLE7Z5Aav6/SQ7e','employee',1,'2025-09-29 06:30:06','활성'),(18,'6','6','$2b$10$ikaQX1N06EqzAtQnPsd7uOtEAaCZHDIKgRTBh7sv8Q2ce//C5qX5u','employee',7,'2025-09-29 06:44:55','활성'),(19,'333333','333333','$2b$10$0YohLmTRsw2ASsny07qaA.RuFZhun/FGlCTshy0U/uDWSpKBwcAQC','manager',8,'2025-09-29 06:50:27','활성'),(20,'12121212','12121212','$2b$10$zO86D5lo./5Z7oCGJaM4JuSWY2kudIitd3Wx.kFQyf.Qh5qGopp6u','manager',10,'2025-09-29 06:52:11','활성'),(21,'88','88','$2b$10$v6Yk9HyBMwnDcjuJv70/5.4GMc0c5eF6pyAzFzmaureRUVy4niRMa','manager',8,'2025-09-29 06:53:37','활성'),(22,'99','99','$2b$10$Z0EMcCJdhmWLr6Mz8k8LouQ7IZOT2vor4AWeJgoXx1TAIlphm1P4e','employee',3,'2025-09-29 07:50:11','활성'),(23,'s','123','$2b$10$r/1k2B18G0ow6q9VR5GINeMJgTZn1Y0m4qzqLbuernJgcmoP0Jd9G','employee',10,'2025-09-29 08:09:47','활성'),(24,'8888','8888','$2b$10$RtaKgnuPc5T4TEajB2qwou734KKlUxTKsV.ALFQyv/muRFoxKSxQG','manager',3,'2025-09-29 08:10:48','활성'),(25,'111111','111111','$2b$10$ycqRFzxUzGoNfasjB6f2vOty2km19z0kOwJ4E1fto9ynhJCRirVla','manager',6,'2025-09-30 04:51:04','활성'),(26,'666','666','$2b$10$U70kuw44bDsWoOhCDqpgaOwXagNTTzDaku6LYyNj9UL/QuAk.HWo6','manager',2,'2025-09-30 05:08:24','활성'),(27,'777','777','$2b$10$o3MBptS6ZbE0eNvZRX.yr.PVoODJs.sLXEkXIvSsNmhtqwSxQUeOa','employee',8,'2025-09-30 05:10:39','활성'),(28,'1212121212','1212121212','$2b$10$27xFzRfCAltx1IFfZ6mxZ.CGT4FR.DM/Z/8FSuDzgxLYK01Y7KRAu','manager',5,'2025-09-30 07:20:51','활성');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vote`
--

DROP TABLE IF EXISTS `vote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vote` (
  `vote_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `suggestion_id` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vote_id`),
  UNIQUE KEY `unique_user_suggestion` (`user_id`,`suggestion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vote`
--

LOCK TABLES `vote` WRITE;
/*!40000 ALTER TABLE `vote` DISABLE KEYS */;
INSERT INTO `vote` VALUES (29,1,5,NULL,'2025-09-26 00:22:24'),(30,1,7,NULL,'2025-09-29 23:51:28'),(31,1,2,NULL,'2025-09-30 02:03:10'),(33,1,1,NULL,'2025-09-30 04:48:37'),(35,1,10,NULL,'2025-09-30 05:21:04'),(36,9,2,NULL,'2025-09-30 07:13:32'),(37,28,2,NULL,'2025-09-30 07:22:38');
/*!40000 ALTER TABLE `vote` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-30 16:30:51
