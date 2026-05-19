# from pydantic import BaseModel
# from typing import Optional, List
# import uuid


# class SubjectCreate(BaseModel):
#     name: str
#     code: Optional[str] = None
#     description: Optional[str] = None


# class SubjectOut(BaseModel):
#     id: uuid.UUID
#     name: str
#     code: Optional[str] = None

#     class Config:
#         from_attributes = True


# # ── Syllabus Topic (belongs to Subject) ───────────────────────
# class SyllabusTopicCreate(BaseModel):
#     subject_id: uuid.UUID
#     title: str
#     description: Optional[str] = None
#     sort_order: Optional[int] = 0
#     parent_id: Optional[uuid.UUID] = None


# class SyllabusTopicUpdate(BaseModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     sort_order: Optional[int] = None


# class SyllabusTopicOut(BaseModel):
#     id: uuid.UUID
#     title: str
#     description: Optional[str] = None
#     sort_order: int = 0

#     class Config:
#         from_attributes = True


# # ── Syllabus Progress (completion per topic per batch) ─────────
# class SyllabusProgressUpdate(BaseModel):
#     status: str   # "not_started" | "in_progress" | "completed"
#     notes: Optional[str] = None


# class SyllabusTopicWithProgress(BaseModel):
#     """Topic + its progress record for a specific batch."""
#     id: uuid.UUID
#     title: str
#     description: Optional[str] = None
#     sort_order: int = 0
#     status: str = "not_started"
#     notes: Optional[str] = None
#     completed_at: Optional[str] = None
#     progress_id: Optional[uuid.UUID] = None


# # ── Batch ──────────────────────────────────────────────────────
# class BatchCreate(BaseModel):
#     name: str
#     code: Optional[str] = None
#     description: Optional[str] = None
#     target_exam: Optional[str] = None
#     academic_year: str
#     start_date: Optional[str] = None
#     end_date: Optional[str] = None
#     capacity: int = 50


# class BatchUpdate(BaseModel):
#     name: Optional[str] = None
#     description: Optional[str] = None
#     target_exam: Optional[str] = None
#     capacity: Optional[int] = None
#     is_active: Optional[bool] = None
#     end_date: Optional[str] = None


# class BatchOut(BaseModel):
#     id: uuid.UUID
#     name: str
#     code: Optional[str] = None
#     target_exam: Optional[str] = None
#     academic_year: str
#     start_date: Optional[str] = None
#     end_date: Optional[str] = None
#     capacity: int
#     is_active: bool
#     student_ids: List[str] = []   # enriched by service

#     class Config:
#         from_attributes = True


# # ── Class ──────────────────────────────────────────────────────
# class ClassCreate(BaseModel):
#     batch_id: uuid.UUID
#     subject_id: Optional[uuid.UUID] = None
#     tutor_id: Optional[uuid.UUID] = None
#     title: str
#     description: Optional[str] = None
#     scheduled_at: str
#     duration_min: int = 60
#     room_or_link: Optional[str] = None


# class ClassUpdate(BaseModel):
#     title: Optional[str] = None
#     scheduled_at: Optional[str] = None
#     duration_min: Optional[int] = None
#     room_or_link: Optional[str] = None
#     status: Optional[str] = None


# class ClassOut(BaseModel):
#     id: uuid.UUID
#     title: str
#     scheduled_at: str
#     duration_min: int
#     status: str
#     room_or_link: Optional[str] = None

#     class Config:
#         from_attributes = True

from pydantic import BaseModel, field_validator
from typing import Optional, List, Any
from datetime import date
import uuid


class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None


class SubjectOut(BaseModel):
    id: uuid.UUID
    name: str
    code: Optional[str] = None

    class Config:
        from_attributes = True


# ── Syllabus Topic ─────────────────────────────────────────────
class SyllabusTopicCreate(BaseModel):
    subject_id: uuid.UUID
    title: str
    description: Optional[str] = None
    sort_order: Optional[int] = 0
    parent_id: Optional[uuid.UUID] = None


class SyllabusTopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class SyllabusTopicOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    sort_order: int = 0

    class Config:
        from_attributes = True


# ── Syllabus Progress ──────────────────────────────────────────
class SyllabusProgressUpdate(BaseModel):
    status: str   # "not_started" | "in_progress" | "completed"
    notes: Optional[str] = None


class SyllabusTopicWithProgress(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    sort_order: int = 0
    status: str = "not_started"
    notes: Optional[str] = None
    completed_at: Optional[str] = None
    progress_id: Optional[uuid.UUID] = None


# ── Schedule slot (used inside BatchCreate/BatchOut) ───────────
class ScheduleSlot(BaseModel):
    """One recurring weekly slot for a batch."""
    day: str                        # "Monday" | "Tuesday" … | "Saturday" | "Sunday"
    start_time: str                 # "09:00"  (HH:MM, 24-hr)
    end_time: str                   # "10:30"
    room_or_link: Optional[str] = None   # physical room or online link


# ── Batch ──────────────────────────────────────────────────────
class BatchCreate(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    target_exam: Optional[str] = None
    academic_year: str

    # ✅ FIX: use date type so Pydantic parses "2026-05-01" → date object
    #         asyncpg receives a real date, not a string → no more DataError
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    capacity: int = 50

    # ✅ NEW: weekly recurring schedule
    schedule: Optional[List[ScheduleSlot]] = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: Any) -> Any:
        """Convert empty string "" to None so optional dates work cleanly."""
        if v == "":
            return None
        return v


class BatchUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_exam: Optional[str] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None

    # ✅ FIX: same fix for update
    end_date: Optional[date] = None

    # ✅ NEW: allow updating schedule
    schedule: Optional[List[ScheduleSlot]] = None

    @field_validator("end_date", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: Any) -> Any:
        if v == "":
            return None
        return v


class BatchOut(BaseModel):
    id: uuid.UUID
    name: str
    code: Optional[str] = None
    target_exam: Optional[str] = None
    academic_year: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    capacity: int
    is_active: bool
    student_ids: List[str] = []
    schedule: Optional[List[ScheduleSlot]] = None   # ✅ NEW

    class Config:
        from_attributes = True


# ── Class ──────────────────────────────────────────────────────
class ClassCreate(BaseModel):
    batch_id: uuid.UUID
    subject_id: Optional[uuid.UUID] = None
    tutor_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    scheduled_at: str
    duration_min: int = 60
    room_or_link: Optional[str] = None


class ClassUpdate(BaseModel):
    title: Optional[str] = None
    scheduled_at: Optional[str] = None
    duration_min: Optional[int] = None
    room_or_link: Optional[str] = None
    status: Optional[str] = None


class ClassOut(BaseModel):
    id: uuid.UUID
    title: str
    scheduled_at: str
    duration_min: int
    status: str
    room_or_link: Optional[str] = None

    class Config:
        from_attributes = True