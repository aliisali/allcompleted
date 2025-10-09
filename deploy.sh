#!/bin/bash

echo "🚀 BlindsCloud Deployment Script"
echo "================================"

# Navigate to project directory
cd /var/www/blindscloud || exit

# Pull latest changes (if using Git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes from Git..."
    git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful!"

    # Set correct permissions
    echo "🔒 Setting permissions..."
    sudo chown -R www-data:www-data dist/
    sudo chmod -R 755 dist/

    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx

    echo "✅ Deployment complete!"
    echo "🌐 Your site should now be live!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
