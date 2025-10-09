# ✅ GoDaddy VPS Deployment Checklist

## 📋 Pre-Deployment Requirements

- [ ] GoDaddy VPS access (SSH credentials)
- [ ] VPS IP address
- [ ] Domain name registered
- [ ] Root or sudo access

---

## 🖥️ Server Preparation (On VPS)

### **1. System Updates**
```bash
ssh root@YOUR_VPS_IP
apt update && apt upgrade -y
```
- [ ] Connected to VPS via SSH
- [ ] System packages updated

### **2. Install Required Software**
```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Nginx
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# PM2 (optional, for process management)
npm install -g pm2
```
- [ ] Node.js 20.x installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Nginx installed and running (`systemctl status nginx`)

---

## 📦 File Upload

### **Choose ONE method:**

**Option A: SCP (Recommended)**
```bash
# On local machine
cd /tmp/cc-agent/57830216/project
tar -czf blindscloud.tar.gz --exclude='node_modules' --exclude='.git' .
scp blindscloud.tar.gz root@YOUR_VPS_IP:/var/www/

# On VPS
mkdir -p /var/www/blindscloud
cd /var/www
tar -xzf blindscloud.tar.gz -C blindscloud/
```

**Option B: FileZilla/WinSCP**
- Upload all files to `/var/www/blindscloud/`

**Option C: Git**
```bash
cd /var/www
git clone YOUR_REPO_URL blindscloud
```

- [ ] All project files uploaded to `/var/www/blindscloud/`
- [ ] `.env` file included with Supabase credentials

---

## 🔧 Application Setup (On VPS)

```bash
cd /var/www/blindscloud

# Install dependencies
npm install

# Build application
npm run build

# Verify dist folder exists
ls -la dist/

# Set permissions
chown -R www-data:www-data .
chmod -R 755 .
```

- [ ] Dependencies installed successfully
- [ ] Build completed without errors
- [ ] `dist/` folder created with files inside
- [ ] Permissions set correctly

---

## 🌐 Nginx Configuration

```bash
# Copy provided nginx config
cp nginx.conf /etc/nginx/sites-available/blindscloud

# Edit with your domain
nano /etc/nginx/sites-available/blindscloud
# Replace 'your-domain.com' with your actual domain

# Enable site
ln -s /etc/nginx/sites-available/blindscloud /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

- [ ] Nginx config file created
- [ ] Domain name updated in config
- [ ] Site enabled
- [ ] Nginx configuration test passed (`nginx -t`)
- [ ] Nginx reloaded

---

## 🔥 Firewall Setup

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
ufw status
```

