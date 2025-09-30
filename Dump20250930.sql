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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachment`
--

LOCK TABLES `attachment` WRITE;
/*!40000 ALTER TABLE `attachment` DISABLE KEYS */;
INSERT INTO `attachment` VALUES (1,'1.jpg','2025-09-23 06:27:29',1),(2,'2.jpg','2025-09-23 06:27:29',2),(3,'3.jpg','2025-09-23 06:27:29',3),(4,'4.jpg','2025-09-23 06:27:29',4),(5,'5.jpeg','2025-09-23 06:27:29',5),(6,'6.webp','2025-09-23 06:27:29',7),(7,'7.jpg','2025-09-23 06:27:29',8),(8,'8.webp','2025-09-23 06:27:29',9),(9,'9.jpg','2025-09-23 06:27:29',10),(10,'10.jfif','2025-09-23 06:27:29',11),(11,'11.jpg','2025-09-23 06:27:29',12),(12,'12.jpg','2025-09-23 06:27:29',13),(13,'13.png','2025-09-23 06:27:29',14),(14,'14.jfif','2025-09-23 06:27:29',15),(15,'15.png','2025-09-23 06:27:29',16),(16,'16.jfif','2025-09-23 06:27:29',17),(17,'17.jfif','2025-09-23 06:27:29',18),(48,'1758675865786-292886017.png','2025-09-24 01:04:25',51),(49,'1758675865802-884493219.jpg','2025-09-24 01:04:25',51),(50,'1758675865802-935695085.png','2025-09-24 01:04:25',51),(51,'1758675865802-80451858.png','2025-09-24 01:04:25',51),(52,'1758844953820-520274694.png','2025-09-26 00:02:33',52),(53,'1759125758573-160091596.png','2025-09-29 06:02:38',54);
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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,'좋은 아이디어입니다. 적용 가능성이 높습니다.','2025-09-23 06:02:42',3,1),(2,'체크리스트 항목을 조금 더 구체화하면 좋겠습니다.','2025-09-23 06:02:42',1,2),(3,'센서 비용과 유지보수도 고려 필요합니다.','2025-09-23 06:02:42',2,3),(4,'현장 교육이 필요할 것 같습니다.','2025-09-23 06:02:42',4,4),(5,'연구소 자료와 비교해보면 좋겠습니다.','2025-09-23 06:02:42',5,5),(6,'자동 재고 알람 기능이 잘 작동할지 테스트 필요.','2025-09-23 06:02:42',3,6),(7,'작업표준서 개선으로 혼선 줄일 수 있을 듯.','2025-09-23 06:02:42',1,7),(8,'청소 일정 조정으로 설비 효율 증가 기대.','2025-09-23 06:02:42',2,8),(9,'자동 리포트가 관리자 업무를 확실히 줄여줄 것 같습니다.','2025-09-23 06:02:42',4,9),(10,'안전 알람 시스템 설치 위치를 신중히 검토해야 합니다.','2025-09-23 06:02:42',3,10),(11,'회의실 예약 시스템 개선 시 모바일 앱도 함께 제공하면 좋겠습니다.','2025-09-23 06:02:42',2,11),(12,'복지 포인트 사용처를 외부 제휴처까지 확대하면 더 좋습니다.','2025-09-23 06:02:42',3,12),(13,'휴게실에 커피 외에도 간단한 스낵도 제공되면 좋겠습니다.','2025-09-23 06:02:42',1,13),(14,'네트워크 업그레이드 후 속도 테스트 필요합니다.','2025-09-23 06:02:42',4,14),(15,'유연근무제 시 출퇴근 기록 자동화 기능 필요.','2025-09-23 06:02:42',3,15),(16,'헬스장 이용 시간 예약 시스템도 고려하면 좋겠습니다.','2025-09-23 06:02:42',2,16),(17,'휴가 승인 알림 기능을 이메일과 메신저로 동시에 보내면 편리합니다.','2025-09-23 06:02:42',1,17),(18,'팀 단합 이벤트는 부서별로 차등 운영 고려 필요.','2025-09-23 06:02:42',4,18),(19,'제안함 인센티브 기준을 명확히 안내해야 합니다.','2025-09-23 06:02:42',3,19),(20,'중요 알림은 색상 강조를 통해 시각적으로 구분하면 좋겠습니다.','2025-09-23 06:02:42',2,20),(43,'해ㅐㅇ','2025-09-24 07:39:36',1,1),(44,'as','2025-09-24 08:05:19',1,2),(45,'ㅁㄴ','2025-09-24 08:08:32',1,2),(46,'1','2025-09-25 05:15:08',1,5),(47,'1212','2025-09-26 07:10:44',1,13),(48,'1212','2025-09-26 07:10:50',1,17),(49,'1212','2025-09-26 07:12:02',1,14),(50,'1212','2025-09-26 07:12:03',1,14),(51,'1212','2025-09-26 07:12:09',1,9),(52,'1212','2025-09-26 07:12:10',1,9),(53,'1212','2025-09-26 07:14:07',1,7),(54,'1212','2025-09-26 07:17:37',1,15),(55,'1212','2025-09-26 07:17:39',1,15),(56,'?','2025-09-28 23:57:38',1,1),(57,'머야','2025-09-28 23:58:02',1,1),(58,'굿 아이디어','2025-09-28 23:58:10',1,1),(59,'굳','2025-09-28 23:58:16',1,1),(60,'메롱','2025-09-28 23:58:18',1,1),(61,'12','2025-09-29 05:59:58',1,2),(62,'1221','2025-09-29 05:59:59',1,2),(63,'33','2025-09-29 07:13:54',1,2),(64,'1212','2025-09-29 23:51:26',1,7),(65,'11','2025-09-30 00:31:20',1,10);
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
INSERT INTO `comment_like` VALUES (2,1,1,'2025-09-23 07:38:35');
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
INSERT INTO `performance` VALUES (1,1,12.50,10.20,8.00,6.50,5000000.00,4200000.00,'에너지 절약 및 생산성 향상 기대','evaluated',2,'2025-09-20 00:30:00','2025-09-25 06:00:00'),(2,2,15.00,NULL,10.00,NULL,7000000.00,NULL,'공정 개선으로 인한 비용 절감 예상','pending',3,'2025-09-22 01:00:00',NULL),(3,3,8.00,7.50,5.00,4.80,3000000.00,2800000.00,'작업 효율 향상','completed',1,'2025-09-18 05:20:00','2025-09-23 02:30:00'),(4,4,20.00,18.50,12.00,11.50,10000000.00,9500000.00,'설비 개선으로 인한 생산성 향상','completed',2,'2025-09-18 23:45:00','2025-09-24 07:00:00'),(5,5,5.00,NULL,3.00,NULL,1500000.00,NULL,'작업 방식 변경으로 인한 절감 기대','pending',1,'2025-09-25 04:15:00',NULL),(6,6,18.00,16.20,9.00,8.50,8000000.00,7500000.00,'자동화 장비 도입으로 효율 상승','completed',3,'2025-09-21 02:00:00','2025-09-26 01:00:00'),(7,7,10.00,9.00,6.00,5.50,4000000.00,3800000.00,'재고 관리 최적화','evaluated',2,'2025-09-23 00:00:00','2025-09-25 05:00:00'),(8,8,7.50,NULL,4.00,NULL,2000000.00,NULL,'작업자 교육을 통한 생산성 향상','pending',4,'2025-09-24 03:30:00',NULL),(9,9,25.00,22.00,15.00,14.00,12000000.00,11000000.00,'공정 혁신 프로젝트 완료','completed',5,'2025-09-17 01:10:00','2025-09-23 00:00:00'),(10,10,6.00,5.50,3.50,3.20,1800000.00,1700000.00,'작업 표준화 효과','completed',1,'2025-09-20 06:20:00','2025-09-25 03:00:00'),(11,11,13.00,NULL,7.00,NULL,5500000.00,NULL,'에너지 절감 설비 개선','pending',2,'2025-09-21 04:00:00',NULL),(12,12,9.50,8.50,5.50,5.00,3500000.00,3200000.00,'프로세스 효율화','evaluated',3,'2025-09-19 00:50:00','2025-09-24 06:30:00'),(13,13,11.00,10.00,6.50,6.00,4500000.00,4200000.00,'부품 낭비 감소','completed',4,'2025-09-18 07:00:00','2025-09-23 04:00:00'),(14,14,16.00,NULL,9.50,NULL,7500000.00,NULL,'신규 장비 도입 기대 효과','pending',5,'2025-09-22 05:30:00',NULL),(15,15,5.50,5.00,3.20,3.00,1600000.00,1500000.00,'소모품 절감 효과','completed',1,'2025-09-23 02:20:00','2025-09-25 08:00:00'),(16,16,12.00,11.00,7.00,6.50,5000000.00,4800000.00,'공정 재배치로 인한 생산성 향상','completed',2,'2025-09-19 23:40:00','2025-09-24 05:10:00'),(17,17,8.50,NULL,4.50,NULL,2800000.00,NULL,'직원 교육 효과 예상','pending',3,'2025-09-24 01:50:00',NULL),(18,18,14.00,13.00,8.00,7.50,6000000.00,5700000.00,'설비 점검 및 최적화 완료','completed',4,'2025-09-19 04:30:00','2025-09-24 07:50:00'),(19,19,7.00,6.50,3.80,3.50,2200000.00,2100000.00,'작업 표준화 교육 완료','completed',5,'2025-09-21 03:10:00','2025-09-25 02:40:00'),(20,20,10.50,NULL,6.00,NULL,4000000.00,NULL,'부분 자동화 도입 기대','pending',1,'2025-09-25 00:30:00',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,1,1,'첫 번째 자유게시판 글','안녕하세요! 첫 번째 글입니다 ?','approved','2025-09-24 20:27:50',1),(2,1,2,'React 질문 있습니다','React에서 useEffect와 useState 차이가 궁금합니다.','approved','2025-09-24 20:27:50',2),(3,2,3,'신입게시판 인사드립니다','안녕하세요. 이번에 새로 들어온 박지훈입니다. 잘 부탁드립니다 ?','approved','2025-09-24 20:27:50',5),(4,4,2,'정보 공유: MySQL 팁','JOIN 최적화하는 방법을 정리했습니다.','approved','2025-09-24 20:27:50',2),(5,6,1,'? 시사/이슈 - AI 뉴스','최근 AI 관련 큰 이슈가 있어 공유드립니다.','approved','2025-09-24 20:27:50',1),(6,5,1,'ww','ww','pending','2025-09-29 06:01:31',5),(7,1,1,'12','12','pending','2025-09-29 23:46:14',1),(8,1,1,'66','66','pending','2025-09-30 00:32:54',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postattachment`
--

