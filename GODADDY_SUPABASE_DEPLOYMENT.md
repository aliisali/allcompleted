# Complete Deployment Guide: GoDaddy Linux VPS + Supabase

This guide will walk you through deploying your BlindsCloud application to a GoDaddy Linux server with Supabase database.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ GoDaddy Linux VPS with root/sudo access
- ✅ Supabase account (https://supabase.com)
- ✅ Domain name pointed to your VPS IP
- ✅ SSH access to your server
- ✅ Application source code

---

## Part 1: Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: blindscloud-production
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier or Pro

4. Wait 2-3 minutes for project creation

### Step 2: Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them later):
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (keep secret!)
   ```

3. Go to **Project Settings** → **Database**
4. Copy:
   ```
   Connection String: postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 3: Run Database Migrations

You have two options to run migrations:

#### Option A: Using Supabase Web Interface

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy and paste the migration files from `supabase/migrations/` in order:
   - Start with the earliest dated file
   - Run each migration one by one
   - Click "Run" for each

#### Option B: Using Supabase CLI (Recommended)

```bash
# On your local machine
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Step 4: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. Verify these tables exist:
   - `users`
   - `businesses`
   - `jobs`
   - `customers`
   - `products`
   - `notifications`

3. Check that Row Level Security (RLS) is enabled on all tables

---

## Part 2: GoDaddy Server Setup

### Step 1: Connect to Your Server

```bash
ssh root@your-server-ip
# Or if using a non-root user:
ssh username@your-server-ip
```

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Install Node.js 20.x

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 9.x.x or higher
```

### Step 4: Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 6: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check firewall status
sudo ufw status
```

---

## Part 3: Deploy Application

### Step 1: Create Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/blindscloud
cd /var/www/blindscloud

# Set ownership
sudo chown -R $USER:$USER /var/www/blindscloud
```

### Step 2: Upload Application Files

You have three options:

#### Option A: Using Git (Recommended)

```bash
cd /var/www/blindscloud

# If you have a git repository
git clone https://github.com/yourusername/blindscloud.git .

# Or initialize and pull
git init
git remote add origin https://github.com/yourusername/blindscloud.git
git pull origin main
```

#### Option B: Using SCP from Local Machine

```bash
# From your local machine
cd /path/to/your/project
tar -czf blindscloud.tar.gz .
scp blindscloud.tar.gz username@your-server-ip:/var/www/blindscloud/

# On server
cd /var/www/blindscloud
tar -xzf blindscloud.tar.gz
rm blindscloud.tar.gz
```

#### Option C: Using SFTP (FileZilla)

1. Download FileZilla
2. Connect to your server:
   - Host: sftp://your-server-ip
   - Username: your-username
   - Password: your-password
   - Port: 22
3. Upload all files to `/var/www/blindscloud/`

### Step 3: Create Environment File

```bash
cd /var/www/blindscloud

# Create .env file
nano .env
```

Paste this content (replace with YOUR values):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...

# Production Settings
NODE_ENV=production
VITE_API_URL=https://yourdomain.com/api

# Optional: If you have service role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key...
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### Step 4: Install Dependencies and Build

```bash
cd /var/www/blindscloud

# Install dependencies
npm install --production=false

# Build the application
npm run build

# Verify build
ls -la dist/  # Should see index.html and assets/
```

### Step 5: Start Application with PM2

```bash
cd /var/www/blindscloud

# Start with PM2
pm2 start npm --name "blindscloud" -- start

# Or if you have a server component:
# pm2 start npm --name "blindscloud-server" -- run start:server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs

# Check status
pm2 status
pm2 logs blindscloud
```

---

## Part 4: Configure Nginx

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/blindscloud
```

Paste this configuration (replace `yourdomain.com` with your domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/blindscloud/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Handle API requests (if you have a backend)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

    # Handle AR camera page
    location /ar-camera.html {
        try_files $uri =404;
    }
}
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### Step 2: Enable Site and Test Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/blindscloud /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Part 5: SSL Certificate (HTTPS)

### Step 1: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Get SSL Certificate

```bash
# Get certificate for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)
```

### Step 3: Test Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# If successful, certbot will auto-renew before expiry
```

---

## Part 6: Create Default Admin User

You need to create an admin user in Supabase:

### Option A: Using Supabase SQL Editor

```sql
-- Go to SQL Editor in Supabase dashboard and run:

INSERT INTO users (
  id,
  name,
  email,
  password,
  role,
  business_id,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@blindscloud.com',
  'admin123',  -- Change this password after first login!
  'admin',
  NULL,
  true,
  now()
);
```

### Option B: Using psql

```bash
# Connect to Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Run the INSERT query above
```

---

## Part 7: Testing Your Deployment

### Step 1: Test Domain Access

```bash
# From your local machine
curl -I https://yourdomain.com

# Should return 200 OK
```

### Step 2: Test in Browser

1. Open browser and go to: `https://yourdomain.com`
2. You should see the login page
3. Login with:
   - Email: `admin@blindscloud.com`
   - Password: `admin123`

### Step 3: Verify Supabase Connection

1. After logging in, check browser console (F12)
2. Look for Supabase connection logs
3. Try creating a test job or customer
4. Verify data appears in Supabase Table Editor

---

## Part 8: Post-Deployment Tasks

### 1. Change Default Admin Password

```sql
-- In Supabase SQL Editor
UPDATE users
SET password = 'YourNewSecurePassword123!'
WHERE email = 'admin@blindscloud.com';
```

### 2. Set Up Monitoring

```bash
# Monitor application logs
pm2 logs blindscloud

# Monitor Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor system resources
pm2 monit
```

### 3. Set Up Automated Backups

```bash
# Create backup script
nano ~/backup-blindscloud.sh
```

Paste:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/blindscloud"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/blindscloud

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:

```bash
chmod +x ~/backup-blindscloud.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /root/backup-blindscloud.sh
```

### 4. Set Up Supabase Database Backups

Supabase automatically backs up your database, but you can also:

1. Go to **Database** → **Backups** in Supabase dashboard
2. Enable **Point in Time Recovery** (Pro plan)
3. Or manually export using:

```bash
# Manual backup
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql
```

---

## Part 9: Updating Your Application

When you need to deploy updates:

```bash
# Connect to server
ssh username@your-server-ip

# Navigate to app directory
cd /var/www/blindscloud

# Pull latest changes (if using git)
git pull origin main

# Or upload new files via SCP/SFTP

# Install any new dependencies
npm install

# Rebuild application
npm run build

# Restart PM2
pm2 restart blindscloud

# Clear Nginx cache (if applicable)
sudo systemctl reload nginx
```

---

## Part 10: Troubleshooting

### Issue: Application Not Loading

```bash
# Check PM2 status
pm2 status
pm2 logs blindscloud

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Database Connection Errors

1. Verify `.env` file has correct Supabase credentials
2. Check Supabase project is active (not paused)
3. Verify RLS policies allow access
4. Check browser console for specific errors

### Issue: 502 Bad Gateway

```bash
# Check if application is running
pm2 status

# Restart application
pm2 restart blindscloud

# Check ports
sudo netstat -tlnp | grep :5173
sudo netstat -tlnp | grep :3000
```

### Issue: Permission Denied

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/blindscloud/dist
sudo chmod -R 755 /var/www/blindscloud/dist
```

### Issue: SSL Certificate Problems

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## Part 11: Security Best Practices

### 1. Secure SSH

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change these settings:
PermitRootLogin no
PasswordAuthentication no
Port 2222  # Change from default 22

# Restart SSH
sudo systemctl restart ssh
```

### 2. Keep System Updated

```bash
# Create update script
sudo nano /root/update-system.sh
```

Paste:

```bash
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
```

Make executable and schedule:

```bash
sudo chmod +x /root/update-system.sh

# Add to crontab (weekly on Sunday at 3 AM)
sudo crontab -e
0 3 * * 0 /root/update-system.sh
```

### 3. Monitor Failed Login Attempts

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Rate Limiting in Nginx

Add to your Nginx config:

```nginx
# Add before server block
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

# Inside server block
location / {
    limit_req zone=one burst=20 nodelay;
    try_files $uri $uri/ /index.html;
}
```

---

## Part 12: Performance Optimization

### 1. Enable Nginx Caching

```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:

```nginx
# Cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g
                 inactive=60m use_temp_path=off;
```

### 2. Enable HTTP/2

In your site config:

```nginx
listen 443 ssl http2;
```

### 3. Optimize PM2

```bash
# Use cluster mode for better performance
pm2 delete blindscloud
pm2 start npm --name "blindscloud" -i max -- start

# Save configuration
pm2 save
```

---

## Quick Reference Commands

### Useful PM2 Commands
```bash
pm2 list                    # List all processes
pm2 logs blindscloud        # View logs
pm2 restart blindscloud     # Restart application
pm2 stop blindscloud        # Stop application
pm2 delete blindscloud      # Remove from PM2
pm2 monit                   # Monitor resources
```

### Useful Nginx Commands
```bash
sudo nginx -t               # Test configuration
sudo systemctl reload nginx # Reload configuration
sudo systemctl restart nginx # Restart Nginx
sudo systemctl status nginx # Check status
```

### Useful System Commands
```bash
df -h                       # Check disk space
free -m                     # Check memory
top                         # Check CPU usage
sudo ufw status            # Check firewall
```

---

## Environment Variables Reference

Your `.env` file should contain:

```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Application Settings
NODE_ENV=production
VITE_API_URL=https://yourdomain.com/api

# Optional
VITE_APP_NAME=BlindsCloud
VITE_APP_VERSION=1.3.0
```

---

## Support and Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **GoDaddy VPS Support**: https://www.godaddy.com/help

---

## Deployment Checklist

Use this checklist to ensure everything is set up:

- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Tables verified in Supabase
- [ ] RLS policies enabled
- [ ] GoDaddy server accessible via SSH
- [ ] Node.js 20.x installed
- [ ] Nginx installed and running
- [ ] PM2 installed
- [ ] Application files uploaded
- [ ] .env file created with correct credentials
- [ ] Dependencies installed
- [ ] Application built successfully
- [ ] PM2 process running
- [ ] Nginx configured correctly
- [ ] SSL certificate installed
- [ ] Domain resolves to server IP
- [ ] Application accessible via HTTPS
- [ ] Admin user created in database
- [ ] Can login to application
- [ ] Database operations working
- [ ] Backups configured
- [ ] Monitoring set up

---

**Congratulations!** 🎉 Your BlindsCloud application is now deployed on GoDaddy with Supabase database!

For any issues, check the troubleshooting section or review the logs.