- [ ] Firewall rules added
- [ ] Firewall enabled
- [ ] Can still access SSH (don't lock yourself out!)

---

## 🌍 DNS Configuration

**In GoDaddy DNS Manager:**

Add these records:
```
Type    Name    Value               TTL
A       @       YOUR_VPS_IP         600
A       www     YOUR_VPS_IP         600
```

- [ ] A record for @ pointing to VPS IP
- [ ] A record for www pointing to VPS IP
- [ ] Waited 10-60 minutes for DNS propagation
- [ ] DNS resolves correctly (`nslookup your-domain.com`)

---

## 🔐 SSL Certificate (HTTPS)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
certbot renew --dry-run
```

- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Nginx automatically configured for HTTPS
- [ ] Can access site via `https://your-domain.com`
- [ ] Auto-renewal tested

---

## 🧪 Testing

### **1. Check Services**
```bash
systemctl status nginx      # Should be active (running)
systemctl status ufw        # Should be active
```

### **2. Test Website**
- [ ] Open `http://your-domain.com` - Should redirect to HTTPS
- [ ] Open `https://your-domain.com` - Should show BlindsCloud login
- [ ] SSL certificate valid (green padlock in browser)
- [ ] No console errors in browser DevTools

### **3. Test Demo Accounts**
- [ ] Admin login works: admin@blindscloud.co.uk / password
- [ ] Business login works: business@blindscloud.co.uk / password
- [ ] Employee login works: employee@blindscloud.co.uk / password

### **4. Test Features**
- [ ] Dashboard loads correctly
- [ ] Can view users
- [ ] Can view customers
- [ ] Can view jobs
- [ ] Can view products
- [ ] Navigation works properly
- [ ] Responsive design works on mobile

---

## 🛡️ Security Hardening (Optional but Recommended)

```bash
# Disable root SSH login
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd

# Install Fail2Ban
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban

# Setup automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
```

- [ ] Root SSH login disabled (after creating another sudo user)
- [ ] Fail2Ban installed and running
- [ ] Automatic security updates enabled

---

## 💾 Backup Setup

```bash
# Make scripts executable
chmod +x /var/www/blindscloud/*.sh

# Test backup
cd /var/www/blindscloud
./backup.sh

# Setup daily backups (2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/blindscloud/backup.sh") | crontab -
```

- [ ] Backup script executable
- [ ] Manual backup tested successfully
- [ ] Daily automatic backups scheduled

---

## 📊 Monitoring Setup

### **1. Check Logs**
```bash
# Nginx error log
tail -f /var/log/nginx/error.log

# Nginx access log
tail -f /var/log/nginx/access.log

# System log
journalctl -xe
```

### **2. Resource Monitoring**
```bash
# Disk space
df -h

# Memory usage
free -h

# CPU and processes
htop  # (install with: apt install htop)
```

- [ ] Know how to check logs
- [ ] Sufficient disk space (at least 5GB free)
- [ ] Sufficient memory (at least 500MB free)

---

## 🎉 Post-Deployment

### **Your Live URLs:**
- Main site: `https://your-domain.com`
- Admin panel: `https://your-domain.com`

### **Deployment Scripts Ready:**
- Deploy updates: `./deploy.sh`
- Create backup: `./backup.sh`
- Restore backup: `./restore.sh`

### **Demo Accounts:**
1. **Admin:** admin@blindscloud.co.uk / password
2. **Business:** business@blindscloud.co.uk / password
3. **Employee:** employee@blindscloud.co.uk / password

---

## 🔄 Future Updates

**To deploy updates:**

1. Upload new files to VPS
2. Run deployment script:
```bash
cd /var/www/blindscloud
./deploy.sh
```

**Or manually:**
```bash
cd /var/www/blindscloud
git pull  # if using git
npm install
npm run build
systemctl reload nginx
```

---

## 🚨 Quick Troubleshooting

**Site not loading:**
```bash
systemctl status nginx
systemctl restart nginx
nginx -t
```

**502 Bad Gateway:**
```bash
tail -f /var/log/nginx/error.log
# Check if files exist in /var/www/blindscloud/dist/
```

**Permission errors:**
```bash
cd /var/www/blindscloud
chown -R www-data:www-data .
chmod -R 755 .
```

**Domain not resolving:**
```bash
nslookup your-domain.com
# Wait for DNS propagation (up to 48 hours)
```

---

## ✅ Final Verification

- [ ] Site loads at your domain with HTTPS
- [ ] All 3 demo accounts can login
- [ ] All features working correctly
- [ ] Responsive on mobile devices
- [ ] No console errors in browser
- [ ] SSL certificate valid and auto-renewing
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Know how to deploy updates

---

## 📞 Support Resources

- **Full Guide:** `GODADDY_VPS_DEPLOYMENT.md`
- **Quick Setup:** `QUICK_VPS_SETUP.md`
- **Nginx Config:** `nginx.conf`
- **Deployment Script:** `deploy.sh`
- **Backup Script:** `backup.sh`
- **Restore Script:** `restore.sh`

---

## 🎊 Congratulations!

Your BlindsCloud platform is now live on your GoDaddy VPS!

**What You've Achieved:**
✅ Full production deployment
✅ SSL/HTTPS security
✅ Supabase database connected
✅ All user roles functional
✅ Automated backups
✅ Professional nginx configuration
✅ Firewall protection

**Your platform is production-ready!** 🚀
