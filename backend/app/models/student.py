from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Student(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, autoincrement=True)
    roll_number = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    board_id = Column(Integer, ForeignKey('boards.id'), nullable=False)
    mode_id = Column(Integer, ForeignKey('modes.id'), nullable=False)
    email = Column(String(255), nullable=False)
    contact_number_1 = Column(String(10), nullable=False)
    contact_number_2 = Column(String(10), nullable=True)
    contact_number_3 = Column(String(10), nullable=True)
    remarks = Column(Text, nullable=True)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    class_ = relationship("ClassModel", back_populates="students")
    board = relationship("Board", back_populates="students")
    mode = relationship("Mode", back_populates="students")
    subjects = relationship("Subject", secondary="student_subjects", back_populates="students")
