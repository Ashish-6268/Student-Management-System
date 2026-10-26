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

    @property
    def class_model(self):
        return self.class_

    @property
    def class_name(self) -> str | None:
        if hasattr(self, "_class_name") and self._class_name is not None:
            return self._class_name
        return self.class_.name if self.class_ else None

    @class_name.setter
    def class_name(self, value):
        self._class_name = value

    @property
    def board_name(self) -> str | None:
        if hasattr(self, "_board_name") and self._board_name is not None:
            return self._board_name
        return self.board.name if self.board else None

    @board_name.setter
    def board_name(self, value):
        self._board_name = value

    @property
    def mode_name(self) -> str | None:
        if hasattr(self, "_mode_name") and self._mode_name is not None:
            return self._mode_name
        return self.mode.name if self.mode else None

    @mode_name.setter
    def mode_name(self, value):
        self._mode_name = value