LOCK TABLES `postattachment` WRITE;
/*!40000 ALTER TABLE `postattachment` DISABLE KEYS */;
INSERT INTO `postattachment` VALUES (1,6,'/uploads/1759125691810-641929496.jpg','2025-09-29 06:01:31'),(2,7,'/uploads/1759189574315-725902461.jpg','2025-09-29 23:46:14'),(3,8,'/uploads/1759192374350-208263722.jpg','2025-09-30 00:32:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postcomment`
--

LOCK TABLES `postcomment` WRITE;
/*!40000 ALTER TABLE `postcomment` DISABLE KEYS */;
INSERT INTO `postcomment` VALUES (1,'와 정말 유용한 정보네요. 감사합니다!','2025-09-24 20:27:50',2,1),(2,'저도 이 방법 써봤는데 잘 되더라구요!','2025-09-24 20:27:50',3,1),(3,'저도 궁금합니다. 혹시 코드 공유 가능할까요?','2025-09-24 20:27:50',1,2),(4,'좋은 소식 감사합니다 ?','2025-09-24 20:27:50',2,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suggestion`
--

LOCK TABLES `suggestion` WRITE;
/*!40000 ALTER TABLE `suggestion` DISABLE KEYS */;
INSERT INTO `suggestion` VALUES (1,'작업동선 최적화','작업장 내 자재 배치를 변경하여 불필요한 이동을 줄임.\n작업자의 이동 동선을 분석하여 최적 경로 설계.\n효율적인 동선으로 작업 시간 단축 및 피로 감소.','작업 효율 15% 향상','pending',1,1,'2025-09-23 06:02:07',0),(2,'불량품 체크리스트 도입','생산 초기에 품질 체크리스트를 적용.\n작은 실수도 사전에 예방 가능.\n신규 직원 교육에도 활용 가능.','불량률 10% 감소','approved',2,2,'2025-09-23 06:02:07',0),(3,'설비 예지보전 시스템','센서를 활용해 설비 고장을 사전에 예측.\n실시간 설비 상태 모니터링 제공.\n장기적으로 유지비 절감과 가동률 향상 가능.','설비 가동률 20% 향상','pending',3,3,'2025-09-23 06:02:07',0),(4,'안전 보호구 착용 강화','작업장 입구에서 보호구 착용 여부 자동 감지 시스템 도입.\n미착용 시 경고 알림 제공.\n안전사고 예방과 안전문화 강화.','안전사고 30% 감소','rejected',4,4,'2025-09-23 06:02:07',0),(5,'신소재 연구 적용','고강도 신소재를 활용한 제품 경량화 방안.\n시제품 단계에서 테스트 진행.\n경쟁사 대비 제품 경쟁력 강화.','제품 경쟁력 강화','completed',2,5,'2025-09-23 06:02:07',0),(6,'자동재고 관리 시스템','재고량을 자동으로 체크하고 알람 발생.\n재고 부족 및 중복 방지.\n실시간 재고 현황 확인 가능.','재고 부족 문제 최소화','pending',1,6,'2025-09-23 06:02:07',0),(7,'작업표준서 개선','작업자별 표준 작업 매뉴얼 업데이트.\n품질 편차 최소화.\n작업 속도와 품질 향상 기대.','작업 속도 및 품질 향상','approved',2,7,'2025-09-23 06:02:07',0),(8,'설비 청소 주기 최적화','설비 청소 일정을 자동화하여 효율성 향상.\n불필요한 설비 중단 최소화.\n작업자 부담 감소 및 생산성 향상.','설비 다운타임 15% 감소','pending',3,8,'2025-09-23 06:02:07',0),(9,'품질 분석 자동 리포트','생산 중 품질 데이터를 자동 분석.\n관리자가 쉽게 확인 가능.\n관리자 업무 효율과 의사결정 속도 향상.','관리자 업무 효율 20% 향상','approved',4,9,'2025-09-23 06:02:07',0),(10,'작업 안전 알림 시스템','위험 구역 접근 시 알람 발생.\n근접 센서와 시각적 알림 제공.\n사고 예방 및 안전 의식 향상.','사고 예방 25% 향상','completed',1,10,'2025-09-23 06:02:07',0),(11,'사내 회의실 예약 시스템 개선','회의실 예약 현황을 실시간 확인할 수 있는 시스템 도입.\n예약 충돌 방지 기능 제공.\n모바일 앱과 대시보드 연동으로 편의성 향상.','회의 예약 충돌 최소화','pending',1,1,'2025-09-23 06:02:07',0),(12,'사내 복지 포인트 지급 확대','복지 포인트 지급 기준 확대 및 사용처 다양화.\n외부 제휴처까지 사용 가능.\n직원 만족도 및 참여도 향상.','직원 만족도 향상','approved',2,2,'2025-09-23 06:02:07',0),(13,'커피머신 추가 설치','휴게실에 커피머신을 추가 설치.\n대기 시간 감소 및 편의성 향상.\n직원 만족도 및 휴식 환경 개선.','휴식 편의성 향상','completed',3,3,'2025-09-23 06:02:07',0),(14,'사내 통신망 속도 개선','네트워크 장비 업그레이드 및 속도 최적화.\n화상회의 및 파일 전송 안정성 확보.\n업무 효율과 신뢰도 향상.','업무 효율 향상','pending',4,4,'2025-09-23 06:02:07',0),(15,'출근 시간 유연화 제도','유연근무제를 통해 출근 시간을 선택 가능하게 함.\n교통 체증과 피로 감소.\n업무 집중도와 직원 만족도 향상.','업무 집중도 향상','approved',1,5,'2025-09-23 06:02:07',0),(16,'사내 헬스장 보강','운동기구 추가 및 환경 개선.\n대기 시간 단축 및 편의성 향상.\n직원 건강 증진 및 참여율 증가.','직원 건강 증진','pending',2,6,'2025-09-23 06:02:07',0),(17,'온라인 휴가 신청 시스템 개선','휴가 신청 승인 프로세스 자동화.\n모바일 접근 및 알림 기능 제공.\n관리자 업무 효율과 직원 편의 향상.','관리자 업무 효율 향상','completed',3,7,'2025-09-23 06:02:07',0),(18,'사내 이벤트 개최','분기별 팀 단합 이벤트 개최.\n부서 간 교류 및 팀워크 강화.\n참여율과 사내 분위기 개선.','팀워크 향상','pending',4,8,'2025-09-23 06:02:07',0),(19,'직원 제안함 활성화','제안함 사용 독려 및 인센티브 제공.\n참여도 증대 및 개선 아이디어 확보.\n제안 처리 과정의 투명성 확보.','참여도 증가','approved',1,9,'2025-09-23 06:02:07',0),(20,'사내 메신저 알림 최적화','불필요 알림 제거 및 중요 메시지 강조.\n업무 집중도 향상.\n모바일 푸시 알림 및 우선순위 기능 적용.','업무 집중도 향상','pending',2,10,'2025-09-23 06:02:07',0),(51,'as','as','as','pending',NULL,NULL,'2025-09-24 01:04:25',0),(52,'a','a','a','pending',NULL,NULL,'2025-09-26 00:02:33',0),(53,'퇴근 시간을 당겨주세요','여섯 시 퇴근 너무  늦어요 아이들이 슬퍼합니다 ㅜㅜ','아이들과의 화목한 가정을 꾸릴 수 있습니다','pending',NULL,NULL,'2025-09-28 23:55:26',0),(54,'we','we','we','pending',NULL,NULL,'2025-09-29 06:02:38',0),(55,'bnbn','bnbnbn','bnbnbn','pending',NULL,NULL,'2025-09-29 07:14:12',0);
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'김현우','hkim','hashed_pw1','employee',1,'2025-09-23 23:40:15','활성'),(2,'이서연','sylee','hashed_pw2','employee',2,'2025-09-23 23:40:15','비활성'),(3,'박지훈','jhpark','hashed_pw3','manager',5,'2025-09-23 23:40:15','활성'),(4,'한지민','hjmin','hashed_pw7','employee',3,'2025-09-23 23:40:15','비활성'),(5,'최민정','mjchoi','hashed_pw5','employee',7,'2025-09-23 23:40:15','활성'),(6,'정우성','wsjung','hashed_pw6','employee',9,'2025-09-23 23:40:15','활성'),(7,'이가은','golee','hashed_pw7','employee',4,'2025-09-24 05:48:36','활성'),(8,'정민규','mjjoeng','hashed_pw8','employee',8,'2025-09-25 02:13:34','활성'),(9,'12','12','$2b$10$zhlRe2duyOiy5TEdlUsuVeY9nhMIkOA3SJkIepTvAckoHFDlOO7pm','employee',1,'2025-09-25 02:43:21','활성'),(10,'22','22','$2b$10$hTxhF141O03.NZrO6vMwH.YTNEQFraDRE0FstRtY.gSoHvP9wCRBy','employee',7,'2025-09-25 02:57:35','활성'),(11,'1212','1212','$2b$10$p8SCUwF79vdzxu0dngSOte9T0EubsDIoMq01tQ35FpVhri03HfBlS','manager',1,'2025-09-25 04:55:42','활성'),(12,'1111','1111','$2b$10$JvgkUiTq6ZQsH4Kg2UKlGOVpfauG4p87XYEQJyKmCMOE4lpLdiv6e','employee',9,'2025-09-25 05:00:02','활성'),(13,'2222','2222','$2b$10$CFEsWh2ndmbr5fH8yQSJXenxN/opKBHOAPVFJUrRK2iEAMGLfugPK','employee',9,'2025-09-25 05:00:43','활성'),(14,'3333','3333','$2b$10$d.3dNMpALIN1hxgN5tdvy.bLAAGSdxnxmDTfKwjNRDwmYNTdzy8LW','manager',3,'2025-09-25 05:02:15','활성'),(15,'22222','22222','$2b$10$nMtzzljvbtzjiqRcvpAd1uCUpNGwxHAi7Cy.bdTWFGPhq6VOe7cqK','manager',1,'2025-09-25 06:04:11','활성'),(16,'122','122','$2b$10$3/gs1qiptH4mguQUPURSuOqBO12m8mV1ODTmmzB/n5AeMlBEcH3.u','employee',1,'2025-09-29 06:12:45','활성'),(17,'5','5','$2b$10$F0gaFsCCGZ303SN7Ty3KgO0/6V0TPNvIp57RfzBLE7Z5Aav6/SQ7e','employee',1,'2025-09-29 06:30:06','활성'),(18,'6','6','$2b$10$ikaQX1N06EqzAtQnPsd7uOtEAaCZHDIKgRTBh7sv8Q2ce//C5qX5u','employee',7,'2025-09-29 06:44:55','활성'),(19,'333333','333333','$2b$10$0YohLmTRsw2ASsny07qaA.RuFZhun/FGlCTshy0U/uDWSpKBwcAQC','manager',8,'2025-09-29 06:50:27','활성'),(20,'12121212','12121212','$2b$10$zO86D5lo./5Z7oCGJaM4JuSWY2kudIitd3Wx.kFQyf.Qh5qGopp6u','manager',10,'2025-09-29 06:52:11','활성'),(21,'88','88','$2b$10$v6Yk9HyBMwnDcjuJv70/5.4GMc0c5eF6pyAzFzmaureRUVy4niRMa','manager',8,'2025-09-29 06:53:37','활성'),(22,'99','99','$2b$10$Z0EMcCJdhmWLr6Mz8k8LouQ7IZOT2vor4AWeJgoXx1TAIlphm1P4e','employee',3,'2025-09-29 07:50:11','활성'),(23,'s','123','$2b$10$r/1k2B18G0ow6q9VR5GINeMJgTZn1Y0m4qzqLbuernJgcmoP0Jd9G','employee',10,'2025-09-29 08:09:47','활성'),(24,'8888','8888','$2b$10$RtaKgnuPc5T4TEajB2qwou734KKlUxTKsV.ALFQyv/muRFoxKSxQG','manager',3,'2025-09-29 08:10:48','활성');
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vote`
--

LOCK TABLES `vote` WRITE;
/*!40000 ALTER TABLE `vote` DISABLE KEYS */;
INSERT INTO `vote` VALUES (29,1,5,NULL,'2025-09-26 00:22:24'),(30,1,7,NULL,'2025-09-29 23:51:28');
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

-- Dump completed on 2025-09-30 10:52:02
