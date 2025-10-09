#!/bin/bash

echo "🔄 BlindsCloud Restore Script"
echo "============================="

# Configuration
BACKUP_DIR="/root/backups/blindscloud"
PROJECT_DIR="/var/www/blindscloud"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "📁 Available backups:"
echo ""
ls -lh $BACKUP_DIR/blindscloud_*.tar.gz 2>/dev/null | awk '{print NR". "$9" ("$5")"}'
echo ""

# Check if any backups exist
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/blindscloud_*.tar.gz 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -eq 0 ]; then
    echo "❌ No backups found!"
    exit 1
fi

# Get user input
read -p "Enter backup number to restore (or 'q' to quit): " SELECTION

if [ "$SELECTION" = "q" ]; then
    echo "👋 Restore cancelled."
    exit 0
fi

# Get selected backup file
BACKUP_FILE=$(ls -t $BACKUP_DIR/blindscloud_*.tar.gz 2>/dev/null | sed -n "${SELECTION}p")

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Invalid selection!"
    exit 1
fi

echo ""
echo "⚠️  WARNING: This will replace your current installation!"
read -p "Are you sure you want to restore from this backup? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "👋 Restore cancelled."
    exit 0
fi

echo ""
echo "🔄 Restoring from: $(basename $BACKUP_FILE)"

# Stop Nginx
echo "⏸️  Stopping Nginx..."
sudo systemctl stop nginx

# Backup current installation (just in case)
if [ -d "$PROJECT_DIR" ]; then
    TEMP_BACKUP="/tmp/blindscloud_before_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
    echo "💾 Creating safety backup of current installation..."
    tar -czf $TEMP_BACKUP -C /var/www blindscloud
    echo "✅ Safety backup created: $TEMP_BACKUP"
fi

# Remove current installation
if [ -d "$PROJECT_DIR" ]; then
    echo "🗑️  Removing current installation..."
    rm -rf $PROJECT_DIR
fi

# Restore from backup
echo "📦 Extracting backup..."
tar -xzf $BACKUP_FILE -C /var/www

# Set permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

# Start Nginx
echo "▶️  Starting Nginx..."
sudo systemctl start nginx

# Check if Nginx started successfully
if sudo systemctl is-active --quiet nginx; then
    echo ""
    echo "✅ Restore completed successfully!"
    echo "🌐 Your site should now be running with the restored version."
else
    echo ""
    echo "❌ Nginx failed to start! Check the logs:"
    echo "   sudo tail -f /var/log/nginx/error.log"
    exit 1
fi
