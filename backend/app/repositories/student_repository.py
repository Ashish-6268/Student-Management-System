from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from app.models import Student, StudentSubject, ClassModel
from app.repositories.base_repository import BaseRepository

class StudentRepository(BaseRepository[Student]):
    def __init__(self):
        super().__init__(Student)

    def get_students(self, db: Session, search: str = None, class_id: int = None, 
                     board_id: int = None, mode_id: int = None, subject_id: int = None, 
                     is_archived: bool = None, sort_by: str = None, sort_order: str = 'asc', 
                     page: int = 1, per_page: int = 10):
        query = db.query(Student).outerjoin(ClassModel)
        
        if search:
            query = query.filter(or_(Student.name.ilike(f"%{search}%"), Student.roll_number.ilike(f"%{search}%")))
        if class_id:
            query = query.filter(Student.class_id == class_id)
        if board_id:
            query = query.filter(Student.board_id == board_id)
        if mode_id:
            query = query.filter(Student.mode_id == mode_id)
        if is_archived is not None:
            query = query.filter(Student.is_archived == is_archived)
        if subject_id:
            query = query.join(StudentSubject).filter(StudentSubject.subject_id == subject_id)
            
        if sort_by == 'name':
            order_col = asc(Student.name) if sort_order == 'asc' else desc(Student.name)
        elif sort_by == 'roll_number':
            order_col = asc(Student.roll_number) if sort_order == 'asc' else desc(Student.roll_number)
        elif sort_by == 'class':
            order_col = asc(ClassModel.display_order) if sort_order == 'asc' else desc(ClassModel.display_order)
        else:
            order_col = desc(Student.created_at)
            
        query = query.order_by(order_col)
        total_count = query.count()
        offset = (page - 1) * per_page
        students = query.offset(offset).limit(per_page).all()
        return students, total_count

    def get_student_by_id(self, db: Session, id: int) -> Student:
        return db.query(Student).options(joinedload(Student.subjects)).filter(Student.id == id).first()

    def get_student_by_roll_number(self, db: Session, roll_number: str) -> Student:
        return db.query(Student).filter(Student.roll_number == roll_number).first()

    def create_student(self, db: Session, student_data: dict, subject_ids: list[int]) -> Student:
        student = Student(**student_data)
        db.add(student)
        db.flush()
        for sid in subject_ids:
            db.add(StudentSubject(student_id=student.id, subject_id=sid))
        db.commit()
        db.refresh(student)
        return student

    def update_student(self, db: Session, student: Student, update_data: dict, subject_ids: list[int] = None) -> Student:
        for k, v in update_data.items():
            setattr(student, k, v)
        if subject_ids is not None:
            db.query(StudentSubject).filter(StudentSubject.student_id == student.id).delete()
            for sid in subject_ids:
                db.add(StudentSubject(student_id=student.id, subject_id=sid))
        db.commit()
        db.refresh(student)
        return student

    def archive_student(self, db: Session, student: Student) -> Student:
        student.is_archived = True
        db.commit()
        db.refresh(student)
        return student

    def restore_student(self, db: Session, student: Student) -> Student:
        student.is_archived = False
        db.commit()
        db.refresh(student)
        return student

student_repo = StudentRepository()
