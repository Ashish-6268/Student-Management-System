from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Student, ClassModel, Board, Mode

class DashboardRepository:
    def get_active_student_count(self, db: Session) -> int:
        return db.query(Student).filter(Student.is_archived == False).count()
        
    def get_mode_counts(self, db: Session) -> dict:
        results = db.query(Mode.name, func.count(Student.id)).outerjoin(Student, (Student.mode_id == Mode.id) & (Student.is_archived == False)).group_by(Mode.name).all()
        return {r[0]: r[1] for r in results}
        
    def get_students_by_class(self, db: Session) -> list:
        return db.query(ClassModel.name, func.count(Student.id)).outerjoin(Student, (Student.class_id == ClassModel.id) & (Student.is_archived == False)).group_by(ClassModel.name).all()
        
    def get_students_by_board(self, db: Session) -> list:
        return db.query(Board.name, func.count(Student.id)).outerjoin(Student, (Student.board_id == Board.id) & (Student.is_archived == False)).group_by(Board.name).all()
        
    def get_recent_students(self, db: Session, limit: int = 5) -> list:
        return db.query(Student).filter(Student.is_archived == False).order_by(Student.created_at.desc()).limit(limit).all()

dashboard_repo = DashboardRepository()
