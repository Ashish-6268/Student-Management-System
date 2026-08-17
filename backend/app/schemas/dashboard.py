from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DashboardStats(BaseModel):
    total_active: int
    online_count: int
    offline_count: int

class ClassDistribution(BaseModel):
    class_name: str
    count: int

class BoardDistribution(BaseModel):
    board_name: str
    count: int

class RecentStudent(BaseModel):
    id: int
    roll_number: str
    name: str
    class_name: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
