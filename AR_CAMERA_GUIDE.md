# 📸 AR Camera - Complete Guide

## 🎯 Overview

The AR Camera feature allows users to upload images, place them in augmented reality using their device camera, and capture screenshots. This guide explains how AR Camera permissions work and how to grant access.

---

## 🔐 Permission System

### **Who Has Access by Default?**

1. **Admin Users** ✅
   - Always have access to AR Camera
   - Can access both AR Camera and AR Camera V2
   - No permission grant needed

2. **Business Users** ⚠️
   - Only if granted permission
   - Permission must be granted by Admin
   - Access through Module Permissions

3. **Employee Users** ⚠️
   - Only if granted permission
   - Permission must be granted by Admin
   - Access through Module Permissions

---

## 🛠️ How to Grant AR Camera Access

### **Method 1: Module Permissions (Recommended)**

This is the new system that provides granular control.

#### **Steps for Admin:**

1. **Login as Admin**
   - Email: `admin@platform.com`
   - Password: `password`

2. **Navigate to Module Permissions**
   - Click "Module Permissions" in the sidebar
   - You'll see the AR Camera module

3. **Grant Access to Users**
   - Search for the user by name or email
   - Click "Grant Access" button next to the user
   - User will immediately see "AR Camera" in their sidebar

4. **Verify Access**
   - Ask the user to refresh their page
   - "AR Camera" should now appear in their menu

---

### **Method 2: User Permissions Array (Legacy)**

This is the older system that still works for backward compatibility.

#### **Steps for Admin:**

1. **Navigate to User Management**
   - Click "User Management" in sidebar

2. **Edit User**
   - Find the user you want to grant access to
   - Click "Edit" button

3. **Add Permission**
   - In the permissions array, add one of:
     - `ar_camera_access` (recommended)
     - `vr_view` (legacy, still works)
     - `all` (grants all permissions)

4. **Save Changes**
   - Click "Save"
   - User will see AR Camera in their menu

---

## 📱 AR Camera Features

### **What Can Users Do?**

1. **Upload Images**
   - Upload any image file
   - Supports multiple file upload
   - Images saved in local storage

2. **AR Placement**
   - Open device camera
   - Place uploaded image in AR view
   - Adjust size, rotation, position

3. **Controls**
   - **Scale**: 0.5x to 3.0x
   - **Rotation**: 0° to 360°
   - **Position X**: 0% to 100%
   - **Position Y**: 0% to 100%
   - **Grid Overlay**: Toggle alignment grid
   - **Reset**: Return to default settings

4. **Capture Screenshots**
   - Take photos of AR scene
   - Download saved screenshots
   - View screenshot history

---

## 🎮 How to Use AR Camera

### **For Users with Access:**

1. **Access AR Camera**
   - Click "AR Camera" in sidebar
   - You'll see the AR Camera dashboard

2. **Upload an Image**
   - Click "Upload Files" button
   - Select one or more images
   - Images appear in the gallery

3. **Select Image**
   - Click on an image to select it
   - Selected image shows green border
   - Preview appears on the right

4. **Start AR**
   - Click "START AR CAMERA" button
   - Allow camera access when prompted
   - Camera opens in fullscreen

5. **Adjust Placement**
   - Use sliders to adjust:
     - Scale (size)
     - Rotation (angle)
     - Position X (horizontal)
     - Position Y (vertical)
   - Toggle grid for alignment help

6. **Capture Screenshot**
   - Click "Capture" button
   - Screenshot saved automatically
   - Access from saved screenshots section

7. **Exit AR Mode**
   - Click X button in top-right
   - Returns to dashboard

---

## 🔍 Checking Permissions

### **How to Know if You Have Access:**

1. **Check Sidebar**
   - Login to your account
   - Look for "AR Camera" in the sidebar
   - If visible, you have access

2. **Check Module Permissions (Admin Only)**
   - Go to Module Permissions
   - Search for user
   - Green checkmark = has access
   - Red X = no access

---

## 🐛 Troubleshooting

### **"AR Camera not in my sidebar"**

**Possible Causes:**
1. No permission granted
2. Cache issue
3. Outdated page

**Solutions:**
1. Ask admin to grant access via Module Permissions
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache
4. Logout and login again

---

### **"Camera access denied"**

**Possible Causes:**
1. Browser blocked camera
2. No camera available
3. Camera used by another app

