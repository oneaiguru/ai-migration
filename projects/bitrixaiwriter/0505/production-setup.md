# Production Setup Guide

This guide provides instructions for setting up the Text Rewriter System in a production environment.

## Option 1: Standard PHP Setup

### Prerequisites

- PHP 8.0 or higher
- Composer
- Web server (Apache or Nginx)
- Access to Bitrix API
- Access to Claude API

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/text-rewriter.git
cd text-rewriter
```

2. **Install dependencies**

```bash
composer install --no-dev --optimize-autoloader
```

3. **Create and configure directories**

```bash
mkdir -p logs output
chmod 755 logs output
```

4. **Configure the application**

```bash
cp config/config.example.json config/config.json
nano config/config.json
```

Edit the configuration file with your API credentials.

5. **Set up the web server**

For Apache, add the following configuration to your virtual host:

```apache
<VirtualHost *:80>
    ServerName text-rewriter.yourdomain.com
    DocumentRoot /path/to/text-rewriter/web
    
    <Directory /path/to/text-rewriter/web>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/text-rewriter-error.log
    CustomLog ${APACHE_LOG_DIR}/text-rewriter-access.log combined
</VirtualHost>
```

For Nginx:

```nginx
server {
    listen 80;
    server_name text-rewriter.yourdomain.com;
    root /path/to/text-rewriter/web;
    
    location / {
        try_files $uri /index.html;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
```

6. **Run tests to verify the setup**

```bash
php test-run-script.php
```

7. **Set up scheduled tasks (cron jobs)**

```bash
# Example cron job to process 500 products every day at 2 AM
0 2 * * * php /path/to/text-rewriter/src/cli.php --action=process --limit=500 >> /path/to/text-rewriter/logs/cron.log 2>&1
```

## Option 2: Docker Setup

### Prerequisites

- Docker
- Docker Compose
- Access to Bitrix API
- Access to Claude API

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/text-rewriter.git
cd text-rewriter
```

2. **Create environment variables file**

```bash
cat > .env << EOF
CLAUDE_API_KEY=your_claude_api_key
TEXTRU_API_KEY=your_textru_api_key
BITRIX_LOGIN=your_bitrix_login
BITRIX_PASSWORD=your_bitrix_password
EOF
```

3. **Create docker directory**

```bash
mkdir -p docker
cp apache-config.conf docker/
cp docker-entrypoint.sh docker/
chmod +x docker/docker-entrypoint.sh
```

4. **Start the Docker containers**

```bash
docker-compose up -d
```

5. **Test the installation**

```bash
docker-compose exec text-rewriter php test-run-script.php
```

The web interface should now be accessible at http://localhost:8080/admin/

## Security Considerations

1. **Protect API keys**
   - Store API keys in environment variables, not in the code
   - Limit access to the configuration files

2. **Secure access to the web interface**
   - Use HTTPS
   - Implement authentication for the admin panel
   - Consider adding a basic authentication header:

```apache
<Directory /path/to/text-rewriter/web/admin>
    AuthType Basic
    AuthName "Restricted Area"
    AuthUserFile /path/to/.htpasswd
    Require valid-user
</Directory>
```

3. **File permissions**
   - Ensure proper file permissions:
   ```bash
   find /path/to/text-rewriter -type f -exec chmod 644 {} \;
   find /path/to/text-rewriter -type d -exec chmod 755 {} \;
   chmod 755 /path/to/text-rewriter/src/cli.php
   ```

4. **Logging and monitoring**
   - Monitor log files for errors
   - Set up log rotation for production logs
   - Consider implementing a monitoring solution:

```bash
# Example logrotate configuration
cat > /etc/logrotate.d/text-rewriter << EOF
/path/to/text-rewriter/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
EOF
```

## Production Optimizations

1. **PHP Optimization**
   - Install and configure OPcache
   - Optimize PHP-FPM or the equivalent for your setup

2. **Batch Processing**
   - Adjust the `batch_size` setting in config.json based on server capacity
   - Process large datasets during off-peak hours

3. **API Rate Limiting**
   - Implement rate limiting for API calls
   - Add exponential backoff for retries

## Troubleshooting

If you encounter issues, check:

1. **Logs**
   - Application logs in the `logs` directory
   - Web server error logs
   - PHP error logs

2. **Permissions**
   - Ensure the web server has write access to `logs` and `output` directories

3. **API Connectivity**
   - Test API connections with the test script
   - Check for firewall or network issues

For additional assistance, contact support at support@granin.com.
