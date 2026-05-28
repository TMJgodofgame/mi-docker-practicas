DROP DATABASE IF EXISTS web;
CREATE DATABASE web;
USE web;
CREATE TABLE personas(
    id INT auto_increment primary key,
    nombre varchar(50),
    apellidos varchar(50),
    altura decimal(3,2),
    peso decimal(5,2)
)