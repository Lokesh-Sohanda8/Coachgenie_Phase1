import asyncio
from datetime import date
from app.database import AsyncSessionLocal
from app.models.tenant import Tenant
from app.models.user import User
from app.models.student import Student
from app.models.batch import Subject, Batch, BatchStudent
from app.models.fee import FeeStructure
from app.models.notification import NotificationTemplate
from sqlalchemy import select
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed():
    print("\n Seeding CoachingERP...\n")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Tenant).where(Tenant.subdomain == "demo"))
        tenant = result.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(name="Demo Coaching Institute", subdomain="demo", plan="pro", is_active=True, settings={"theme": "blue", "locale": "en-IN"})
            db.add(tenant)
            await db.flush()
            print(f"Tenant: {tenant.name}")

        users_data = [
            {"email": "owner@demo.com",     "role": "owner",     "first": "Demo",   "last": "Owner"},
            {"email": "counselor@demo.com", "role": "counselor", "first": "Priya",  "last": "Sharma"},
            {"email": "tutor@demo.com",     "role": "tutor",     "first": "Rahul",  "last": "Verma"},
            {"email": "student@demo.com",   "role": "student",   "first": "Arjun",  "last": "Singh"},
            {"email": "parent@demo.com",    "role": "parent",    "first": "Suresh", "last": "Singh"},
        ]
        created_users = {}
        for u in users_data:
            result = await db.execute(select(User).where(User.email == u["email"], User.tenant_id == tenant.id))
            user = result.scalar_one_or_none()
            if not user:
                user = User(tenant_id=tenant.id, email=u["email"], password_hash=hash_password("Admin@1234"), role=u["role"], first_name=u["first"], last_name=u["last"], is_active=True)
                db.add(user)
                await db.flush()
                print(f"User: {u['email']}")
            created_users[u["role"]] = user

        subjects_data = [{"name": "Mathematics", "code": "MATH"}, {"name": "Physics", "code": "PHY"}, {"name": "Chemistry", "code": "CHEM"}]
        for s in subjects_data:
            result = await db.execute(select(Subject).where(Subject.name == s["name"], Subject.tenant_id == tenant.id))
            if not result.scalar_one_or_none():
                db.add(Subject(tenant_id=tenant.id, name=s["name"], code=s["code"]))
                await db.flush()
                print(f"Subject: {s['name']}")

        result = await db.execute(select(Batch).where(Batch.name == "JEE 2025", Batch.tenant_id == tenant.id))
        batch = result.scalar_one_or_none()
        if not batch:
            batch = Batch(tenant_id=tenant.id, name="JEE 2025", code="JEE25", target_exam="JEE Main & Advanced", academic_year="2024-25", start_date=date(2024, 6, 1), end_date=date(2025, 5, 31), capacity=60, is_active=True)
            db.add(batch)
            await db.flush()
            print(f"Batch: {batch.name}")

        result = await db.execute(select(Student).where(Student.enrollment_no == "STU001", Student.tenant_id == tenant.id))
        student = result.scalar_one_or_none()
        if not student:
            student = Student(tenant_id=tenant.id, user_id=created_users["student"].id, enrollment_no="STU001", first_name="Arjun", last_name="Singh", email="student@demo.com", phone="9876543210", gender="male", current_class="12th", target_exam="JEE Main & Advanced", school_name="Delhi Public School", parent_name="Suresh Singh", parent_phone="9876543211", parent_email="parent@demo.com", city="Delhi", state="Delhi", joined_at=date(2024, 6, 1), is_active=True)
            db.add(student)
            await db.flush()
            db.add(BatchStudent(batch_id=batch.id, student_id=student.id, enrolled_at=date(2024, 6, 1)))
            await db.flush()
            print(f"Student: {student.first_name} {student.last_name}")

        await db.commit()

    print("\n Seed complete!")
    print("  owner@demo.com / Admin@1234")
    print("  counselor@demo.com / Admin@1234")
    print("  tutor@demo.com / Admin@1234")
    print("  student@demo.com / Admin@1234")
    print("  Header: X-Tenant-Subdomain: demo\n")

if __name__ == "__main__":
    asyncio.run(seed())
