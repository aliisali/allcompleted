# Quick Deploy Guide - GoDaddy + Supabase

**Time Required**: ~30 minutes

---

## 🚀 Fast Track Deployment

### 1️⃣ Supabase Setup (5 minutes)

```bash
# Go to https://supabase.com
# Create new project → Save these values:

Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGc...
Service Key: eyJhbGc...
```

**Run migrations:**
- Go to SQL Editor in Supabase
- Copy/paste each file from `supabase/migrations/`
- Run them in order (oldest first)

---

### 2️⃣ Server Setup (10 minutes)

```bash
# SSH into your GoDaddy server
ssh root@your-server-ip

# Quick install script - Run all at once:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt update && \
sudo apt install -y nodejs nginx && \
sudo npm install -g pm2 && \
sudo ufw allow OpenSSH && \
sudo ufw allow 'Nginx Full' && \
sudo ufw --force enable
```

---

### 3️⃣ Deploy App (10 minutes)

```bash
# Create directory
sudo mkdir -p /var/www/blindscloud
cd /var/www/blindscloud
sudo chown -R $USER:$USER /var/www/blindscloud

# Upload your files (choose one method):
# Method A: Git
git clone https://github.com/yourusername/blindscloud.git .

# Method B: SCP from local machine
# scp -r /path/to/project/* username@server-ip:/var/www/blindscloud/

# Create .env file
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
NODE_ENV=production
EOF

# Build and start
npm install && \
npm run build && \
pm2 start npm --name "blindscloud" -- start && \
pm2 save && \
pm2 startup
```

---

### 4️⃣ Configure Nginx (3 minutes)

```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/blindscloud << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/blindscloud/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/blindscloud /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

### 5️⃣ Add SSL (2 minutes)

```bash
# Install Certbot and get certificate
sudo apt install -y certbot python3-certbot-nginx && \
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos -m your@email.com
```

---

### 6️⃣ Create Admin User

```sql
-- Go to Supabase SQL Editor and run:

INSERT INTO users (id, name, email, password, role, is_active, created_at)
VALUES (gen_random_uuid(), 'Admin', 'admin@blindscloud.com', 'admin123', 'admin', true, now());
```

---

## ✅ Test Your Deployment

```bash
# Check if everything is running
pm2 status
sudo systemctl status nginx

# Visit your site
https://yourdomain.com

# Login with:
# Email: admin@blindscloud.com
# Password: admin123
```

---

## 🔄 Update Deployment

```bash
cd /var/www/blindscloud
git pull origin main        # Or upload new files
npm install
npm run build
pm2 restart blindscloud
```

---

## 🆘 Quick Troubleshooting

```bash
# App not loading?
pm2 logs blindscloud

# Nginx issues?
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Database errors?
# Check .env has correct Supabase credentials

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

---

## 📱 Important Files

```
/var/www/blindscloud/          # App directory
/var/www/blindscloud/.env      # Environment variables
/etc/nginx/sites-available/    # Nginx config
/var/log/nginx/                # Nginx logs
~/.pm2/logs/                   # PM2 logs
```

---

## 🔐 Security Checklist

- [ ] Change admin password after first login
- [ ] Update `.env` with real Supabase keys
- [ ] Enable RLS on all Supabase tables
- [ ] Set up automated backups
- [ ] Configure fail2ban: `sudo apt install fail2ban`

---

## 📞 Need Help?

See `GODADDY_SUPABASE_DEPLOYMENT.md` for detailed guide.

**Common Issues:**
- **502 Error**: Check `pm2 status` - app might be stopped
- **404 Error**: Check Nginx config and file paths
- **Database Error**: Verify Supabase credentials in `.env`
- **Permission Error**: Run `sudo chown -R www-data:www-data /var/www/blindscloud/dist`

---

**Done!** 🎉 Your app is live at https://yourdomain.com
