# 🚀 GoDaddy VPS Deployment Guide - BlindsCloud Platform

## 📋 Complete VPS Setup and Deployment

This guide will help you deploy the full BlindsCloud platform on your GoDaddy VPS server.

---

## 🎯 Prerequisites

### **What You Need:**
1. GoDaddy VPS with SSH access
2. Domain name (e.g., blindscloud.co.uk)
3. Root or sudo access to the server
4. Your VPS IP address

### **Recommended VPS Specs:**
- **OS:** Ubuntu 20.04/22.04 LTS or CentOS 7/8
- **RAM:** Minimum 2GB (4GB recommended)
- **CPU:** 2+ cores
- **Storage:** 20GB+ available space

---

## 📦 Step 1: Prepare Your VPS Server

### **A. Connect to Your VPS via SSH**

```bash
# From your local machine
ssh root@your-vps-ip-address

# Or if using a specific user
ssh username@your-vps-ip-address
```

### **B. Update System Packages**

```bash
# For Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# For CentOS/RHEL
sudo yum update -y
```

### **C. Install Node.js 20.x**

```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# For CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x or higher
```

### **D. Install Nginx (Web Server)**

```bash
# For Ubuntu/Debian
sudo apt install nginx -y

# For CentOS/RHEL
sudo yum install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### **E. Install PM2 (Process Manager)**

```bash
sudo npm install -g pm2
```

### **F. Install Git**

```bash
# For Ubuntu/Debian
sudo apt install git -y

# For CentOS/RHEL
sudo yum install git -y
```

---

## 📁 Step 2: Upload Your Project Files

### **Option A: Using SCP (From Your Local Machine)**

```bash
# Zip your project first
cd /path/to/project
tar -czf blindscloud.tar.gz .

# Upload to VPS
scp blindscloud.tar.gz root@your-vps-ip:/var/www/

# On VPS, extract files
ssh root@your-vps-ip
cd /var/www
mkdir -p blindscloud
tar -xzf blindscloud.tar.gz -C blindscloud/
cd blindscloud
```

### **Option B: Using Git (Recommended)**

```bash
# On your VPS
cd /var/www
git clone https://github.com/your-username/blindscloud.git
cd blindscloud

# Or if not using Git, create directory and upload files
mkdir -p /var/www/blindscloud
# Then use FTP/SFTP to upload your files
```

### **Option C: Using FileZilla/WinSCP (GUI Method)**

1. Download FileZilla: https://filezilla-project.org/
2. Connect to your VPS:
   - Host: sftp://your-vps-ip
   - Username: root (or your username)
   - Password: your-password
   - Port: 22
3. Navigate to `/var/www/` on the remote side
4. Upload your entire project folder

---

## 🔧 Step 3: Configure the Application

### **A. Set Up Environment Variables**

```bash
cd /var/www/blindscloud

# Create production environment file
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
EOF
```

### **B. Install Dependencies**

```bash
# Install frontend dependencies
npm install

# If you have a backend server
cd server
npm install
cd ..
```

### **C. Build the Application**

```bash
# Build frontend for production
npm run build

# This creates the dist/ folder with optimized files
```

---

## 🌐 Step 4: Configure Nginx

### **A. Create Nginx Configuration**

```bash
sudo nano /etc/nginx/sites-available/blindscloud
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/blindscloud/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

### **B. Enable the Site**

```bash
# For Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/blindscloud /etc/nginx/sites-enabled/

# For CentOS (if sites-enabled doesn't exist)
sudo mkdir -p /etc/nginx/sites-enabled
# Add to /etc/nginx/nginx.conf: include /etc/nginx/sites-enabled/*;

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔐 Step 5: Set Up SSL Certificate (HTTPS)

### **A. Install Certbot**

```bash
# For Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# For CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

### **B. Obtain SSL Certificate**

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts and certbot will automatically configure SSL.

### **C. Test Auto-Renewal**

```bash
sudo certbot renew --dry-run
```

---

## 🔥 Step 6: Set Up Firewall

