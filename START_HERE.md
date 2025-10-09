# 🚀 START HERE - Deploy BlindsCloud to Your GoDaddy VPS

## 📂 What You Have

Your complete BlindsCloud platform ready for deployment:

```
✅ Full React application (built and tested)
✅ Supabase database (connected and configured)
✅ All 3 user roles working (Admin, Business, Employee)
✅ Row Level Security (RLS) properly configured
✅ Deployment scripts ready
✅ Nginx configuration included
✅ Complete documentation
```

---

## 🎯 Choose Your Path

### **⚡ FAST TRACK (5 minutes)**
For experienced users who want to deploy quickly.

👉 **Read:** `QUICK_VPS_SETUP.md`

---

### **📖 COMPLETE GUIDE (15 minutes)**
Step-by-step instructions with explanations.

👉 **Read:** `GODADDY_VPS_DEPLOYMENT.md`

---

### **✅ CHECKLIST METHOD (Recommended)**
Follow a detailed checklist to ensure nothing is missed.

👉 **Read:** `VPS_DEPLOYMENT_CHECKLIST.md`

---

## 🔑 What You Need

Before starting, make sure you have:

1. **GoDaddy VPS Access**
   - SSH credentials (username/password or SSH key)
   - VPS IP address
   - Root or sudo access

2. **Domain Name**
   - Already registered
   - Access to DNS settings

3. **Basic Knowledge**
   - How to SSH into a server
   - Basic command line familiarity

---

## 📦 Deployment Files Included

| File | Purpose | Size |
|------|---------|------|
| `GODADDY_VPS_DEPLOYMENT.md` | Complete step-by-step guide | 12KB |
| `QUICK_VPS_SETUP.md` | Fast 5-minute setup | 3KB |
| `VPS_DEPLOYMENT_CHECKLIST.md` | Deployment checklist | 8KB |
| `nginx.conf` | Nginx web server config | 3KB |
| `deploy.sh` | Automated deployment script | 1KB |
| `backup.sh` | Automated backup script | 1KB |
| `restore.sh` | Restore from backup script | 3KB |
| `.env` | Environment variables (Supabase) | <1KB |

---

## 🚀 Quick Overview

### **What We'll Do:**

```
1. Connect to VPS via SSH
2. Install Node.js, Nginx
3. Upload project files
4. Build application
5. Configure Nginx
6. Point domain to VPS
7. Install SSL certificate
8. Test everything
```

### **Time Required:**
- Fast track: ~5 minutes
- Complete setup: ~15 minutes
- With SSL: ~20 minutes

---

## 📋 Pre-Flight Checklist

Before you begin, verify:

- [ ] I can SSH into my VPS
- [ ] I have my VPS IP address
- [ ] My domain is registered
- [ ] I have DNS access
- [ ] VPS has at least 2GB RAM
- [ ] VPS has at least 10GB free disk space

---

## 🎬 Let's Get Started!

### **Step 1: Choose Your Guide**

Pick the guide that matches your experience level:

- **Beginner?** → Use `VPS_DEPLOYMENT_CHECKLIST.md`
- **Experienced?** → Use `QUICK_VPS_SETUP.md`
- **Want details?** → Use `GODADDY_VPS_DEPLOYMENT.md`

### **Step 2: Prepare Files**

All your files are in:
```
/tmp/cc-agent/57830216/project/
```

You'll need to upload these to your VPS:
- All application files
- `.env` file (contains Supabase credentials)
- Deployment scripts

### **Step 3: Follow Your Chosen Guide**

Open your chosen guide and follow the steps carefully.

---

## 🔐 Important Information

### **Supabase Database (Already Configured)**

Your `.env` file contains:
```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This connects your app to the Supabase database.

### **Demo Accounts (Already Created)**

Test with these accounts after deployment:

1. **Admin Access**
   - Email: `admin@blindscloud.co.uk`
   - Password: `password`
   - Can: Manage everything

2. **Business Access**
   - Email: `business@blindscloud.co.uk`
   - Password: `password`
   - Can: Manage business, customers, jobs

3. **Employee Access**
   - Email: `employee@blindscloud.co.uk`
   - Password: `password`
   - Can: View/update assigned jobs

---

## 🛠️ Deployment Scripts

After deployment, use these commands:

```bash
# Deploy updates
cd /var/www/blindscloud
./deploy.sh

# Create backup
./backup.sh

# Restore from backup
./restore.sh
```

---

## 🌐 After Deployment

Your site will be live at:
- **URL:** `https://your-domain.com`
- **Secured:** SSL/HTTPS enabled
- **Database:** Supabase connected
- **Users:** All 3 roles functional

---

## 📊 What's Included

### **Frontend Features:**
✅ User authentication & management
✅ Customer management
✅ Job workflow system
✅ Product catalog with 3D models
✅ AR camera integration
✅ Calendar & scheduling
✅ Email system
✅ Notifications center
✅ Activity logs
✅ Reports & analytics
✅ Responsive mobile design

### **Backend:**
✅ Supabase PostgreSQL database
✅ Row Level Security (RLS)
✅ Role-based permissions
✅ Secure authentication
✅ RESTful API ready

### **Security:**
✅ HTTPS/SSL encryption
✅ Firewall configured
✅ RLS policies active
✅ Security headers set
✅ Fail2Ban protection (optional)

### **DevOps:**
✅ Automated deployments
✅ Daily backups scheduled
✅ Nginx optimized
✅ PM2 process management (optional)
✅ Log monitoring

---

## 🆘 Need Help?

### **Common Issues:**

**Can't connect via SSH:**
- Check VPS IP address is correct
- Verify SSH port (usually 22)
- Check firewall isn't blocking SSH

**Site not loading:**
- Wait for DNS propagation (up to 48 hours)
- Check Nginx is running: `systemctl status nginx`
- View errors: `tail -f /var/log/nginx/error.log`

**SSL certificate fails:**
- Ensure DNS is pointing to your VPS
- Check domain is accessible via HTTP first
- Wait for DNS propagation

### **Support Resources:**

- Check `GODADDY_VPS_DEPLOYMENT.md` troubleshooting section
- Review Nginx logs: `tail -f /var/log/nginx/error.log`
- Test Nginx config: `nginx -t`

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Can access `https://your-domain.com`
- [ ] SSL certificate shows green padlock
- [ ] Can login with admin account
- [ ] Can login with business account
- [ ] Can login with employee account
- [ ] All features load properly
- [ ] No console errors in browser
- [ ] Mobile responsive works

---

## 🎉 Ready to Deploy?

**Choose your guide and let's go!**

1. 📖 **Complete Guide:** `GODADDY_VPS_DEPLOYMENT.md`
2. ⚡ **Quick Setup:** `QUICK_VPS_SETUP.md`
3. ✅ **Checklist:** `VPS_DEPLOYMENT_CHECKLIST.md`

---

## 📝 Notes

- Default SSH port is 22
- Default HTTP port is 80
- Default HTTPS port is 443
- Recommended OS: Ubuntu 20.04/22.04 LTS
- Minimum RAM: 2GB
- Minimum storage: 10GB

---

## 🚀 Let's Deploy!

Open your chosen guide and follow the steps.

Your BlindsCloud platform will be live in minutes!

**Good luck!** 🎊
