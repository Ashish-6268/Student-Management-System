def test_get_settings_master_data(client, auth_headers):
    # Test classes
    res = client.get("/api/v1/settings/classes", headers=auth_headers)
    assert res.status_code == 200
    classes = res.json()["data"]
    assert len(classes) >= 7
    assert any(c["name"] == "Class 10" for c in classes)

    # Test boards
    res = client.get("/api/v1/settings/boards", headers=auth_headers)
    assert res.status_code == 200
    boards = res.json()["data"]
    assert any(b["name"] == "CBSE" for b in boards)

    # Test modes
    res = client.get("/api/v1/settings/modes", headers=auth_headers)
    assert res.status_code == 200
    modes = res.json()["data"]
    assert any(m["name"] == "Online" for m in modes)
    assert any(m["name"] == "Offline" for m in modes)

    # Test subjects
    res = client.get("/api/v1/settings/subjects", headers=auth_headers)
    assert res.status_code == 200
    subjects = res.json()["data"]
    assert any(s["name"] == "Mathematics" for s in subjects)

def test_add_and_update_subject(client, auth_headers):
    # Add new subject
    res = client.post(
        "/api/v1/settings/subjects",
        json={"name": "Economics"},
        headers=auth_headers
    )
    assert res.status_code == 200
    sub_id = res.json()["data"]["id"]
    assert res.json()["data"]["name"] == "Economics"

    # Update subject
    res = client.put(
        f"/api/v1/settings/subjects/{sub_id}",
        json={"name": "Business Economics", "is_active": True},
        headers=auth_headers
    )
    assert res.status_code == 200
    assert res.json()["data"]["name"] == "Business Economics"

def test_class_subject_mapping(client, auth_headers):
    # Get subjects for Class 10 (id: 5)
    classes_res = client.get("/api/v1/settings/classes", headers=auth_headers)
    class_10 = next(c for c in classes_res.json()["data"] if c["name"] == "Class 10")
    class_id = class_10["id"]

    res = client.get(f"/api/v1/settings/classes/{class_id}/subjects", headers=auth_headers)
    assert res.status_code == 200
    initial_subjects = res.json()["data"]
    assert len(initial_subjects) > 0

    # Get all subjects
    all_subjects_res = client.get("/api/v1/settings/subjects", headers=auth_headers)
    all_sub_ids = [s["id"] for s in all_subjects_res.json()["data"][:3]]

    # Update mapping code-free via Settings API
    update_res = client.put(
        f"/api/v1/settings/classes/{class_id}/subjects",
        json={"subject_ids": all_sub_ids},
        headers=auth_headers
    )
    assert update_res.status_code == 200

    # Verify updated mapping
    verify_res = client.get(f"/api/v1/settings/classes/{class_id}/subjects", headers=auth_headers)
    assert verify_res.status_code == 200
    updated_ids = [s["id"] for s in verify_res.json()["data"]]
    assert set(updated_ids) == set(all_sub_ids)
