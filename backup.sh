#!/bin/bash

echo "💾 BlindsCloud Backup Script"
echo "============================"

# Configuration
BACKUP_DIR="/root/backups/blindscloud"
PROJECT_DIR="/var/www/blindscloud"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "📦 Creating backup..."

# Backup application files
tar -czf $BACKUP_DIR/blindscloud_$DATE.tar.gz -C /var/www blindscloud

# Check if backup was successful
if [ -f "$BACKUP_DIR/blindscloud_$DATE.tar.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/blindscloud_$DATE.tar.gz" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "📁 Location: $BACKUP_DIR/blindscloud_$DATE.tar.gz"
    echo "📊 Size: $BACKUP_SIZE"

    # Keep only last 7 backups
    echo "🧹 Cleaning old backups..."
    cd $BACKUP_DIR
    ls -t blindscloud_*.tar.gz | tail -n +8 | xargs rm -f 2>/dev/null

    BACKUP_COUNT=$(ls -1 blindscloud_*.tar.gz 2>/dev/null | wc -l)
    echo "✅ Cleanup complete! Keeping $BACKUP_COUNT most recent backups."
else
    echo "❌ Backup failed!"
    exit 1
fi
