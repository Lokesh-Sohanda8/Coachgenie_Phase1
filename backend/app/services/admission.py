# import json
# from datetime import datetime
# from sqlalchemy import select, func
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.models.admission import Admission
# from app.models.student import Student  # import Student model


# async def next_admission_no(db: AsyncSession, tenant_id: str) -> str:
#     """
#     Generate a collision-safe admission number using MAX() instead of COUNT().
#     COUNT re-uses numbers after deletions; MAX always advances.
#     """
#     year   = datetime.now().year
#     prefix = f"ADM-{year}-"

#     result = await db.execute(
#         select(func.max(Admission.admission_number)).where(
#             Admission.tenant_id == tenant_id,
#             Admission.admission_number.like(f"{prefix}%"),
#         )
#     )
#     last: str | None = result.scalar()

#     if last:
#         try:
#             last_seq = int(last.replace(prefix, ""))
#         except ValueError:
#             last_seq = 0
#     else:
#         last_seq = 0

#     return f"{prefix}{str(last_seq + 1).zfill(4)}"


# async def get_admissions(
#     db: AsyncSession,
#     tenant_id: str,
#     page: int,
#     limit: int,
#     status: str | None,
# ):
#     base_q = select(Admission).where(Admission.tenant_id == tenant_id)
#     if status:
#         base_q = base_q.where(Admission.status == status)

#     count_q = select(func.count()).where(Admission.tenant_id == tenant_id)
#     if status:
#         count_q = count_q.where(Admission.status == status)

#     total = await db.scalar(count_q)
#     rows  = await db.execute(
#         base_q.order_by(Admission.created_at.desc())
#         .offset((page - 1) * limit)
#         .limit(limit)
#     )
#     return {
#         "data":  rows.scalars().all(),
#         "total": total,
#         "page":  page,
#         "limit": limit,
#     }


# async def get_admission(db: AsyncSession, tenant_id: str, admission_id: str) -> Admission:
#     result = await db.execute(
#         select(Admission).where(
#             Admission.id == admission_id,
#             Admission.tenant_id == tenant_id,
#         )
#     )
#     admission = result.scalar_one_or_none()
#     if not admission:
#         raise ValueError("Admission not found")
#     return admission


# def _build_payment_json(payment: dict) -> str:
#     """
#     Normalise the payment dict into a consistent JSON string for storage.
#     Stores only snake_case keys in DB; schema layer emits camelCase on the way out.
#     """
#     raw_schedule = payment.get("installmentSchedule", [])
#     today = datetime.now().date().isoformat()

#     schedule = []
#     for s in raw_schedule:
#         due  = s.get("dueDate") or s.get("due_date")
#         paid = s.get("paid", False)
#         schedule.append({
#             "number":   s.get("number"),
#             "amount":   s.get("amount"),
#             "due_date": due,
#             "paid":     paid,
#             "overdue":  not paid and bool(due) and due < today,
#         })

#     return json.dumps({
#         "totalFee":             payment.get("totalFee", 0),
#         "amountPaid":           payment.get("amountPaid", 0),
#         "remaining":            payment.get("remaining", 0),
#         "paymentStatus":        payment.get("paymentStatus", "PENDING"),
#         "dateOfPayment":        payment.get("dateOfPayment", ""),
#         "modeOfPayment":        payment.get("modeOfPayment", "upi"),
#         "hasInstallments":      payment.get("hasInstallments", False),
#         "numberOfInstallments": payment.get("numberOfInstallments", 0),
#         "installmentAmount":    payment.get("installmentAmount", 0),
#         "installmentSchedule":  schedule,
#         "notes":                payment.get("notes", ""),
#     })



# async def _maybe_create_student(
#     db: AsyncSession,
#     admission: Admission,
# ) -> None:
#     """
#     When an admission is CONFIRMED, auto-create a Student record if one
#     doesn't already exist for this admission (checked via admission_id FK).

#     This keeps the two tables in sync without requiring manual steps.
#     """
#     # Check if a student already exists for this admission
#     existing = await db.execute(
#         select(Student).where(
#             Student.tenant_id    == admission.tenant_id,
#             Student.admission_id == admission.id,
#         )
#     )
#     if existing.scalar_one_or_none():
#         return  # already created — nothing to do

