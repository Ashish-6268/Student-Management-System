from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.common import ResponseBase, PaginatedResponse
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentListResponse
from app.services.student_service import student_service
from typing import Optional

router = APIRouter(dependencies=[Depends(get_current_user)])

import math

@router.get("", response_model=PaginatedResponse)
@router.get("/", response_model=PaginatedResponse, include_in_schema=False)
def get_students(
    search: Optional[str] = None,
    class_id: Optional[int] = None,
    board_id: Optional[int] = None,
    mode_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    is_archived: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: str = 'asc',
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    students, total = student_service.get_students(
        db, search=search, class_id=class_id, board_id=board_id,
        mode_id=mode_id, subject_id=subject_id, is_archived=is_archived,
        sort_by=sort_by, sort_order=sort_order, page=page, per_page=per_page
    )
    
    data = []
    for s in students:
        s_data = StudentListResponse.model_validate({
            "id": s.id, "roll_number": s.roll_number, "name": s.name,
            "email": s.email, "contact_number_1": s.contact_number_1,
            "class_name": s.class_model.name if s.class_model else "",
            "board_name": s.board.name if s.board else "",
            "mode_name": s.mode.name if s.mode else "",
            "is_archived": s.is_archived, "created_at": s.created_at
        })
        data.append(s_data)
        
    pages = math.ceil(total / per_page) if per_page else 1
    return PaginatedResponse(
        data=data,
        meta={"total": total, "page": page, "per_page": per_page, "pages": pages}
    )

@router.post("", response_model=ResponseBase)
@router.post("/", response_model=ResponseBase, include_in_schema=False)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    student_data = data.model_dump(exclude={"subject_ids"})
    student = student_service.create_student(db, student_data, data.subject_ids)
    
    # Reload for response relationships
    student = student_service.get_student(db, student.id)
    student.class_name = student.class_model.name if student.class_model else None
    student.board_name = student.board.name if student.board else None
    student.mode_name = student.mode.name if student.mode else None
    
    return ResponseBase(data=StudentResponse.model_validate(student))

@router.get("/{id}", response_model=ResponseBase)
@router.get("/{id}/", response_model=ResponseBase, include_in_schema=False)
def get_student(id: int, db: Session = Depends(get_db)):
    student = student_service.get_student(db, id)
    student.class_name = student.class_model.name if student.class_model else None
    student.board_name = student.board.name if student.board else None
    student.mode_name = student.mode.name if student.mode else None
    return ResponseBase(data=StudentResponse.model_validate(student))

@router.put("/{id}", response_model=ResponseBase)
@router.put("/{id}/", response_model=ResponseBase, include_in_schema=False)
def update_student(id: int, data: StudentUpdate, db: Session = Depends(get_db)):
    update_data = data.model_dump(exclude_unset=True, exclude={"subject_ids"})
    student = student_service.update_student(db, id, update_data, data.subject_ids)
    
    student = student_service.get_student(db, student.id)
    student.class_name = student.class_model.name if student.class_model else None
    student.board_name = student.board.name if student.board else None
    student.mode_name = student.mode.name if student.mode else None
    
    return ResponseBase(data=StudentResponse.model_validate(student))

@router.patch("/{id}/archive", response_model=ResponseBase)
@router.patch("/{id}/archive/", response_model=ResponseBase, include_in_schema=False)
def archive_student(id: int, db: Session = Depends(get_db)):
    student_service.archive_student(db, id)
    return ResponseBase(message="Student archived successfully")

@router.patch("/{id}/restore", response_model=ResponseBase)
@router.patch("/{id}/restore/", response_model=ResponseBase, include_in_schema=False)
def restore_student(id: int, db: Session = Depends(get_db)):
    student_service.restore_student(db, id)
    return ResponseBase(message="Student restored successfully")
