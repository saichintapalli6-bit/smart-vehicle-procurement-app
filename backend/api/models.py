from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    mobile = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    
    # Seller specific fields
    bank_account_number = models.CharField(max_length=20, null=True, blank=True)
    ifsc_code = models.CharField(max_length=15, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Vehicle(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('pending', 'Pending'),
        ('sold', 'Sold'),
    )
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    vehicle_number = models.CharField(max_length=20, unique=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    accidents_history = models.TextField(null=True, blank=True)
    photo_url = models.TextField(null=True, blank=True)
    documents_url = models.TextField(null=True, blank=True)
    
    # Simulated Blockchain fields
    block_hash = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='available')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle_number} - {self.status}"

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='transactions')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Transaction tracking
    buyer_transaction_id = models.CharField(max_length=100, null=True, blank=True)
    seller_transaction_id = models.CharField(max_length=100, null=True, blank=True)
    hash_code = models.CharField(max_length=100, unique=True, null=True, blank=True) # Usually matches vehicle block_hash for lookup
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tx: {self.hash_code} - {self.status}"
