import os
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
import bcrypt
from faker import Faker
from bson import ObjectId

# Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "sdfitness"
fake = Faker()

# Shared Password Hash (password123)
PASSWORD_HASH = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def clear_db(db):
    print("🧹 Cleaning database...")
    collections = ['users', 'members', 'classes', 'bookings', 'conversations', 'messages', 'notifications', 'membershipplans', 'subscriptions', 'trainers', 'attendancerecords']
    for coll in collections:
        db[coll].delete_many({})

def seed_membership_plans(db):
    print("💳 Seeding membership plans...")
    plans = [
        {"name": "Basic", "price": 3000, "durationDays": 30, "features": ["Gym Access", "Locker Room"], "isActive": True},
        {"name": "Standard", "price": 5000, "durationDays": 30, "features": ["Gym Access", "Locker Room", "Group Classes"], "isActive": True},
        {"name": "Premium", "price": 8000, "durationDays": 30, "features": ["Gym Access", "Locker Room", "Group Classes", "Personal Trainer"], "isActive": True},
        {"name": "Elite", "price": 15000, "durationDays": 90, "features": ["All Access", "Massage", "Diet Plan"], "isActive": True}
    ]
    result = db.membershipplans.insert_many(plans)
    return result.inserted_ids

def seed_trainers(db):
    print("🏋️ Seeding trainers...")
    trainers = []
    for _ in range(5):
        # Create User for Trainer
        user = {
            "firstName": fake.first_name(),
            "lastName": fake.last_name(),
            "email": fake.email(),
            "password": PASSWORD_HASH,
            "phone": fake.phone_number(),
            "role": "trainer",
            "avatar": f"https://i.pravatar.cc/150?u={fake.uuid4()}",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        user_id = db.users.insert_one(user).inserted_id
        
        trainer = {
            "userId": user_id,
            "specialization": [fake.job() for _ in range(2)],
            "bio": fake.paragraph(),
            "rating": round(random.uniform(4.0, 5.0), 1),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        trainers.append(db.trainers.insert_one(trainer).inserted_id)
    return trainers

def seed_classes(db, trainer_ids):
    print("📅 Seeding classes...")
    class_names = ["Morning Yoga", "HIIT Blast", "Zumba Dance", "Power Lifting", "Core Strength", "Evening Pilates"]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    classes = []
    for name in class_names:
        trainer_id = random.choice(trainer_ids)
        day = random.choice(days)
        start_hour = random.randint(6, 19)
        class_obj = {
            "name": name,
            "description": fake.sentence(),
            "trainer": trainer_id,
            "schedule": {
                "dayOfWeek": day,
                "startTime": f"{start_hour:02d}:00",
                "endTime": f"{start_hour+1:02d}:00"
            },
            "capacity": 20,
            "enrolled": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        classes.append(db.classes.insert_one(class_obj).inserted_id)
    return classes

def seed_users_and_members(db, plan_ids, trainer_ids):
    print("👤 Seeding users and members...")
    member_ids = []
    user_ids = []
    
    # Create a specific test user for easy login
    test_user = {
        "firstName": "SDFitness",
        "lastName": "Member",
        "email": "member@sdfitness.com",
        "password": PASSWORD_HASH,
        "phone": "0771234567",
        "role": "member",
        "avatar": "https://i.pravatar.cc/150?u=testmember",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    test_user_id = db.users.insert_one(test_user).inserted_id
    user_ids.append(test_user_id)
    
    member = {
        "userId": test_user_id,
        "memberNumber": "GYM-2026-0001",
        "dateOfBirth": datetime(1995, 1, 1),
        "gender": "male",
        "height": {"value": 175, "unit": "cm"},
        "currentWeight": {"value": 75, "unit": "kg"},
        "targetWeight": {"value": 70, "unit": "kg"},
        "bmi": 24.5,
        "fitnessGoals": ["weight_loss", "muscle_gain"],
        "dietaryPreferences": ["vegetarian"],
        "dietBudget": {"amount": 5000, "currency": "LKR", "period": "weekly"},
        "activityLevel": "moderate",
        "membershipType": "premium",
        "assignedTrainerId": random.choice(trainer_ids),
        "status": "active",
        "joinDate": datetime.utcnow(),
        "createdAt": datetime.utcnow()
    }
    member_ids.append(db.members.insert_one(member).inserted_id)

    # Add more random members
    for i in range(19):
        first_name = fake.first_name()
        last_name = fake.last_name()
        user = {
            "firstName": first_name,
            "lastName": last_name,
            "email": f"member{i+1}@example.com",
            "password": PASSWORD_HASH,
            "phone": fake.phone_number(),
            "role": "member",
            "avatar": f"https://i.pravatar.cc/150?u={fake.uuid4()}",
            "createdAt": datetime.utcnow()
        }
        uid = db.users.insert_one(user).inserted_id
        user_ids.append(uid)
        
        member = {
            "userId": uid,
            "memberNumber": f"GYM-2026-{2000+i}",
            "dateOfBirth": datetime.combine(fake.date_of_birth(minimum_age=18, maximum_age=60), datetime.min.time()),
            "gender": random.choice(['male', 'female', 'other']),
            "height": {"value": random.randint(150, 190), "unit": "cm"},
            "currentWeight": {"value": random.randint(50, 100), "unit": "kg"},
            "targetWeight": {"value": random.randint(50, 90), "unit": "kg"},
            "fitnessGoals": random.sample(['weight_loss', 'muscle_gain', 'endurance', 'flexibility'], 2),
            "membershipType": random.choice(['basic', 'standard', 'premium']),
            "status": "active",
            "joinDate": datetime.utcnow() - timedelta(days=random.randint(1, 365)),
            "createdAt": datetime.utcnow()
        }
        member_ids.append(db.members.insert_one(member).inserted_id)
        
    return user_ids, member_ids

def seed_bookings(db, member_ids, class_ids):
    print("🎟️ Seeding bookings...")
    for _ in range(30):
        mid = random.choice(member_ids)
        cid = random.choice(class_ids)
        booking = {
            "member": mid,
            "class": cid,
            "status": random.choice(['confirmed', 'attended', 'cancelled']),
            "createdAt": datetime.utcnow()
        }
        db.bookings.insert_one(booking)
        db.classes.update_one({"_id": cid}, {"$inc": {"enrolled": 1}})

def seed_communications(db, user_ids):
    print("💬 Seeding messages and notifications...")
    for i in range(len(user_ids)):
        uid = user_ids[i]
        
        # Notifications
        for _ in range(5):
            notif = {
                "user": uid,
                "title": fake.sentence(nb_words=4),
                "message": fake.paragraph(nb_sentences=2),
                "isRead": random.choice([True, False]),
                "type": random.choice(['alert', 'reminder', 'system']),
                "createdAt": datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            }
            db.notifications.insert_one(notif)
            
        # Conversations (with random other users)
        others = [u for u in user_ids if u != uid]
        if others:
            target = random.choice(others)
            conv = {
                "participants": [uid, target],
                "createdAt": datetime.utcnow()
            }
            conv_id = db.conversations.insert_one(conv).inserted_id
            
            # Specific messages requested by user
            specific_msgs = [
                "Theory move science offer decision.",
                "Trouble small line investment wide.",
                "Great ground minute alone."
            ]
            for text in specific_msgs:
                msg = {
                    "conversation": conv_id,
                    "sender": target, # Sender is the trainer/other user
                    "text": text,
                    "isRead": True,
                    "createdAt": datetime.utcnow()
                }
                db.messages.insert_one(msg)
                
            # Random messages
            for _ in range(3):
                msg = {
                    "conversation": conv_id,
                    "sender": random.choice([uid, target]),
                    "text": fake.sentence(),
                    "isRead": True,
                    "createdAt": datetime.utcnow()
                }
                db.messages.insert_one(msg)

def seed_subscriptions(db, user_ids, plan_ids):
    print("📈 Seeding subscriptions...")
    for uid in user_ids:
        plan_id = random.choice(plan_ids)
        sub = {
            "user": uid,
            "plan": plan_id,
            "startDate": datetime.utcnow() - timedelta(days=15),
            "endDate": datetime.utcnow() + timedelta(days=15),
            "status": "active",
            "createdAt": datetime.utcnow()
        }
        db.subscriptions.insert_one(sub)

def seed_attendance(db, user_ids):
    print("🚶 Seeding attendance records...")
    for uid in user_ids:
        for i in range(10):
            check_in = datetime.utcnow() - timedelta(days=i, hours=random.randint(8, 18))
            record = {
                "user": uid,
                "facility": "Main Gym",
                "checkInTime": check_in,
                "checkOutTime": check_in + timedelta(hours=1, minutes=random.randint(0, 59)),
                "createdAt": check_in
            }
            db.attendancerecords.insert_one(record)

def main():
    db = get_db()
    clear_db(db)
    
    plan_ids = seed_membership_plans(db)
    trainer_ids = seed_trainers(db)
    class_ids = seed_classes(db, trainer_ids)
    user_ids, member_ids = seed_users_and_members(db, plan_ids, trainer_ids)
    
    seed_bookings(db, member_ids, class_ids)
    seed_communications(db, user_ids)
    seed_subscriptions(db, user_ids, plan_ids)
    seed_attendance(db, user_ids)
    
    print("\n✅ Seeding complete!")
    print(f"👉 Login with: member@sdfitness.com / password123")

if __name__ == "__main__":
    main()