#     # Try to get contact info from the linked lead
#     lead = None
#     if admission.lead_id:
#         from app.models.lead import Lead
#         lead_result = await db.execute(
#             select(Lead).where(Lead.id == admission.lead_id)
#         )
#         lead = lead_result.scalar_one_or_none()

#     # Split student_name into first/last
#     full_name  = (admission.student_name or "").strip()
#     name_parts = full_name.split(" ", 1)
#     first_name = name_parts[0] or "Unknown"
#     last_name  = name_parts[1] if len(name_parts) > 1 else ""

#     # Generate enrollment number from admission number
#     # enrollment_no = f"STU-{admission.admission_number}"
#     enrollment_no = f"STU-{admission.admission_number}-{str(admission.id)[:8]}"

#     student = Student(
#         tenant_id     = admission.tenant_id,
#         admission_id  = admission.id,
#         enrollment_no = enrollment_no,
#         first_name    = first_name,
#         last_name     = last_name,
#         current_class = admission.grade or "",
#         is_active     = True,
#         joined_at     = datetime.now().date(),
#         # Lead takes priority, admission fields are fallback for direct admissions
#         email         = (lead.email                 if lead else None) or admission.email,
#         phone         = (lead.phone                 if lead else None) or admission.phone,
#         parent_name   = (lead.parent_name           if lead else None) or admission.parent_name,
#         parent_phone  = (lead.parent_contact_number if lead else None) or admission.parent_phone,
#         school_name   = (lead.school_name           if lead else None) or admission.school_name,
#     )

#     db.add(student)
#     # Note: caller commits — don't commit here

# async def create_admission(
#     db: AsyncSession, tenant_id: str, data: dict
# ) -> Admission:
#     admission_number = await next_admission_no(db, tenant_id)

#     payment   = data.pop("payment", None) or {}
#     documents = data.pop("documents", None) or []

#     docs_list = [
#         d if isinstance(d, dict) else d.model_dump()
#         for d in documents
#     ]

#     fee_amount = float(data.get("fee_amount") or payment.get("totalFee")  or 0)
#     fee_paid   = float(data.get("fee_paid")   or payment.get("amountPaid") or 0)

#     status = data.get("status", "PENDING_DOCS")

#     admission = Admission(
#         tenant_id           = tenant_id,
#         admission_number    = admission_number,
#         academic_year       = data.get("academic_year") or str(datetime.now().year),
#         applied_course      = data.get("applied_course") or data.get("batchName") or "N/A",
#         status              = status,
#         documents_verified  = data.get("documents_verified", False),
#         remarks             = data.get("remarks") or data.get("notes"),
#         lead_id             = data.get("lead_id"),
#         student_name        = data.get("student_name") or data.get("studentName"),
#         grade               = data.get("grade", ""),
#         board_name          = data.get("board_name"),   # ← ADD
#         batch_name          = data.get("batch_name"),
#         subjects            = data.get("subjects", []),
#         fee_amount          = fee_amount,
#         fee_paid            = fee_paid,
#         documents           = docs_list,
#         payment_installment_schedule = _build_payment_json(payment) if payment else None,
#         phone        = data.get("phone"),
#         email        = data.get("email"),
#         parent_name  = data.get("parent_name"),
#         parent_phone = data.get("parent_phone"),
#         school_name  = data.get("school_name"),
#     )

#     db.add(admission)
#     await db.flush()  # get admission.id before creating student

#     # Auto-create student if admission is already CONFIRMED on creation
#     if status == "CONFIRMED":
#         await _maybe_create_student(db, admission)

#     await db.commit()
#     await db.refresh(admission)
#     return admission


# async def update_admission(
#     db: AsyncSession,
#     tenant_id: str,
#     admission_id: str,
#     data: dict,
#     updated_by: str,
# ) -> Admission:
#     admission = await get_admission(db, tenant_id, admission_id)

#     if updated_by:
#         admission.updated_by = updated_by

