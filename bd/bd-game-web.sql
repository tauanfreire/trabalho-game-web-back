CREATE DATABASE IF NOT EXISTS `game_web` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `game_web`;

DROP TABLE IF EXISTS `jogo_item_categoria`;
CREATE TABLE `jogo_item_categoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jogo_id` int(11) NOT NULL,
  `item` varchar(100) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jogo_id` (`jogo_id`),
  CONSTRAINT `jogo_item_categoria_ibfk_1` FOREIGN KEY (`jogo_id`) REFERENCES `jogos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `jogo_termo_definicao`;
CREATE TABLE `jogo_termo_definicao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jogo_id` int(11) NOT NULL,
  `termo` varchar(100) NOT NULL,
  `definicao` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jogo_id` (`jogo_id`),
  CONSTRAINT `jogo_termo_definicao_ibfk_1` FOREIGN KEY (`jogo_id`) REFERENCES `jogos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `jogos`;
CREATE TABLE `jogos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(30) NOT NULL,
  `descricao` text NOT NULL,
  `data_criacao` datetime DEFAULT current_timestamp(),
  `criador_id` int(11) DEFAULT NULL,
  `tipo_jogo` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `titulo` (`titulo`),
  KEY `criador_id` (`criador_id`),
  CONSTRAINT `jogos_ibfk_1` FOREIGN KEY (`criador_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `resultados`;
CREATE TABLE `resultados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `acertos` int(11) NOT NULL,
  `erros` int(11) NOT NULL,
  `tempo` time NOT NULL,
  `pontuacao` double(4,2) NOT NULL,
  `jogo_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `modo_jogo` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jogo_id` (`jogo_id`),
  KEY `fk_resultados_usuarios` (`usuario_id`),
  CONSTRAINT `fk_resultados_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `resultados_ibfk_1` FOREIGN KEY (`jogo_id`) REFERENCES `jogos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
