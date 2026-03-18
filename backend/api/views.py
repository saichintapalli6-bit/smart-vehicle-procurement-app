import hashlib
import time
from django.http import JsonResponse
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User, Vehicle, Transaction

@api_view(['GET'])
def hello_world(request):
    return JsonResponse({"message": "Hello from Django backend!"})

# --- AUTH ---

@api_view(['POST'])
def register_view(request):
    data = request.data
    try:
        if User.objects.filter(username=data.get('loginid')).exists():
            return JsonResponse({"error": "Login ID already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=data.get('loginid'),
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('name', ''),
            role=data.get('role', 'buyer'),
            mobile=data.get('mobile'),
            is_active=False # Pending admin approval
        )
        
        if data.get('role') == 'seller':
            user.bank_account_number = data.get('bank_account_number')
            user.ifsc_code = data.get('ifsc_code')
            user.bank_name = data.get('bank_name')
            user.save()
            
        return JsonResponse({"message": "Registration successful! Please wait for admin approval."}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    loginid = request.data.get('loginid')
    password = request.data.get('password')
    role = request.data.get('role')

    user = authenticate(username=loginid, password=password)
    
    if user is not None:
        if user.role != role:
            return JsonResponse({"error": f"Invalid role. You are registered as a {user.role}."}, status=status.HTTP_403_FORBIDDEN)
        if not user.is_active and user.role != 'admin':
            return JsonResponse({"error": "Your account is pending admin approval. Please try again later."}, status=status.HTTP_403_FORBIDDEN)
        
        return JsonResponse({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "name": user.first_name if user.first_name else user.username,
            "email": user.email,
            "status": "Active" if user.is_active else "waiting"
        })
    else:
        return JsonResponse({"error": "Invalid Login ID or Password"}, status=status.HTTP_401_UNAUTHORIZED)

# --- SELLER ---

@api_view(['POST'])
def seller_add_vehicle(request):
    data = request.data
    seller_id = data.get('seller_id')
    try:
        seller = User.objects.get(id=seller_id)
        
        # Simulate Blockchain Hash
        hash_input = f"{data.get('vehicle_number')}{seller_id}{time.time()}"
        block_hash = hashlib.sha256(hash_input.encode()).hexdigest()[:32].upper()
        
        photo_url = data.get('photo_url')
        if not photo_url and data.get('photo_base64'):
            photo_url = f"data:image/jpeg;base64,{data.get('photo_base64')}"
            
        doc_url = data.get('documents_url')
        if not doc_url and data.get('doc_base64'):
            # Default to PDF data URI if not specified
            doc_url = f"data:application/pdf;base64,{data.get('doc_base64')}"

        vehicle = Vehicle.objects.create(
            seller=seller,
            vehicle_number=data.get('vehicle_number'),
            price=data.get('price'),
            accidents_history=data.get('accidents_history'),
            photo_url=photo_url,
            documents_url=doc_url,
            block_hash=block_hash,
            status='available'
        )
        
        return JsonResponse({
            "message": "Vehicle added to blockchain successfully!",
            "block_hash": block_hash
        }, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return JsonResponse({"error": "Seller not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def seller_vehicle_history(request):
    seller_id = request.GET.get('seller_id')
    vehicles = Vehicle.objects.filter(seller_id=seller_id).order_by('-created_at')
    data = []
    for v in vehicles:
        data.append({
            "id": v.id,
            "vehicle_number": v.vehicle_number,
            "price": str(v.price),
            "accidents_history": v.accidents_history,
            "status": v.status,
            "block_hash": v.block_hash,
            "photo_url": v.photo_url,
            "documents_url": v.documents_url
        })
    return JsonResponse(data, safe=False)

@api_view(['POST'])
def seller_update_transaction(request):
    hash_code = request.data.get('hash_code')
    seller_txn_id = request.data.get('seller_transaction_id')
    try:
        # Find the latest pending transaction associated with this vehicle hash
        transaction = Transaction.objects.filter(hash_code=hash_code, status='pending').latest('created_at')
        transaction.seller_transaction_id = seller_txn_id
        transaction.save()
        return JsonResponse({"message": "Transaction ID updated successfully"})
    except Transaction.DoesNotExist:
        return JsonResponse({"error": "No pending transaction found for this vehicle hash"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def seller_delete_vehicle(request, vehicle_id):
    seller_id = request.data.get('seller_id')
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, seller_id=seller_id)
        if vehicle.status in ['pending', 'sold']:
            return JsonResponse(
                {"error": "Cannot delete a vehicle that is pending or already sold."},
                status=status.HTTP_400_BAD_REQUEST
            )
        vehicle.delete()
        return JsonResponse({"message": "Vehicle deleted successfully."})
    except Vehicle.DoesNotExist:
        return JsonResponse({"error": "Vehicle not found or not owned by you."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- ADMIN ---

@api_view(['GET'])
def admin_buyers(request):
    buyers = User.objects.filter(role='buyer').values('id', 'username', 'first_name', 'email', 'mobile', 'is_active')
    data = []
    for b in buyers:
        data.append({
            "id": b['id'],
            "loginid": b['username'],
            "name": b['first_name'],
            "email": b['email'],
            "mobile": b['mobile'],
            "status": "Active" if b['is_active'] else "waiting"
        })
    return JsonResponse(data, safe=False)

@api_view(['GET'])
def admin_sellers(request):
    sellers = User.objects.filter(role='seller').values('id', 'username', 'first_name', 'email', 'mobile', 'is_active')
    data = []
    for s in sellers:
        data.append({
            "id": s['id'],
            "loginid": s['username'],
            "name": s['first_name'],
            "email": s['email'],
            "mobile": s['mobile'],
            "status": "Active" if s['is_active'] else "waiting"
        })
    return JsonResponse(data, safe=False)

@api_view(['POST'])
def admin_activate_user(request):
    user_id = request.data.get('id')
    action = request.data.get('action')
    try:
        user = User.objects.get(id=user_id)
        user.is_active = (action == 'activate')
        user.save()
        return JsonResponse({"message": f"User {action}d successfully", "status": "Active" if user.is_active else "Inactive"})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def admin_transactions(request):
    transactions = Transaction.objects.all().order_by('-created_at')
    data = []
    for t in transactions:
        data.append({
            "id": t.id,
            "vehicle_number": t.vehicle.vehicle_number,
            "buyer_name": t.buyer.first_name if t.buyer.first_name else t.buyer.username,
            "price": str(t.vehicle.price),
            "status": t.status,
            "hash_code": t.hash_code,
            "buyer_transaction_id": t.buyer_transaction_id,
            "seller_transaction_id": t.seller_transaction_id
        })
    return JsonResponse(data, safe=False)

@api_view(['POST'])
def admin_delete_user(request):
    user_id = request.data.get('user_id')
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return JsonResponse({"message": "User deleted successfully"})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# --- BUYER ---

@api_view(['GET'])
def browse_vehicles(request):
    vehicles = Vehicle.objects.filter(status='available').order_by('-created_at')
    data = []
    for v in vehicles:
        data.append({
            "id": v.id,
            "vehicle_number": v.vehicle_number,
            "price": str(v.price),
            "accidents_history": v.accidents_history,
            "block_hash": v.block_hash,
            "photo_url": v.photo_url,
            "documents_url": v.documents_url,
            "seller_name": v.seller.first_name if v.seller.first_name else v.seller.username
        })
    return JsonResponse(data, safe=False)

@api_view(['POST'])
def purchase_vehicle(request):
    data = request.data
    buyer_id = data.get('buyer_id')
    
    # Try to get vehicle by ID or Number
    vehicle_id = data.get('vehicle_id')
    vehicle_number = data.get('vehicle_number')
    
    try:
        buyer = User.objects.get(id=buyer_id)
        if vehicle_id:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        else:
            vehicle = Vehicle.objects.get(vehicle_number=vehicle_number)
        
        # If another person buys this vehicle, handle "refund" for previous pending txn
        previous_pending = Transaction.objects.filter(vehicle=vehicle, status='pending')
        for old_txn in previous_pending:
            old_txn.status = 'rejected'
            old_txn.save()
            # In a real app, this is where you'd trigger a bank refund API
        
        # Create new transaction
        transaction = Transaction.objects.create(
            buyer=buyer,
            vehicle=vehicle,
            status='pending',
            buyer_transaction_id=data.get('buyer_transaction_id'),
            hash_code=vehicle.block_hash
        )
        
        # Update vehicle status to pending
        vehicle.status = 'pending'
        vehicle.save()
        
        return JsonResponse({
            "status": "success",
            "message": "Purchase request submitted! Waiting for seller and admin verification.",
            "transaction_id": transaction.hash_code
        })
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def buyer_transactions(request):
    buyer_id = request.GET.get('buyer_id')
    transactions = Transaction.objects.filter(buyer_id=buyer_id).order_by('-created_at')
    data = []
    for t in transactions:
        data.append({
            "id": t.id,
            "vehicle_number": t.vehicle.vehicle_number,
            "status": t.status,
            "price": str(t.vehicle.price),
            "hash_code": t.hash_code,
            "buyer_transaction_id": t.buyer_transaction_id,
            "seller_transaction_id": t.seller_transaction_id,
            "photo_url": t.vehicle.photo_url,
            "documents_url": t.vehicle.documents_url,
            "seller_name": t.vehicle.seller.first_name if t.vehicle.seller.first_name else t.vehicle.seller.username,
            "created_at": t.created_at
        })
    return JsonResponse(data, safe=False)


@api_view(['POST'])
def admin_approve_transaction(request):
    hash_code = request.data.get('hash_code')
    try:
        # Find the latest pending transaction
        transaction = Transaction.objects.filter(hash_code=hash_code, status='pending').latest('created_at')
        
        # Check if both IDs are provided and match
        b_id = transaction.buyer_transaction_id
        s_id = transaction.seller_transaction_id
        
        if not b_id or not s_id:
            return JsonResponse({"error": "Cannot approve. Both buyer and seller must provide transaction IDs."}, status=400)
            
        if b_id == s_id:
            transaction.status = 'approved'
            transaction.save()
            
            # Mark vehicle as sold
            vehicle = transaction.vehicle
            vehicle.status = 'sold'
            vehicle.save()
            
            return JsonResponse({"message": "Transaction approved! IDs match. Vehicle marked as sold."})
        else:
            # If IDs don't match, we might want to reject or keep pending
            # User said: "otherwise payment pending in undali vehicle available lo undali"
            # This means the transaction is rejected, and vehicle is back to available.
            transaction.status = 'rejected'
            transaction.save()
            
            vehicle = transaction.vehicle
            vehicle.status = 'available'
            vehicle.save()
            
            return JsonResponse({"error": "Transaction IDs do NOT match! Transaction rejected. Vehicle is now available for others."}, status=400)
            
    except Transaction.DoesNotExist:
        return JsonResponse({"error": "No pending transaction found for this hash"}, status=status.HTTP_404_NOT_FOUND)

