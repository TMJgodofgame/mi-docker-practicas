FROM php:8.4-apache
RUN docker-php-ext-install pdo pdo_mysql
COPY ./index.html /var/www/html/index.html
COPY ./styles.css /var/www/html/styles.css
COPY ./script.js /var/www/html/script.js
COPY ./guardar_persona.php /var/www/html/guardar_persona.php
EXPOSE 80