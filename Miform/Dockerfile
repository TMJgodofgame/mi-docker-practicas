FROM php:8.4-apache
RUN docker-php-ext-install pdo pdo_mysql
RUN a2enmod rewrite

RUN cat > /etc/apache2/sites-available/000-default.conf <<'EOF'
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    RewriteEngine On

    RewriteRule ^/validar/?$ /guardar_persona.php [L]
    RewriteRule ^/personas/?$ /listar_personas.php [L]

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF
COPY templates/index.html /var/www/html/index.html
COPY templates/script.js /var/www/html/script.js
COPY Miform/guardar_persona.php /var/www/html/guardar_persona.php
COPY Miform/listar_personas.php /var/www/html/listar_personas.php
EXPOSE 80