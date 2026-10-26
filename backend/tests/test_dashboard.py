def test_dashboard_endpoints(client, auth_headers):
    # Test stats
    stats_res = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()["data"]
    assert "total_active" in stats
    assert "online_count" in stats
    assert "offline_count" in stats

    # Test students by class
    class_res = client.get("/api/v1/dashboard/students-by-class", headers=auth_headers)
    assert class_res.status_code == 200
    assert isinstance(class_res.json()["data"], list)

    # Test students by board
    board_res = client.get("/api/v1/dashboard/students-by-board", headers=auth_headers)
    assert board_res.status_code == 200
    assert isinstance(board_res.json()["data"], list)

    # Test recent students
    recent_res = client.get("/api/v1/dashboard/recent-students", headers=auth_headers)
    assert recent_res.status_code == 200
    recent = recent_res.json()["data"]
    assert isinstance(recent, list)
    assert len(recent) <= 5
