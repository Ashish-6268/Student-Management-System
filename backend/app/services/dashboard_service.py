from sqlalchemy.orm import Session
from app.repositories.dashboard_repository import dashboard_repo
from app.schemas.dashboard import DashboardStats, ClassDistribution, BoardDistribution, RecentStudent

class DashboardService:
    def get_dashboard_stats(self, db: Session) -> DashboardStats:
        total = dashboard_repo.get_active_student_count(db)
        modes = dashboard_repo.get_mode_counts(db)
        online_count = modes.get("Online", 0) + modes.get("online", 0)
        offline_count = modes.get("Offline", 0) + modes.get("offline", 0)
        return DashboardStats(total_active=total, online_count=online_count, offline_count=offline_count)

    def get_students_by_class(self, db: Session) -> list[ClassDistribution]:
        data = dashboard_repo.get_students_by_class(db)
        return [ClassDistribution(class_name=row[0], count=row[1]) for row in data if row[0] is not None]

    def get_students_by_board(self, db: Session) -> list[BoardDistribution]:
        data = dashboard_repo.get_students_by_board(db)
        return [BoardDistribution(board_name=row[0], count=row[1]) for row in data if row[0] is not None]

    def get_recent_students(self, db: Session) -> list[RecentStudent]:
        students = dashboard_repo.get_recent_students(db)
        return [RecentStudent(id=s.id, roll_number=s.roll_number, name=s.name, class_name=s.class_model.name if s.class_model else "", created_at=s.created_at) for s in students]

dashboard_service = DashboardService()
