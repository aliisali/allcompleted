# Complete GoDaddy Linux VPS Deployment Guide

## Overview
This guide will help you deploy the BlindsCloud Platform to your GoDaddy Linux VPS with Supabase database.

## Prerequisites
- GoDaddy Linux VPS with root/sudo access
- Domain name (optional, but recommended)
- SSH access to your VPS
- Basic knowledge of Linux commands

---

## Part 1: VPS Setup & Prerequisites

### 1. Connect to Your VPS via SSH

```bash
ssh root@your-vps-ip-address
# Or if you have a non-root user:
ssh username@your-vps-ip-address
```

### 2. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Install Node.js (v20.x)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 4. Install Nginx (Web Server)

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Check if Nginx is running
sudo systemctl status nginx
```

### 5. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 6. Install Git (if not already installed)

```bash
sudo apt install git -y
```

---

## Part 2: Project Deployment

### 1. Create Application Directory

```bash
# Create directory for your app
sudo mkdir -p /var/www/blindscloud
cd /var/www/blindscloud
```

### 2. Upload Project Files

You have several options:

#### Option A: Using Git (Recommended)
```bash
# If your project is in a Git repository
git clone https://github.com/yourusername/your-repo.git .
```

#### Option B: Using SCP (from your local machine)
```bash
# From your local machine, run:
scp -r /path/to/your/project/* username@your-vps-ip:/var/www/blindscloud/
```

#### Option C: Using FTP/SFTP
- Use FileZilla or any FTP client
- Connect to your VPS using SFTP
- Upload all project files to `/var/www/blindscloud/`

### 3. Set Up Environment Variables

```bash
cd /var/www/blindscloud

# Create .env file
nano .env
```

Add the following content (use your actual Supabase credentials):

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api

# Production mode
NODE_ENV=production

# Supabase Configuration (DO NOT CHANGE - Your database is already set up)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXBlbGVtdGhzYnZubWN4dHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDkwMTQsImV4cCI6MjA3NTAyNTAxNH0.2HYOJ4dEqShETWVrH9UYa9yB01jRh0_X-07_ck-RLdA
VITE_SUPABASE_URL=https://ydypelemthsbvnmcxtrl.supabase.co

# Port (optional)
PORT=3001
```

Save and exit (CTRL+X, then Y, then Enter)

### 4. Install Dependencies

```bash
npm install
```

### 5. Build the Application

```bash
npm run build
```

This will create a `dist` folder with your production files.

### 6. Set Correct Permissions

```bash
sudo chown -R $USER:$USER /var/www/blindscloud
sudo chmod -R 755 /var/www/blindscloud
```

---

## Part 3: Nginx Configuration

### 1. Create Nginx Configuration File

```bash
sudo nano /etc/nginx/sites-available/blindscloud
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;

    # Replace with your domain or use your VPS IP
    server_name your-domain.com www.your-domain.com;
    # Or if no domain: server_name your-vps-ip-address;

    root /var/www/blindscloud/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable access to .env and other sensitive files
    location ~ /\. {
        deny all;
    }
}
```

Save and exit (CTRL+X, then Y, then Enter)

### 2. Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/blindscloud /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test is successful, reload Nginx
sudo systemctl reload nginx
```

---

## Part 4: Firewall Configuration

### 1. Configure UFW Firewall

```bash
# Allow SSH (important - don't skip this!)
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future SSL setup)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Part 5: Database Configuration

**IMPORTANT**: Your Supabase database is already set up and running! You don't need to install or configure any database on your VPS.

### Database Details (Already Configured):
- **Database URL**: https://ydypelemthsbvnmcxtrl.supabase.co
- **Database Type**: Supabase (PostgreSQL)
- **Location**: Cloud-hosted (managed by Supabase)

Your application will connect to this cloud database automatically using the credentials in your `.env` file.

### What This Means:
- ✅ No database installation needed on VPS
- ✅ No database backup configuration needed on VPS
- ✅ Automatic backups handled by Supabase
- ✅ Database accessible from anywhere
- ✅ High availability and reliability

---

## Part 6: SSL Certificate (Optional but Recommended)

### Install Let's Encrypt SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts and enter your email
```

Certbot will automatically configure Nginx for HTTPS and set up auto-renewal.

---

## Part 7: Monitoring & Maintenance

### 1. Set Up Automatic Updates (Optional)

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 2. Monitor Nginx Logs

```bash
# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### 3. Check Nginx Status

```bash
sudo systemctl status nginx
```

---

## Part 8: Deployment Updates

### When You Need to Update Your Application:

```bash
# Navigate to project directory
cd /var/www/blindscloud

# Pull latest changes (if using Git)
git pull origin main

# Or upload new files via SCP/FTP

# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

---

## Part 9: Quick Deployment Script

Create a deployment script for easy updates:

```bash
nano /var/www/blindscloud/deploy.sh
```

Add this content:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/blindscloud

# Pull latest changes (if using Git)
# git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Set permissions
echo "🔒 Setting permissions..."
sudo chown -R $USER:$USER /var/www/blindscloud
sudo chmod -R 755 /var/www/blindscloud

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```

Make it executable:

```bash
chmod +x /var/www/blindscloud/deploy.sh
```

Run it anytime you need to deploy updates:

```bash
./deploy.sh
```

---

## Part 10: Troubleshooting

### Application Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Permission Issues

```bash
cd /var/www/blindscloud
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/
```

### Port Already in Use

```bash
# Check what's using port 80
sudo netstat -tulpn | grep :80

# Kill the process if needed
sudo kill -9 <PID>
```

### Cannot Connect to Database

Check your `.env` file has the correct Supabase credentials. The database is cloud-hosted, so VPS firewall won't affect it.

---

## Part 11: Accessing Your Application

### Via IP Address
```
http://your-vps-ip-address
```

### Via Domain Name (if configured)
```
http://your-domain.com
https://your-domain.com (if SSL is set up)
```

---

## Part 12: Important Security Notes

1. **Change Default Passwords**: Ensure all default passwords are changed
2. **Keep System Updated**: Regularly run `sudo apt update && sudo apt upgrade`
3. **Monitor Logs**: Regularly check Nginx logs for suspicious activity
4. **Backup Configuration**: Keep backups of your Nginx config and .env file
5. **Use HTTPS**: Always use SSL certificates in production

---

## Part 13: Default Login Credentials

After deployment, you can log in with any user you've created in the system. If you need to create an admin user through Supabase:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: ydypelemthsbvnmcxtrl
3. Go to Table Editor → users
4. Insert a new row with admin credentials

---

## Summary

Your application is now deployed with:
- ✅ Static files served by Nginx
- ✅ Cloud-hosted Supabase database (no local DB needed)
- ✅ Proper file permissions and security
- ✅ Optional SSL certificate
- ✅ Firewall configured
- ✅ Easy update deployment script

For support with your GoDaddy VPS, contact GoDaddy support or refer to their documentation.

---

## Support & Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Let's Encrypt**: https://letsencrypt.org/

Good luck with your deployment! 🚀
