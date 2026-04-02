from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.errors import NotFoundError, ValidationError
from app.services.classroom import ClassroomService

router = APIRouter(prefix="/api/classroom", tags=["classroom"])

_service = ClassroomService()


# -- Models --------------------------------------------------------------------

class CreateClassroomRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    teacher_profile_id: str = Field(..., min_length=1)


class AddStudentRequest(BaseModel):
    student_profile_id: str = Field(..., min_length=1)


class CreateGroupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    student_ids: list[str] = Field(..., min_length=1)


class AssignQuestRequest(BaseModel):
    quest_id: str = Field(..., min_length=1)
    group_id: str | None = None


class AssignFocusRequest(BaseModel):
    skills: list[str] = Field(..., min_length=1)
    group_id: str | None = None


class UpdateSettingsRequest(BaseModel):
    time_limit_minutes: int | None = None
    status: str | None = None


# -- Routes --------------------------------------------------------------------

@router.post("/create", status_code=201)
async def create_classroom(body: CreateClassroomRequest):
    """Create a new classroom session."""
    try:
        return await _service.create_classroom(body.name, body.teacher_profile_id)
    except ValueError as e:
        raise ValidationError(str(e))


@router.get("/{classroom_id}/dashboard")
async def get_dashboard(classroom_id: str):
    """Teacher view — aggregated mastery data. NEVER raw learning events."""
    try:
        return await _service.get_dashboard(classroom_id)
    except ValueError as e:
        raise NotFoundError(str(e))


@router.post("/{classroom_id}/students", status_code=201)
async def add_student(classroom_id: str, body: AddStudentRequest):
    """Add a student to the classroom."""
    try:
        return await _service.add_student(classroom_id, body.student_profile_id)
    except ValueError as e:
        raise ValidationError(str(e))


@router.delete("/{classroom_id}/students/{student_id}")
async def remove_student(classroom_id: str, student_id: str):
    """Remove a student from the classroom."""
    try:
        await _service.remove_student(classroom_id, student_id)
        return {"status": "removed"}
    except ValueError as e:
        raise NotFoundError(str(e))


@router.get("/{classroom_id}/students")
async def get_students(classroom_id: str):
    """Student roster + mastery tier. NO raw events, NO ranking."""
    return {"students": await _service.get_students(classroom_id)}


@router.post("/{classroom_id}/groups", status_code=201)
async def create_group(classroom_id: str, body: CreateGroupRequest):
    """Create a student group."""
    try:
        return await _service.create_group(classroom_id, body.name, body.student_ids)
    except ValueError as e:
        raise ValidationError(str(e))


@router.get("/{classroom_id}/groups")
async def get_groups(classroom_id: str):
    """Get all groups in the classroom."""
    return {"groups": await _service.get_groups(classroom_id)}


@router.post("/{classroom_id}/assign/quest", status_code=201)
async def assign_quest(classroom_id: str, body: AssignQuestRequest):
    """Assign a quest to the whole class or a group."""
    return await _service.assign_quest(classroom_id, body.quest_id, body.group_id)


@router.post("/{classroom_id}/assign/focus", status_code=201)
async def assign_focus(classroom_id: str, body: AssignFocusRequest):
    """Assign focus skills to the class or a group."""
    return await _service.assign_focus(classroom_id, body.skills, body.group_id)


@router.get("/{classroom_id}/reports")
async def get_reports(classroom_id: str):
    """Class-wide mastery report — privacy-safe, no ranking."""
    try:
        return await _service.get_class_report(classroom_id)
    except ValueError as e:
        raise NotFoundError(str(e))


@router.put("/{classroom_id}/settings")
async def update_settings(classroom_id: str, body: UpdateSettingsRequest):
    """Update classroom settings (time limit, status)."""
    try:
        return await _service.update_settings(
            classroom_id,
            time_limit_minutes=body.time_limit_minutes,
            status=body.status,
        )
    except ValueError as e:
        raise ValidationError(str(e))