**Solutions:**
1. Click camera icon in address bar
2. Allow camera access
3. Close other apps using camera
4. Try different browser
5. Check device camera settings

---

### **"Images not loading in AR"**

**Possible Causes:**
1. Image file corrupted
2. File too large
3. Unsupported format

**Solutions:**
1. Re-upload the image
2. Use smaller image (< 5MB)
3. Convert to JPG or PNG
4. Check browser console for errors

---

### **"Screenshots not saving"**

**Possible Causes:**
1. Local storage full
2. Browser blocking downloads
3. Private/Incognito mode

**Solutions:**
1. Clear browser storage
2. Allow downloads in browser settings
3. Use regular browser window
4. Check available disk space

---

## 👥 Permission Levels Explained

### **Level 1: No Access** 🚫
- User: Business or Employee without permission
- Sidebar: No AR Camera option
- Can access: None

### **Level 2: User Access** ✅
- User: Business or Employee with `ar_camera_access` permission
- Sidebar: "AR Camera" option visible
- Can access: AR Camera only
- Cannot: Grant access to others

### **Level 3: Admin Access** ⭐
- User: Admin role
- Sidebar: Both "AR Camera" and "AR Camera V2"
- Can access: All AR features
- Can: Grant access to others
- Can: Manage module permissions

---

## 🔄 Permission Granting Workflow

```
┌─────────────┐
│   Admin     │
│   Logs In   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Module Permissions │
│      Screen         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Search for User    │
│  (John Doe)         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Click "Grant       │
│   Access" Button    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Permission Saved   │
│  to localStorage    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  User Refreshes     │
│  Their Page         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  "AR Camera"        │
│  Appears in Sidebar │
└─────────────────────┘
```

---

## 📊 Permission Check Logic

The system checks permissions in this order:

1. **Is user Admin?**
   - YES → Grant access ✅
   - NO → Continue to step 2

2. **Check Module Permissions**
   - Has `ar-camera` permission? → Grant access ✅
   - No? → Continue to step 3

3. **Check User Permissions Array**
   - Has `ar_camera_access`? → Grant access ✅
   - Has `vr_view`? → Grant access ✅
   - Has `all`? → Grant access ✅
   - No? → Deny access 🚫

---

## 🎓 Best Practices

### **For Admins:**

1. **Use Module Permissions**
   - More granular control
   - Easier to manage
   - Better audit trail

2. **Grant Carefully**
   - Only to users who need it
   - Review periodically
   - Revoke when not needed

3. **Educate Users**
   - Share this guide
   - Provide training
   - Offer support

### **For Users:**

1. **Test Camera First**
   - Upload test image
   - Check camera works
   - Familiarize with controls

2. **Optimize Images**
   - Use compressed images
   - Keep under 5MB
   - Use JPG/PNG format

3. **Save Your Work**
   - Download important screenshots
   - Don't rely only on browser storage
   - Backup regularly

---

## 🔗 Related Features

- **3D Model Viewer**: View 3D models (separate permission)
- **Product Visualizer**: View product catalog
- **Camera Capture**: Regular camera for jobs

---

## 📞 Support

### **Getting Help:**

1. **Check this guide first**
2. **Ask your admin** for permissions
3. **Check browser console** for errors
4. **Try different browser**
5. **Clear cache and retry**

### **For Admins:**

- Review Module Permissions screen
- Check user permissions array
- Verify localStorage data
- Test with different users

---

## ✅ Quick Reference

### **Grant Access (Admin):**
```
Module Permissions → Search User → Grant Access
```

### **Check Access (User):**
```
Login → Check Sidebar → Look for "AR Camera"
```

### **Use AR Camera:**
```
Upload Image → Select Image → Start AR → Adjust → Capture
```

### **Revoke Access (Admin):**
```
Module Permissions → Search User → Revoke Access
```

---

## 🎉 Success Indicators

**Access Granted Successfully:**
- ✅ "AR Camera" visible in sidebar
- ✅ Can open AR Camera dashboard
- ✅ Can upload images
- ✅ Can start camera
- ✅ Can capture screenshots

**Access Not Yet Granted:**
- ❌ No "AR Camera" in sidebar
- ❌ Cannot access AR features
- ❌ Need admin to grant permission

---

**Version:** 1.3.0
**Last Updated:** 2025-10-15
**Feature Status:** ✅ Fully Functional
