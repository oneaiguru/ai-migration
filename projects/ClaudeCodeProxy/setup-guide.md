# Complete VPS and Local Setup Guide

This guide provides step-by-step instructions for setting up your environment, from initial VPS login to local configuration, including adding API keys and configuring all necessary components.

## Table of Contents
1. [VPS Initial Setup](#vps-initial-setup)
2. [Environment Configuration](#environment-configuration)
3. [Application Deployment](#application-deployment)
4. [API Key Integration](#api-key-integration)
5. [Local Development Setup](#local-development-setup)
6. [Testing and Verification](#testing-and-verification)
7. [Troubleshooting](#troubleshooting)

## VPS Initial Setup

### Logging into Your VPS

1. **SSH Access**:
   ```bash
   ssh username@your-vps-ip-address
   ```
   - Replace `username` with your VPS username (often `root` or the username provided by your VPS provider)
   - Replace `your-vps-ip-address` with the IP address of your VPS

2. **First-time Security Measures**:
   ```bash
   # Update system packages
   apt update && apt upgrade -y
   
   # Install essential security packages
   apt install fail2ban ufw -y
   
   # Configure firewall
   ufw allow ssh
   ufw allow http
   ufw allow https
   ufw enable
   
   # Change default SSH port (optional but recommended)
   nano /etc/ssh/sshd_config
   # Find the line with "Port 22" and change to another port (e.g., 2222)
   # Save and exit
   
   # Restart SSH service
   systemctl restart sshd
   ```

3. **Create a Non-root User** (if you logged in as root):
   ```bash
   # Create new user
   adduser yourusername
   
   # Add user to sudo group
   usermod -aG sudo yourusername
   
   # Switch to new user
   su - yourusername
   ```

## Environment Configuration

### Installing Required Software

1. **Basic Dependencies**:
   ```bash
   sudo apt update
   sudo apt install -y build-essential python3 python3-pip python3-dev python3-venv git nginx curl
   ```

2. **Python Virtual Environment**:
   ```bash
   # Navigate to your project directory
   mkdir -p ~/projects
   cd ~/projects
   
   # Clone your repository (if applicable)
   git clone https://your-repository-url.git
   cd your-project-name
   
   # Create and activate virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Database Setup** (if using PostgreSQL):
   ```bash
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Start and enable PostgreSQL service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Create database and user
   sudo -u postgres psql
   
   # In PostgreSQL prompt
   CREATE DATABASE yourdbname;
   CREATE USER yourdbuser WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE yourdbname TO yourdbuser;
   \q
   ```

## Application Deployment

### Setting Up Your Application

1. **Configuration File Setup**:
   ```bash
   # Navigate to your project directory
   cd ~/projects/your-project-name
   
   # Copy example config files
   cp config.example.py config.py
   cp .env.example .env
   
   # Edit configuration files
   nano config.py
   nano .env
   ```

2. **Configure Web Server (Nginx)**:
   ```bash
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/your-project
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/your-project /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Setting Up Process Manager (Supervisor)**:
   ```bash
   # Install Supervisor
   sudo apt install -y supervisor
   
   # Create config file
   sudo nano /etc/supervisor/conf.d/your-project.conf
   ```

   Add the following configuration:
   ```
   [program:your-project]
   directory=/home/yourusername/projects/your-project-name
   command=/home/yourusername/projects/your-project-name/venv/bin/gunicorn -b 127.0.0.1:8000 wsgi:app
   user=yourusername
   autostart=true
   autorestart=true
   stopasgroup=true
   killasgroup=true
   ```

   Update Supervisor:
   ```bash
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start your-project
   ```

## API Key Integration

### Obtaining and Configuring API Keys

1. **Create API Keys** for required services:
   - Visit the respective service websites to create accounts and obtain API keys:
     - For OpenAI: https://platform.openai.com/
     - For Anthropic: https://console.anthropic.com/
     - For Google Cloud: https://console.cloud.google.com/
     - For AWS: https://aws.amazon.com/console/

2. **Update Environment Variables**:
   ```bash
   # Edit .env file
   nano ~/projects/your-project-name/.env
   ```

   Add your API keys to the file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_API_KEY=your_google_api_key
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   ```

3. **Secure Your API Keys**:
   ```bash
   # Set proper permissions
   chmod 600 ~/projects/your-project-name/.env
   ```

4. **Restart Your Application**:
   ```bash
   sudo supervisorctl restart your-project
   ```

## Local Development Setup

### Setting Up Your Local Environment

1. **Clone Repository**:
   ```bash
   # On your local machine
   git clone https://your-repository-url.git
   cd your-project-name
   ```

2. **Set Up Virtual Environment**:
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure Local Environment**:
   ```bash
   # Copy example config files
   cp config.example.py config.py
   cp .env.example .env
   
   # Edit configuration files
   # Use your favorite editor to update these files
   ```

4. **Set Up Local Database** (if applicable):
   ```bash
   # If using SQLite (simple option)
   # No additional setup required
   
   # If using PostgreSQL locally
   # Install PostgreSQL for your OS and create database
   ```

5. **Configure Local-to-VPS Connection** (optional for development):
   ```bash
   # Add to your local SSH config
   nano ~/.ssh/config
   ```
   
   Add:
   ```
   Host your-project-vps
       HostName your-vps-ip-address
       User yourusername
       Port 22  # or your custom port
       IdentityFile ~/.ssh/your_private_key
   ```

## Testing and Verification

### Verifying Your Setup

1. **Test VPS Application**:
   ```bash
   # On VPS
   cd ~/projects/your-project-name
   source venv/bin/activate
   
   # Run application tests
   python -m unittest discover
   
   # Check logs
   sudo supervisorctl tail -f your-project
   ```

2. **Test Local Development Environment**:
   ```bash
   # On your local machine
   cd your-project-name
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   
   # Run development server
   python app.py  # or whatever your start command is
   ```

3. **Verify API Connections**:
   ```bash
   # Create a test script
   nano test_api.py
   ```
   
   Add:
   ```python
   import os
   import requests
   from dotenv import load_dotenv
   
   load_dotenv()
   
   # Test OpenAI API
   openai_key = os.getenv("OPENAI_API_KEY")
   response = requests.get(
       "https://api.openai.com/v1/models",
       headers={"Authorization": f"Bearer {openai_key}"}
   )
   print(f"OpenAI API Status: {response.status_code}")
   print(response.json())
   
   # Add similar tests for other APIs
   ```
   
   Run the test:
   ```bash
   python test_api.py
   ```

## Troubleshooting

### Common Issues and Solutions

1. **Application Won't Start**:
   ```bash
   # Check logs
   sudo supervisorctl tail -f your-project
   
   # Verify permissions
   sudo chown -R yourusername:yourusername ~/projects/your-project-name
   
   # Check if port is in use
   sudo lsof -i :8000
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database service
   sudo systemctl status postgresql
   
   # Verify connection details
   sudo -u postgres psql -c "SELECT 1;"
   ```

3. **API Key Problems**:
   ```bash
   # Verify environment variables are loaded
   source venv/bin/activate
   python -c "import os; print(os.getenv('OPENAI_API_KEY'))"
   
   # Check API key validity with simple request
   # Use test_api.py script from earlier
   ```

4. **Nginx Configuration Issues**:
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

---

Remember to keep your API keys and credentials secure. Never commit them to version control or share them in public forums. Regularly rotate your API keys as a security best practice.

For more detailed information about specific components, refer to the respective documentation for each service or tool.
