CREATE TABLE IF NOT EXISTS `holidays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserting some sample data just in case
INSERT INTO `holidays` (`date`, `name`) VALUES
('2026-01-01', 'New Year'),
('2026-12-25', 'Christmas Day')
ON DUPLICATE KEY UPDATE name=VALUES(name);
