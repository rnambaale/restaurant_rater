-- Adminer 4.2.1 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `thumbnail` varchar(45) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `restaurants` (`ID`, `name`, `slug`, `location`, `thumbnail`, `status`, `created_on`) VALUES
(1,	'Restaurant One',	'rest-one',	'Kamwokya',	'',	1,	'2016-08-06 14:04:53'),
(2,	'Restaurant Two',	'rest-two',	'Ntinda',	'',	1,	'2016-08-06 14:05:12'),
(3,	'Restaurant Three',	'rest-three',	'Makerere',	'',	1,	'2016-08-06 14:05:30'),
(4,	'Restaurant Four',	'rest-four',	'Kikoni',	'',	1,	'2016-08-06 14:05:50');

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant` varchar(45) NOT NULL,
  `user` varchar(45) NOT NULL,
  `review` text NOT NULL,
  `rating` varchar(45) NOT NULL DEFAULT '0',
  `posted_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `reviews` (`ID`, `restaurant`, `user`, `review`, `rating`, `posted_on`) VALUES
(1,	'rest-one',	'1',	'Review One',	'0',	'2016-08-08 13:16:36'),
(2,	'rest-one',	'1',	'Review Two',	'0',	'2016-08-08 13:17:08'),
(3,	'rest-one',	'1',	'Review One Again',	'3',	'2016-08-08 13:54:23');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `f_name` varchar(50) NOT NULL,
  `l_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `activation_code` varchar(100) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `photo` varchar(45) NOT NULL,
  `signed_up` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `users` (`ID`, `f_name`, `l_name`, `email`, `password`, `activation_code`, `status`, `photo`, `signed_up`) VALUES
(1,	'Raymond',	'Nmabaale',	'rnambaale@cedat.mak.ac.ug',	'$2a$10$Br3m7XpRaXjq22/YC.6Yxu2brD3d6wJgMGm8zEIAsGE7VVotGpj7S',	'hrJyly93dM',	1,	'',	'2016-08-08 08:50:24');

-- 2016-08-08 16:08:13
