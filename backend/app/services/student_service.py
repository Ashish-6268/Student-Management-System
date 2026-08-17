from sqlalchemy.orm import Session
from app.repositories.student_repository import student_repo
from app.repositories.settings_repository import class_repo, board_repo, mode_repo, subject_repo
from app.core.exceptions import ConflictException, NotFoundException, ArchivedStudentException, ValidationException

class StudentService:
    def get_students(self, db: Session, **kwargs):
        return student_repo.get_students(db, **kwargs)
        
    def get_student(self, db: Session, id: int):
        student = student_repo.get_student_by_id(db, id)
        if not student: raise NotFoundException("Student not found")
        return student

    def create_student(self, db: Session, data: dict, subject_ids: list[int]):
        if student_repo.get_student_by_roll_number(db, data["roll_number"]):
            raise ConflictException("Roll number already exists")
        
        if not class_repo.get(db, data["class_id"]): raise NotFoundException("Class not found")
        if not board_repo.get(db, data["board_id"]): raise NotFoundException("Board not found")
        if not mode_repo.get(db, data["mode_id"]): raise NotFoundException("Mode not found")
        
        class_subjects = {s.id for s in subject_repo.get_class_subjects(db, data["class_id"])}
        if not all(sid in class_subjects for sid in subject_ids):
            raise ValidationException("One or more subjects do not belong to the selected class")
            
        return student_repo.create_student(db, data, subject_ids)

    def update_student(self, db: Session, id: int, data: dict, subject_ids: list[int] = None):
        student = self.get_student(db, id)
        if student.is_archived:
            raise ArchivedStudentException("Cannot update an archived student")
            
        if "class_id" in data and data["class_id"] is not None and not class_repo.get(db, data["class_id"]):
            raise NotFoundException("Class not found")
        if "board_id" in data and data["board_id"] is not None and not board_repo.get(db, data["board_id"]):
            raise NotFoundException("Board not found")
        if "mode_id" in data and data["mode_id"] is not None and not mode_repo.get(db, data["mode_id"]):
            raise NotFoundException("Mode not found")
            
        cls_id = data.get("class_id", student.class_id)
        if subject_ids is not None:
            class_subjects = {s.id for s in subject_repo.get_class_subjects(db, cls_id)}
            if not all(sid in class_subjects for sid in subject_ids):
                raise ValidationException("One or more subjects do not belong to the selected class")
                
        return student_repo.update_student(db, student, data, subject_ids)

    def archive_student(self, db: Session, id: int):
        student = self.get_student(db, id)
        if student.is_archived:
            raise ConflictException("Student is already archived")
        return student_repo.archive_student(db, student)

    def restore_student(self, db: Session, id: int):
        student = self.get_student(db, id)
        if not student.is_archived:
            raise ConflictException("Student is not archived")
        return student_repo.restore_student(db, student)

student_service = StudentService()
