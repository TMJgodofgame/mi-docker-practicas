DROP DATABASE IF EXISTS minode;
CREATE DATABASE minode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE minode;

CREATE TABLE `User` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `l_name` VARCHAR(300) NOT NULL,
    `tall` DECIMAL(5,2) NOT NULL,
    `weight` DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (`id`)
);