#     # ── Payment update ─────────────────────────────────────────────────────────
#     payment = data.pop("payment", None)
#     if payment:
#         payment_dict = payment if isinstance(payment, dict) else payment.model_dump()
#         existing_raw = admission.payment_installment_schedule
#         existing     = json.loads(existing_raw) if existing_raw else {}
#         merged       = {**existing, **payment_dict}
#         admission.payment_installment_schedule = _build_payment_json(merged)
#         admission.fee_amount = float(payment_dict.get("totalFee",   admission.fee_amount or 0))
#         admission.fee_paid   = float(payment_dict.get("amountPaid", admission.fee_paid   or 0))

#     # ── Documents update ───────────────────────────────────────────────────────
#     documents = data.pop("documents", None)
#     if documents is not None:
#         admission.documents = [
#             d if isinstance(d, dict) else d.model_dump()
#             for d in documents
#         ]

    
#     field_map = {
#         "studentName": "student_name",
#         "batchName":   "applied_course",
#         "enrolledAt":  "approved_at",
#         "enrolled_at": "approved_at",
#         "board_name":  "board_name",   # ← ADD
#         "batch_name":  "batch_name",   # ← ADD
#     }
#     prev_status = admission.status
#     for key, val in data.items():
#         if val is None:
#             continue
#         attr = field_map.get(key, key)
#         # ── FIX: parse ISO string → datetime for timestamp columns ──
#         if attr == "approved_at" and isinstance(val, str):
#             try:
#                 from datetime import timezone
#                 val = datetime.fromisoformat(val.replace("Z", "+00:00"))
#             except ValueError:
#                 val = None
#         if hasattr(admission, attr):
#             setattr(admission, attr, val)

#     # ── Auto-create student when status transitions to CONFIRMED ───────────────
#     new_status = data.get("status")
#     if new_status == "CONFIRMED" and prev_status != "CONFIRMED":
#         await _maybe_create_student(db, admission)

#     await db.commit()
#     await db.refresh(admission)
#     return admission

import json
import uuid
from datetime import datetime, date as date_type
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.admission import Admission
from app.models.student import Student


async def next_admission_no(db: AsyncSession, tenant_id: str) -> str:
    year   = datetime.now().year
    prefix = f"ADM-{year}-"

    result = await db.execute(
        select(func.max(Admission.admission_number)).where(
            Admission.tenant_id == tenant_id,
            Admission.admission_number.like(f"{prefix}%"),
        )
    )
    last: str | None = result.scalar()

    if last:
        try:
            last_seq = int(last.replace(prefix, ""))
        except ValueError:
            last_seq = 0
    else:
        last_seq = 0

    return f"{prefix}{str(last_seq + 1).zfill(4)}"


