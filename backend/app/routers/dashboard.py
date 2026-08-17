from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.common import ResponseBase
from app.services.dashboard_service import dashboard_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/stats", response_model=ResponseBase)
def get_stats(db: Session = Depends(get_db)):
    return ResponseBase(data=dashboard_service.get_dashboard_stats(db))

@router.get("/students-by-class", response_model=ResponseBase)
def get_students_by_class(db: Session = Depends(get_db)):
    return ResponseBase(data=dashboard_service.get_students_by_class(db))

@router.get("/students-by-board", response_model=ResponseBase)
def get_students_by_board(db: Session = Depends(get_db)):
    return ResponseBase(data=dashboard_service.get_students_by_board(db))

@router.get("/recent-students", response_model=ResponseBase)
def get_recent_students(db: Session = Depends(get_db)):
    return ResponseBase(data=dashboard_service.get_recent_students(db))
