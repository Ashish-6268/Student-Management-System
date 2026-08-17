from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.common import ResponseBase
from app.schemas.settings import ClassCreate, ClassUpdate, ClassResponse, BoardCreate, BoardUpdate, BoardResponse, ModeCreate, ModeUpdate, ModeResponse, SubjectCreate, SubjectUpdate, SubjectResponse, ClassSubjectUpdate
from app.services.settings_service import settings_service
from app.repositories.settings_repository import class_repo, board_repo, mode_repo, subject_repo

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/classes", response_model=ResponseBase)
def get_classes(db: Session = Depends(get_db)):
    classes = class_repo.get_all_classes(db, active_only=False)
    return ResponseBase(data=[ClassResponse.model_validate(c) for c in classes])

@router.post("/classes", response_model=ResponseBase)
def create_class(data: ClassCreate, db: Session = Depends(get_db)):
    res = settings_service.create_class(db, data.model_dump())
    return ResponseBase(data=ClassResponse.model_validate(res))

@router.put("/classes/{id}", response_model=ResponseBase)
def update_class(id: int, data: ClassUpdate, db: Session = Depends(get_db)):
    res = settings_service.update_class(db, id, data.model_dump(exclude_unset=True))
    return ResponseBase(data=ClassResponse.model_validate(res))

@router.get("/boards", response_model=ResponseBase)
def get_boards(db: Session = Depends(get_db)):
    boards = board_repo.get_all(db)
    return ResponseBase(data=[BoardResponse.model_validate(b) for b in boards])

@router.post("/boards", response_model=ResponseBase)
def create_board(data: BoardCreate, db: Session = Depends(get_db)):
    res = settings_service.create_board(db, data.model_dump())
    return ResponseBase(data=BoardResponse.model_validate(res))

@router.put("/boards/{id}", response_model=ResponseBase)
def update_board(id: int, data: BoardUpdate, db: Session = Depends(get_db)):
    res = settings_service.update_board(db, id, data.model_dump(exclude_unset=True))
    return ResponseBase(data=BoardResponse.model_validate(res))

@router.get("/modes", response_model=ResponseBase)
def get_modes(db: Session = Depends(get_db)):
    modes = mode_repo.get_all(db)
    return ResponseBase(data=[ModeResponse.model_validate(m) for m in modes])

@router.post("/modes", response_model=ResponseBase)
def create_mode(data: ModeCreate, db: Session = Depends(get_db)):
    res = settings_service.create_mode(db, data.model_dump())
    return ResponseBase(data=ModeResponse.model_validate(res))

@router.put("/modes/{id}", response_model=ResponseBase)
def update_mode(id: int, data: ModeUpdate, db: Session = Depends(get_db)):
    res = settings_service.update_mode(db, id, data.model_dump(exclude_unset=True))
    return ResponseBase(data=ModeResponse.model_validate(res))

@router.get("/subjects", response_model=ResponseBase)
def get_subjects(db: Session = Depends(get_db)):
    subjects = subject_repo.get_all(db)
    return ResponseBase(data=[SubjectResponse.model_validate(s) for s in subjects])

@router.post("/subjects", response_model=ResponseBase)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    res = settings_service.create_subject(db, data.model_dump())
    return ResponseBase(data=SubjectResponse.model_validate(res))

@router.put("/subjects/{id}", response_model=ResponseBase)
def update_subject(id: int, data: SubjectUpdate, db: Session = Depends(get_db)):
    res = settings_service.update_subject(db, id, data.model_dump(exclude_unset=True))
    return ResponseBase(data=SubjectResponse.model_validate(res))

@router.get("/classes/{id}/subjects", response_model=ResponseBase)
def get_class_subjects(id: int, db: Session = Depends(get_db)):
    subjects = subject_repo.get_class_subjects(db, id)
    return ResponseBase(data=[SubjectResponse.model_validate(s) for s in subjects])

@router.put("/classes/{id}/subjects", response_model=ResponseBase)
def set_class_subjects(id: int, data: ClassSubjectUpdate, db: Session = Depends(get_db)):
    settings_service.set_class_subjects(db, id, data.subject_ids)
    return ResponseBase(message="Class subjects updated successfully")
