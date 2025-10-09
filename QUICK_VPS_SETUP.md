# ⚡ Quick VPS Setup - BlindsCloud (5 Minutes)

## 🎯 Fast Track Deployment

### **Step 1: Connect to Your VPS**
```bash
ssh root@your-vps-ip
```

### **Step 2: Run Auto-Install Script**

Copy and paste this entire block:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Nginx
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# Install PM2
npm install -g pm2

# Create project directory
mkdir -p /var/www/blindscloud
cd /var/www/blindscloud

echo "✅ Server ready! Now upload your files to /var/www/blindscloud"
```

### **Step 3: Upload Your Project**

**From your local machine:**

```bash
# Navigate to your project
cd /tmp/cc-agent/57830216/project

# Create deployment package
tar -czf blindscloud.tar.gz --exclude='node_modules' --exclude='.git' .

# Upload to VPS
scp blindscloud.tar.gz root@your-vps-ip:/var/www/

# Extract on VPS
ssh root@your-vps-ip "cd /var/www && tar -xzf blindscloud.tar.gz -C blindscloud/"
```

### **Step 4: Install & Build**

**On your VPS:**

```bash
cd /var/www/blindscloud

# Install dependencies
npm install

# Build application
npm run build

# Set permissions
chown -R www-data:www-data .
chmod -R 755 .
```

### **Step 5: Configure Nginx**

```bash
# Copy nginx config
cp nginx.conf /etc/nginx/sites-available/blindscloud

# Update domain name in the config
sed -i 's/your-domain.com/YOUR_ACTUAL_DOMAIN.com/g' /etc/nginx/sites-available/blindscloud

# Enable site
ln -s /etc/nginx/sites-available/blindscloud /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
```

### **Step 6: Setup Firewall**

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### **Step 7: Install SSL (HTTPS)**

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🎉 Done! Your site is live!

**Test it:** Open `https://your-domain.com`

**Login with:**
- Admin: admin@blindscloud.co.uk / password
- Business: business@blindscloud.co.uk / password
- Employee: employee@blindscloud.co.uk / password

---

## 🔄 Deploy Updates Later

```bash
cd /var/www/blindscloud
./deploy.sh
```

## 💾 Create Backup

```bash
cd /var/www/blindscloud
./backup.sh
```

## 📊 Monitor Logs

```bash
# Nginx errors
tail -f /var/log/nginx/error.log

# Nginx access
tail -f /var/log/nginx/access.log
```

---

## 🚨 Troubleshooting

**Problem:** Can't see website
```bash
systemctl status nginx
systemctl restart nginx
```

**Problem:** Permission denied
```bash
cd /var/www/blindscloud
chown -R www-data:www-data .
chmod -R 755 .
```

**Problem:** Domain not working
- Wait for DNS propagation (up to 48 hours)
- Check DNS: `nslookup your-domain.com`

---

**Need full guide?** See `GODADDY_VPS_DEPLOYMENT.md`
