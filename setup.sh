#!/bin/bash

# Agricultural Marketplace - Development Setup Guide

echo "🌾 Setting up Agricultural Marketplace Development Environment..."

# Backend Setup
echo ""
echo "📦 Backend Setup..."
cd backend

# Check if composer.json exists
if [ -f "composer.json" ]; then
    echo "✅ Installing PHP dependencies..."
    composer install
else
    echo "❌ composer.json not found"
fi

# Check if .env exists, if not create it
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, creating from default..."
    cp .env.example .env 2>/dev/null || echo "Note: Configure database credentials in .env"
fi

# Run migrations
echo "✅ Running database migrations..."
php spark migrate

echo ""
echo "📌 Backend Setup Complete!"
echo "   Start server: php spark serve"
echo "   API URL: http://localhost:8080"

# Frontend Setup
echo ""
echo "⚛️  Frontend Setup..."
cd ../frontend

if [ -f "package.json" ]; then
    echo "✅ Installing Node dependencies..."
    npm install
else
    echo "❌ package.json not found"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "✅ Creating .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:8080/api
EOF
fi

echo ""
echo "📌 Frontend Setup Complete!"
echo "   Start server: npm run dev"
echo "   URL: http://localhost:5173"

echo ""
echo "🎉 Setup Complete! Follow these steps to run the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  php spark serve"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