```bash
# For Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# For CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

---

## 📍 Step 7: Point Your Domain to VPS

### **A. Update DNS Records at GoDaddy**

1. Log in to GoDaddy account
2. Go to Domain Manager
3. Click DNS for your domain
4. Update these records:

```dns
Type    Name    Value                   TTL
A       @       your-vps-ip-address     600
A       www     your-vps-ip-address     600
```

### **B. Wait for DNS Propagation**

DNS changes can take 1-48 hours. Check status:
```bash
nslookup your-domain.com
```

---

## ✅ Step 8: Verify Deployment

### **A. Check Application Status**

```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### **B. Test Your Website**

1. Open browser: `http://your-domain.com`
2. Should see BlindsCloud login page
3. Test with demo accounts:
   - Admin: admin@blindscloud.co.uk / password
   - Business: business@blindscloud.co.uk / password
   - Employee: employee@blindscloud.co.uk / password

---

## 🔄 Step 9: Deploy Updates (Future Updates)

### **A. Create Update Script**

```bash
nano /var/www/blindscloud/deploy.sh
```

**Paste this script:**

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
echo "🏗️ Building application..."
npm run build

# Restart Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```

**Make it executable:**

```bash
chmod +x /var/www/blindscloud/deploy.sh
```

### **B. Run Updates**

```bash
cd /var/www/blindscloud
./deploy.sh
```

---

## 🛡️ Step 10: Security Hardening

### **A. Disable Root SSH Login**

```bash
sudo nano /etc/ssh/sshd_config

# Change these lines:
PermitRootLogin no
PasswordAuthentication no  # If using SSH keys

# Restart SSH
sudo systemctl restart sshd
```

### **B. Set Up Automatic Security Updates**

```bash
# For Ubuntu/Debian
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### **C. Install Fail2Ban**

```bash
# For Ubuntu/Debian
sudo apt install fail2ban -y

# For CentOS/RHEL
sudo yum install fail2ban -y

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📊 Step 11: Monitoring & Maintenance

### **A. Monitor Disk Space**

```bash
df -h
```

### **B. Monitor Memory Usage**

```bash
free -h
```

### **C. Check System Logs**

```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -xe
```

### **D. Set Up Daily Backups**

```bash
# Create backup script
cat > /root/backup-blindscloud.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/blindscloud_$DATE.tar.gz /var/www/blindscloud

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs rm -f
EOF

chmod +x /root/backup-blindscloud.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-blindscloud.sh") | crontab -
```

---

## 🚨 Troubleshooting

### **Issue: 502 Bad Gateway**

```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### **Issue: Application Not Loading**

```bash
# Check if files exist
ls -la /var/www/blindscloud/dist/

# Rebuild application
cd /var/www/blindscloud
npm run build

# Check Nginx configuration
sudo nginx -t
```

### **Issue: Permission Denied**

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/blindscloud

# Fix permissions
sudo chmod -R 755 /var/www/blindscloud
```

### **Issue: Domain Not Resolving**

```bash
# Check DNS
nslookup your-domain.com

# Flush DNS cache locally
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

---

## 📝 Quick Reference Commands

```bash
# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx status
sudo systemctl status nginx

# Rebuild application
cd /var/www/blindscloud && npm run build

# Update SSL certificate
sudo certbot renew

# Check disk space
df -h

# Check memory
free -h

# Monitor system resources
htop
```

---

## 🎉 Your BlindsCloud Platform is Now Live!

### **Access Your Platform:**

- **Live URL:** `https://your-domain.com`
- **Admin Panel:** `https://your-domain.com` (login as admin)
- **Supabase Database:** Connected and ready
- **SSL Secured:** HTTPS enabled

### **Demo Accounts:**

1. **Admin:** admin@blindscloud.co.uk / password
2. **Business:** business@blindscloud.co.uk / password
3. **Employee:** employee@blindscloud.co.uk / password

### **What's Configured:**

✅ Nginx web server optimized for production
✅ SSL certificate with auto-renewal
✅ Firewall configured
✅ Supabase database connected
✅ All 3 user roles working with proper permissions
✅ Static files cached for performance
✅ Security headers enabled
✅ Gzip compression active

---

## 📧 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS propagation: `nslookup your-domain.com`
4. Ensure all services are running: `sudo systemctl status nginx`

**Your platform is production-ready and fully functional!**
