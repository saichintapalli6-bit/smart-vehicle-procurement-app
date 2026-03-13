import os
import django
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_vehicle_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

def initialize():
    print("Starting database initialization...")
    
    # Run migrations
    try:
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        print("Migrations completed successfully.")
    except Exception as e:
        print(f"Error during migrations: {e}")

    # Create superuser
    User = get_user_model()
    username = 'admin'
    password = 'admin123'
    email = 'admin@example.com'

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser '{username}'...")
        try:
            User.objects.create_superuser(username=username, email=email, password=password, role='admin')
            print(f"Superuser '{username}' created successfully!")
        except Exception as e:
            print(f"Error creating superuser: {e}")
    else:
        print(f"Superuser '{username}' already exists.")

if __name__ == "__main__":
    initialize()
