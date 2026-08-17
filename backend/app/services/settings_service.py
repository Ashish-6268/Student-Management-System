from sqlalchemy.orm import Session
from app.repositories.settings_repository import class_repo, board_repo, mode_repo, subject_repo
from app.core.exceptions import ConflictException, NotFoundException

class SettingsService:
    def create_class(self, db: Session, data: dict):
        if class_repo.get_all(db, {"name": data["name"]}):
            raise ConflictException("Class name already exists")
        return class_repo.create(db, data)
        
    def update_class(self, db: Session, id: int, data: dict):
        cls = class_repo.get(db, id)
        if not cls: raise NotFoundException("Class not found")
        if "name" in data and class_repo.get_all(db, {"name": data["name"]}) and cls.name != data["name"]:
            raise ConflictException("Class name already exists")
        return class_repo.update(db, cls, data)

    def create_board(self, db: Session, data: dict):
        if board_repo.get_all(db, {"name": data["name"]}):
            raise ConflictException("Board name already exists")
        return board_repo.create(db, data)
        
    def update_board(self, db: Session, id: int, data: dict):
        b = board_repo.get(db, id)
        if not b: raise NotFoundException("Board not found")
        if "name" in data and board_repo.get_all(db, {"name": data["name"]}) and b.name != data["name"]:
            raise ConflictException("Board name already exists")
        return board_repo.update(db, b, data)

    def create_mode(self, db: Session, data: dict):
        if mode_repo.get_all(db, {"name": data["name"]}):
            raise ConflictException("Mode name already exists")
        return mode_repo.create(db, data)
        
    def update_mode(self, db: Session, id: int, data: dict):
        m = mode_repo.get(db, id)
        if not m: raise NotFoundException("Mode not found")
        if "name" in data and mode_repo.get_all(db, {"name": data["name"]}) and m.name != data["name"]:
            raise ConflictException("Mode name already exists")
        return mode_repo.update(db, m, data)

    def create_subject(self, db: Session, data: dict):
        if subject_repo.get_all(db, {"name": data["name"]}):
            raise ConflictException("Subject name already exists")
        return subject_repo.create(db, data)
        
    def update_subject(self, db: Session, id: int, data: dict):
        s = subject_repo.get(db, id)
        if not s: raise NotFoundException("Subject not found")
        if "name" in data and subject_repo.get_all(db, {"name": data["name"]}) and s.name != data["name"]:
            raise ConflictException("Subject name already exists")
        return subject_repo.update(db, s, data)

    def set_class_subjects(self, db: Session, class_id: int, subject_ids: list[int]):
        cls = class_repo.get(db, class_id)
        if not cls: raise NotFoundException("Class not found")
        for sid in subject_ids:
            if not subject_repo.get(db, sid):
                raise NotFoundException(f"Subject id {sid} not found")
        subject_repo.set_class_subjects(db, class_id, subject_ids)
        return {"success": True}

settings_service = SettingsService()
