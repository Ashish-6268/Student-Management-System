from typing import TypeVar, Generic, Type, Any, Optional, List
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, db: Session, filters: dict = None) -> List[ModelType]:
        query = db.query(self.model)
        if filters:
            for key, value in filters.items():
                query = query.filter(getattr(self.model, key) == value)
        return query.all()

    def create(self, db: Session, data_dict: dict) -> ModelType:
        obj = self.model(**data_dict)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(self, db: Session, instance: ModelType, data_dict: dict) -> ModelType:
        for key, value in data_dict.items():
            setattr(instance, key, value)
        db.commit()
        db.refresh(instance)
        return instance
