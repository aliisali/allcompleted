# Quick Deployment Checklist for GoDaddy VPS

## Pre-Deployment
- [ ] Have SSH access to your VPS
- [ ] Know your VPS IP address
- [ ] Have domain name ready (optional)
- [ ] Supabase credentials ready (already in .env)

## Step-by-Step Deployment (15-30 minutes)

### 1. Connect to VPS (2 min)
```bash
ssh root@your-vps-ip
```

### 2. Install Required Software (5 min)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### 3. Create App Directory (1 min)
```bash
sudo mkdir -p /var/www/blindscloud
cd /var/www/blindscloud
```

### 4. Upload Your Project Files (5 min)
Choose ONE method:

**Method A: SCP from your computer**
```bash
# Run this from YOUR COMPUTER (not VPS)
scp -r /path/to/your/project/* root@your-vps-ip:/var/www/blindscloud/
```

**Method B: Git**
```bash
# Run this on VPS
git clone your-git-repo-url .
```

**Method C: FTP Client**
- Use FileZilla
- Connect to your VPS IP via SFTP
- Upload all files to `/var/www/blindscloud/`

### 5. Configure Environment (2 min)
```bash
cd /var/www/blindscloud

# Your .env file is already configured with Supabase!
# Just verify it exists:
cat .env
```

### 6. Build Application (3 min)
```bash
npm install
npm run build
```

### 7. Configure Nginx (3 min)
```bash
sudo nano /etc/nginx/sites-available/blindscloud
```

Paste this (replace YOUR_VPS_IP with your actual IP):
```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;
    root /var/www/blindscloud/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Save (CTRL+X, Y, Enter), then:
```bash
sudo ln -s /etc/nginx/sites-available/blindscloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Configure Firewall (2 min)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9. Access Your Site (1 min)
Open browser: `http://YOUR_VPS_IP`

## Done! 🎉

Your application is live at: `http://YOUR_VPS_IP`

---

## Quick Update Process (When You Change Code)

```bash
# 1. Connect to VPS
ssh root@your-vps-ip

# 2. Navigate to project
cd /var/www/blindscloud

# 3. Upload new files (or git pull)
# ... upload your changes ...

# 4. Rebuild
npm install
npm run build

# 5. Reload Nginx
sudo systemctl reload nginx
```

---

## Important Notes

### Database
✅ **Your database is already configured!**
- Hosted on Supabase (cloud)
- No installation needed on VPS
- Automatically accessible
- Credentials in `.env` file

### Domain Name (Optional)
To use a custom domain:
1. Point your domain's A record to your VPS IP
2. Update Nginx config: change `YOUR_VPS_IP` to `yourdomain.com`
3. Get SSL certificate: `sudo certbot --nginx -d yourdomain.com`

### Troubleshooting

**Can't access site?**
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
```

**Permission errors?**
```bash
sudo chown -R $USER:$USER /var/www/blindscloud
sudo chmod -R 755 /var/www/blindscloud
```

**View logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## Support

For detailed explanations, see: `GODADDY_VPS_DEPLOYMENT_GUIDE.md`

Questions about:
- **VPS/Server**: Contact GoDaddy Support
- **Database**: Supabase Dashboard (https://supabase.com/dashboard)
- **Application**: Check application logs and error messages
