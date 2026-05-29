DROP DATABASE IF EXISTS minode;
CREATE DATABASE minode;
USE minode;
CREATE TABLE User(
    'name' VARCHAR(100),
    l_name VARCHAR(300),
    tall DECIMAL(3,2),
    'weight' DECIMAL(5,2),
    PRIMARY KEY('name', l_name, tall, 'weight')
)