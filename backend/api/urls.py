from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world),
    
    # Auth
    path('register/', views.register_view),
    path('login/', views.login_view),
    
    # Seller
    path('seller/add-vehicle/', views.seller_add_vehicle),
    path('seller/vehicle-history/', views.seller_vehicle_history),
    path('seller/update-transaction/', views.seller_update_transaction),
    path('seller/delete-vehicle/<int:vehicle_id>/', views.seller_delete_vehicle),
    
    # Buyer
    path('browse-vehicles/', views.browse_vehicles),
    path('purchase-vehicle/', views.purchase_vehicle),
    path('buyer/transactions/', views.buyer_transactions),
    
    # Admin
    path('admin/buyers/', views.admin_buyers),
    path('admin/sellers/', views.admin_sellers),
    path('admin/activate-buyer/', views.admin_activate_user),
    path('admin/activate-seller/', views.admin_activate_user),
    path('admin/delete-user/', views.admin_delete_user),
    path('admin/transactions/', views.admin_transactions),
    path('admin/approve-transaction/', views.admin_approve_transaction),
]
