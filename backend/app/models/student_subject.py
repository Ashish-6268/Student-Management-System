from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.database import Base

class StudentSubject(Base):
    __tablename__ = 'student_subjects'

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (UniqueConstraint('student_id', 'subject_id', name='uq_student_subject'),)
