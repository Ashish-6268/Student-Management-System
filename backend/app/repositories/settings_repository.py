from sqlalchemy.orm import Session
from app.models import ClassModel, Board, Mode, Subject, ClassSubject
from app.repositories.base_repository import BaseRepository
from typing import List

class ClassRepository(BaseRepository[ClassModel]):
    def __init__(self):
        super().__init__(ClassModel)
        
    def get_all_classes(self, db: Session, active_only: bool = True) -> List[ClassModel]:
        query = db.query(self.model)
        if active_only:
            query = query.filter(self.model.is_active == True)
        return query.order_by(self.model.display_order).all()

class BoardRepository(BaseRepository[Board]):
    def __init__(self):
        super().__init__(Board)

class ModeRepository(BaseRepository[Mode]):
    def __init__(self):
        super().__init__(Mode)

class SubjectRepository(BaseRepository[Subject]):
    def __init__(self):
        super().__init__(Subject)
        
    def get_class_subjects(self, db: Session, class_id: int) -> List[Subject]:
        return db.query(Subject).join(ClassSubject).filter(ClassSubject.class_id == class_id).all()
        
    def set_class_subjects(self, db: Session, class_id: int, subject_ids: List[int]):
        db.query(ClassSubject).filter(ClassSubject.class_id == class_id).delete()
        for sub_id in subject_ids:
            db.add(ClassSubject(class_id=class_id, subject_id=sub_id))
        db.commit()

class_repo = ClassRepository()
board_repo = BoardRepository()
mode_repo = ModeRepository()
subject_repo = SubjectRepository()
