#!/bin/bash
# Quick start script for the MVP web app

set -e

echo "🛡️  Cybersecurity Toolkit MVP - Quick Start"
echo "=========================================="
echo ""

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

if [ ! -f "venv/.installed" ]; then
    echo "Installing dependencies..."
    pip install -q -r requirements.txt
    touch venv/.installed
fi

echo ""
echo "Starting Flask server..."
echo "Visit http://localhost:5000 in your browser"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python mvp_app/app.py