async def get_admissions(
    db: AsyncSession,
    tenant_id: str,
    page: int,
    limit: int,
    status: str | None,
):
    base_q = select(Admission).where(Admission.tenant_id == tenant_id)
    if status:
        base_q = base_q.where(Admission.status == status)

    count_q = select(func.count()).where(Admission.tenant_id == tenant_id)
    if status:
        count_q = count_q.where(Admission.status == status)

    total = await db.scalar(count_q)
    rows  = await db.execute(
        base_q.order_by(Admission.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return {
        "data":  rows.scalars().all(),
        "total": total,
        "page":  page,
        "limit": limit,
    }


async def get_admission(db: AsyncSession, tenant_id: str, admission_id: str) -> Admission:
    result = await db.execute(
        select(Admission).where(
            Admission.id        == admission_id,
            Admission.tenant_id == tenant_id,
        )
    )
    admission = result.scalar_one_or_none()
    if not admission:
        raise ValueError("Admission not found")
    return admission


def _build_payment_json(payment: dict) -> str:
    raw_schedule = payment.get("installmentSchedule", [])
    today = datetime.now().date().isoformat()

    schedule = []
    for s in raw_schedule:
        due  = s.get("dueDate") or s.get("due_date")
        paid = s.get("paid", False)
        schedule.append({
            "number":   s.get("number"),
            "amount":   s.get("amount"),
            "due_date": due,
            "paid":     paid,
            "overdue":  not paid and bool(due) and due < today,
        })

    return json.dumps({
        "totalFee":             payment.get("totalFee", 0),
        "amountPaid":           payment.get("amountPaid", 0),
        "remaining":            payment.get("remaining", 0),
        "paymentStatus":        payment.get("paymentStatus", "PENDING"),
        "dateOfPayment":        payment.get("dateOfPayment", ""),
        "modeOfPayment":        payment.get("modeOfPayment", "upi"),
        "hasInstallments":      payment.get("hasInstallments", False),
        "numberOfInstallments": payment.get("numberOfInstallments", 0),
        "installmentAmount":    payment.get("installmentAmount", 0),
        "installmentSchedule":  schedule,
        "notes":                payment.get("notes", ""),
    })


# ── Auto-create fee invoice ────────────────────────────────────
# async def _maybe_create_fee_invoice(
#     db: AsyncSession,
#     admission: Admission,
#     student_id: str | None = None,
# ) -> None:
#     """
#     Create a FeeInvoice in fee_invoices table from admission fee data.
#     Idempotent — checks invoice_no before inserting.
#     due_date is always a Python date object (never a string).
#     """
#     from app.models.fee import FeeInvoice

#     fee_amount = float(admission.fee_amount or 0)
#     if fee_amount <= 0:
#         return

#     invoice_no = f"INV-{admission.admission_number}"

#     # Idempotency check
#     existing = await db.execute(
#         select(FeeInvoice).where(
#             FeeInvoice.tenant_id  == admission.tenant_id,
#             FeeInvoice.invoice_no == invoice_no,
#         )
#     )
#     if existing.scalar_one_or_none():
#         return

#     # Resolve student_id if not passed
#     if not student_id:
#         stu_result = await db.execute(
#             select(Student).where(
#                 Student.tenant_id    == admission.tenant_id,
#                 Student.admission_id == admission.id,
#             )
#         )
#         stu = stu_result.scalar_one_or_none()
#         if stu:
#             student_id = str(stu.id)

#     if not student_id:
#         return  # can't create invoice without a student

#     fee_paid = float(admission.fee_paid or 0)

#     # Derive status
#     if fee_paid >= fee_amount:
#         status = "paid"
#     elif fee_paid > 0:
#         status = "partial"
#     else:
#         status = "pending"

#     # ✅ due_date must be a Python date object — never a string
#     due_date: date_type = date_type(datetime.now().year, 12, 31)
#     if admission.payment_installment_schedule:
#         try:
#             sched = json.loads(admission.payment_installment_schedule)
#             slots = sched.get("installmentSchedule", [])
#             if slots and slots[0].get("due_date"):
#                 due_date = date_type.fromisoformat(slots[0]["due_date"])
#         except Exception:
#             pass

#     invoice = FeeInvoice(
#         id          = uuid.uuid4(),
#         tenant_id   = admission.tenant_id,
#         student_id  = student_id,
#         invoice_no  = invoice_no,
#         amount_due  = fee_amount,
#         amount_paid = fee_paid,
#         discount    = 0,
#         due_date    = due_date,  # ✅ date object, not string
#         status      = status,
#     )
#     db.add(invoice)
async def _maybe_create_fee_invoice(
    db: AsyncSession,
    admission: Admission,
    student_id: str | None = None,
) -> None:
    """
    Create FeeInvoice rows from admission fee data.
    - If the admission has installments → one row per installment slot.
    - Otherwise → one row for the total fee.
    Idempotent in both cases (checks invoice_no before inserting).
    due_date is always a Python date object (never a string).
    """
    from app.models.fee import FeeInvoice

    fee_amount = float(admission.fee_amount or 0)
    if fee_amount <= 0:
        return

    # Resolve student_id if not passed
    if not student_id:
        stu_result = await db.execute(
            select(Student).where(
                Student.tenant_id    == admission.tenant_id,
                Student.admission_id == admission.id,
            )
        )
        stu = stu_result.scalar_one_or_none()
        if stu:
            student_id = str(stu.id)

    if not student_id:
        return  # can't create invoice without a student

    # Parse payment JSON once
    payment_data: dict = {}
    installment_slots: list[dict] = []
    has_installments = False

    if admission.payment_installment_schedule:
        try:
            payment_data      = json.loads(admission.payment_installment_schedule)
            has_installments  = payment_data.get("hasInstallments", False)
            installment_slots = payment_data.get("installmentSchedule", [])
        except Exception:
            pass

    # ── CASE 1: per-installment invoices ──────────────────────
    if has_installments and installment_slots:
        for slot in installment_slots:
            slot_num   = slot.get("number", 1)
            invoice_no = f"INV-{admission.admission_number}-I{str(slot_num).zfill(2)}"

            # Idempotency check
            existing = await db.execute(
                select(FeeInvoice).where(
                    FeeInvoice.tenant_id  == admission.tenant_id,
                    FeeInvoice.invoice_no == invoice_no,
                )
            )
            if existing.scalar_one_or_none():
                continue  # already exists, skip this slot

            slot_amount = float(slot.get("amount", 0))
            if slot_amount <= 0:
                continue

            # due_date — must be a date object
            due_date_raw = slot.get("due_date") or slot.get("dueDate")
            try:
                due_date: date_type = date_type.fromisoformat(due_date_raw)
            except Exception:
                due_date = date_type(datetime.now().year, 12, 31)

            # Per-slot paid / status
            slot_paid   = slot.get("paid", False)
            amount_paid = slot_amount if slot_paid else 0.0
            if slot_paid:
                status = "paid"
            else:
                today = datetime.now().date()
                status = "overdue" if due_date < today else "pending"

            invoice = FeeInvoice(
                id          = uuid.uuid4(),
                tenant_id   = admission.tenant_id,
                student_id  = student_id,
                invoice_no  = invoice_no,
                amount_due  = slot_amount,
                amount_paid = amount_paid,
                discount    = 0,
                due_date    = due_date,
                status      = status,
            )
            db.add(invoice)

        return  # done — don't fall through to single-invoice logic

    # ── CASE 2: single invoice for the full fee ────────────────
    invoice_no = f"INV-{admission.admission_number}"

    existing = await db.execute(
        select(FeeInvoice).where(
            FeeInvoice.tenant_id  == admission.tenant_id,
            FeeInvoice.invoice_no == invoice_no,
        )
    )
    if existing.scalar_one_or_none():
        return

    fee_paid = float(admission.fee_paid or 0)

    if fee_paid >= fee_amount:
        status = "paid"
    elif fee_paid > 0:
        status = "partial"
    else:
        status = "pending"

    due_date = date_type(datetime.now().year, 12, 31)
    if installment_slots and installment_slots[0].get("due_date"):
        try:
            due_date = date_type.fromisoformat(installment_slots[0]["due_date"])
        except Exception:
            pass

    invoice = FeeInvoice(
        id          = uuid.uuid4(),
        tenant_id   = admission.tenant_id,
        student_id  = student_id,
        invoice_no  = invoice_no,
        amount_due  = fee_amount,
        amount_paid = fee_paid,
        discount    = 0,
        due_date    = due_date,
        status      = status,
        )
    db.add(invoice)


# ── Auto-create student ────────────────────────────────────────
async def _maybe_create_student(
    db: AsyncSession,
    admission: Admission,
) -> str | None:
    existing = await db.execute(
        select(Student).where(
            Student.tenant_id    == admission.tenant_id,
            Student.admission_id == admission.id,
        )
    )
    existing_student = existing.scalar_one_or_none()
    if existing_student:
        return str(existing_student.id)

    lead = None
    if admission.lead_id:
        from app.models.lead import Lead
        lead_result = await db.execute(
            select(Lead).where(Lead.id == admission.lead_id)
        )
        lead = lead_result.scalar_one_or_none()

    full_name  = (admission.student_name or "").strip()
    name_parts = full_name.split(" ", 1)
    first_name = name_parts[0] or "Unknown"
    last_name  = name_parts[1] if len(name_parts) > 1 else ""

    enrollment_no = f"STU-{admission.admission_number}-{str(admission.id)[:8]}"

    student = Student(
        id            = uuid.uuid4(),
        tenant_id     = admission.tenant_id,
        admission_id  = admission.id,
        enrollment_no = enrollment_no,
        first_name    = first_name,
        last_name     = last_name,
        current_class = admission.grade or "",
        is_active     = True,
        joined_at     = datetime.now().date(),
        email         = (lead.email                 if lead else None) or admission.email,
        phone         = (lead.phone                 if lead else None) or admission.phone,
        parent_name   = (lead.parent_name           if lead else None) or admission.parent_name,
        parent_phone  = (lead.parent_contact_number if lead else None) or admission.parent_phone,
        school_name   = (lead.school_name           if lead else None) or admission.school_name,
    )

    db.add(student)
    await db.flush()
    return str(student.id)


# ── Create admission ───────────────────────────────────────────
async def create_admission(
    db: AsyncSession, tenant_id: str, data: dict
) -> Admission:
    admission_number = await next_admission_no(db, tenant_id)

    payment   = data.pop("payment", None) or {}
    documents = data.pop("documents", None) or []

    docs_list = [
        d if isinstance(d, dict) else d.model_dump()
        for d in documents
    ]

    fee_amount = float(data.get("fee_amount") or payment.get("totalFee")  or 0)
    fee_paid   = float(data.get("fee_paid")   or payment.get("amountPaid") or 0)

    status = data.get("status", "PENDING_DOCS")

    admission = Admission(
        tenant_id           = tenant_id,
        admission_number    = admission_number,
        academic_year       = data.get("academic_year") or str(datetime.now().year),
        applied_course      = data.get("applied_course") or data.get("batchName") or "N/A",
        status              = status,
        documents_verified  = data.get("documents_verified", False),
        remarks             = data.get("remarks") or data.get("notes"),
        lead_id             = data.get("lead_id"),
        student_name        = data.get("student_name") or data.get("studentName"),
        grade               = data.get("grade", ""),
        board_name          = data.get("board_name"),
        batch_name          = data.get("batch_name"),
        subjects            = data.get("subjects", []),
        fee_amount          = fee_amount,
        fee_paid            = fee_paid,
        documents           = docs_list,
        payment_installment_schedule = _build_payment_json(payment) if payment else None,
        phone        = data.get("phone"),
        email        = data.get("email"),
        parent_name  = data.get("parent_name"),
        parent_phone = data.get("parent_phone"),
        school_name  = data.get("school_name"),
    )

    db.add(admission)
    await db.flush()

    student_id: str | None = None

    if status == "CONFIRMED":
        student_id = await _maybe_create_student(db, admission)

    if fee_amount > 0:
        await _maybe_create_fee_invoice(db, admission, student_id)

    await db.commit()
    await db.refresh(admission)
    return admission


# ── Update admission ───────────────────────────────────────────
async def update_admission(
    db: AsyncSession,
    tenant_id: str,
    admission_id: str,
    data: dict,
    updated_by: str,
) -> Admission:
    admission = await get_admission(db, tenant_id, admission_id)

    if updated_by:
        admission.updated_by = updated_by

    payment = data.pop("payment", None)
    if payment:
        payment_dict = payment if isinstance(payment, dict) else payment.model_dump()
        existing_raw = admission.payment_installment_schedule
        existing     = json.loads(existing_raw) if existing_raw else {}
        merged       = {**existing, **payment_dict}
        admission.payment_installment_schedule = _build_payment_json(merged)
        admission.fee_amount = float(payment_dict.get("totalFee",   admission.fee_amount or 0))
        admission.fee_paid   = float(payment_dict.get("amountPaid", admission.fee_paid   or 0))

    documents = data.pop("documents", None)
    if documents is not None:
        admission.documents = [
            d if isinstance(d, dict) else d.model_dump()
            for d in documents
        ]

    field_map = {
        "studentName": "student_name",
        "batchName":   "applied_course",
        "enrolledAt":  "approved_at",
        "enrolled_at": "approved_at",
        "board_name":  "board_name",
        "batch_name":  "batch_name",
    }
    prev_status = admission.status
    for key, val in data.items():
        if val is None:
            continue
        attr = field_map.get(key, key)
        if attr == "approved_at" and isinstance(val, str):
            try:
                val = datetime.fromisoformat(val.replace("Z", "+00:00"))
            except ValueError:
                val = None
        if hasattr(admission, attr):
            setattr(admission, attr, val)

    student_id: str | None = None
    new_status = data.get("status")
    if new_status == "CONFIRMED" and prev_status != "CONFIRMED":
        student_id = await _maybe_create_student(db, admission)

    fee_amount = float(admission.fee_amount or 0)
    if fee_amount > 0:
        await _maybe_create_fee_invoice(db, admission, student_id)

    await db.commit()
    await db.refresh(admission)
    return admission