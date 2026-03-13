#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies from root
pip install -r requirements.txt

# Go to backend directory for Django commands
cd backend

python manage.py collectstatic --no-input
python manage.py migrate
