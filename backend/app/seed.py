import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.class_model import ClassModel
from app.models.board import Board
from app.models.mode import Mode
from app.models.subject import Subject
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_data(db: Session):
    logger.info("Creating tables...")
    Base.metadata.create_all(bind=engine)

    # User
    user = db.query(User).filter(User.email == "admin@institute.com").first()
    if not user:
        user = User(
            full_name="Admin",
            email="admin@institute.com",
            hashed_password=get_password_hash("admin123")
        )
        db.add(user)
        logger.info("Created default admin user.")

    # Boards
    boards_data = ["CBSE", "ICSE", "State Board"]
    for board_name in boards_data:
        board = db.query(Board).filter(Board.name == board_name).first()
        if not board:
            db.add(Board(name=board_name))
            logger.info(f"Created board: {board_name}")

    # Modes
    modes_data = ["Online", "Offline"]
    for mode_name in modes_data:
        mode = db.query(Mode).filter(Mode.name == mode_name).first()
        if not mode:
            db.add(Mode(name=mode_name))
            logger.info(f"Created mode: {mode_name}")

    # Subjects
    subjects_data = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science", "Computer Science", "Science"]
    for subject_name in subjects_data:
        subject = db.query(Subject).filter(Subject.name == subject_name).first()
        if not subject:
            db.add(Subject(name=subject_name))
            logger.info(f"Created subject: {subject_name}")
    
    db.commit()

    # Classes
    classes_data = [
        ("Class 6", 1), ("Class 7", 2), ("Class 8", 3),
        ("Class 9", 4), ("Class 10", 5), ("Class 11", 6), ("Class 12", 7)
    ]
    for class_name, order in classes_data:
        class_obj = db.query(ClassModel).filter(ClassModel.name == class_name).first()
        if not class_obj:
            class_obj = ClassModel(name=class_name, display_order=order)
            db.add(class_obj)
            logger.info(f"Created class: {class_name}")
    
    db.commit()

    # Class-Subject mappings
    class_subject_map = {
        "Class 6": ["Mathematics", "English", "Hindi", "Social Science", "Science"],
        "Class 7": ["Mathematics", "English", "Hindi", "Social Science", "Science"],
        "Class 8": ["Mathematics", "English", "Hindi", "Social Science", "Science"],
        "Class 9": ["Mathematics", "Science", "English", "Hindi", "Social Science"],
        "Class 10": ["Mathematics", "Science", "English", "Hindi", "Social Science"],
        "Class 11": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
        "Class 12": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"]
    }

    for class_name, subject_names in class_subject_map.items():
        class_obj = db.query(ClassModel).filter(ClassModel.name == class_name).first()
        if class_obj:
            existing_subject_ids = {s.id for s in class_obj.subjects}
            for subject_name in subject_names:
                subject = db.query(Subject).filter(Subject.name == subject_name).first()
                if subject and subject.id not in existing_subject_ids:
                    class_obj.subjects.append(subject)
                    logger.info(f"Added {subject_name} to {class_name}")
    
    db.commit()
    logger.info("Seeding complete.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
