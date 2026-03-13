import os
import django
from django.core.management import execute_from_command_line

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_vehicle_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

def initialize():
    print(f"Starting database initialization from {BASE_DIR}...")
    manage_py_path = os.path.join(BASE_DIR, 'manage.py')
    print(f"Using manage.py at: {manage_py_path}")
    
    # Run migrations
    try:
        print("Running migrations...")
        execute_from_command_line([manage_py_path, 'migrate', '--noinput'])
        print("Migrations completed successfully.")
    except Exception as e:
        print(f"CRITICAL ERROR during migrations: {e}")
        # Log the full error if possible
        import traceback
        traceback.print_exc()
        # If migrations fail, we might still want to try creating a superuser if it's just a 'no such table' issue

    # Create superuser
    User = get_user_model()
    username = 'admin'
    password = 'admin123'
    email = 'admin@example.com'

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser '{username}'...")
        try:
            user = User.objects.create_superuser(
                username=username, 
                email=email, 
                password=password, 
                role='admin'
            )
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"Superuser '{username}' created successfully!")
        except Exception as e:
            print(f"Error creating superuser: {e}")
    else:
        print(f"Superuser '{username}' already exists.")

if __name__ == "__main__":
    initialize()
